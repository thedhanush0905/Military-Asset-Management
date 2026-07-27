import MaintenanceRepository = require("./maintenance.repository.js");
import prisma = require("../../shared/prisma/prisma.js");
import prismaClientModule = require("../../../generated/prisma/index.js");
import ValidationError = require("../../shared/errors/ValidationError.js");
import NotFoundError = require("../../shared/errors/NotFoundError.js");
import ForbiddenError = require("../../shared/errors/ForbiddenError.js");
import ConflictError = require("../../shared/errors/ConflictError.js");
import type maintenanceTypes = require("./maintenance.types.js");
import statusTransitions = require("../../shared/utils/statusTransitions.js");
import orchestrator = require("../../shared/utils/transactionOrchestration.js");

class MaintenanceService {
  private readonly maintenanceRepository: MaintenanceRepository;

  constructor() {
    this.maintenanceRepository = new MaintenanceRepository();
  }

  private sanitizeMaintenance(m: any): maintenanceTypes.MaintenanceResponse {
    return {
      id: m.id,
      equipmentAssetId: m.equipmentAssetId,
      maintenanceType: m.maintenanceType,
      status: m.status,
      description: m.description,
      scheduledDate: m.scheduledDate,
      expectedCompletionDate: m.expectedCompletionDate,
      startedAt: m.startedAt,
      completedAt: m.completedAt,
      vendorName: m.vendorName,
      technicianName: m.technicianName,
      estimatedCost: m.estimatedCost ? m.estimatedCost.toString() : null,
      actualCost: m.actualCost ? m.actualCost.toString() : null,
      remarks: m.remarks,
      createdById: m.createdById,
      completedById: m.completedById,
      isActive: m.isActive,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
      equipmentAsset: m.equipmentAsset ? {
        id: m.equipmentAsset.id,
        serialNumber: m.equipmentAsset.serialNumber,
        baseId: m.equipmentAsset.baseId,
        equipment: {
          id: m.equipmentAsset.equipment.id,
          name: m.equipmentAsset.equipment.name,
        },
      } : undefined,
      createdBy: m.createdBy ? {
        id: m.createdBy.id,
        name: m.createdBy.name,
        email: m.createdBy.email,
      } : undefined,
      completedBy: m.completedBy ? {
        id: m.completedBy.id,
        name: m.completedBy.name,
        email: m.completedBy.email,
      } : null,
    };
  }

  public async scheduleMaintenance(
    currentUser: prismaClientModule.User,
    data: any
  ): Promise<maintenanceTypes.MaintenanceResponse> {
    const asset = await prisma.equipmentAsset.findFirst({
      where: { id: data.equipmentAssetId, isActive: true },
    });
    if (!asset) {
      throw new NotFoundError(`Asset with ID '${data.equipmentAssetId}' not found or inactive`);
    }

    // Scope check
    if (currentUser.role !== "ADMIN" && asset.baseId !== currentUser.baseId) {
      throw new ForbiddenError("Access Denied: Asset belongs to another base");
    }

    // Asset status checks
    if (asset.status === "LOST" || asset.status === "RETIRED") {
      throw new ValidationError(`Cannot schedule maintenance: Asset is in '${asset.status}' state`);
    }

    // Enforce only one active workflow (duplicate schedule block)
    const existingActive = await this.maintenanceRepository.findActiveByAssetId(data.equipmentAssetId);
    if (existingActive) {
      throw new ConflictError("Cannot schedule: Asset already has an active or scheduled maintenance record");
    }

    const created = await this.maintenanceRepository.create({
      equipmentAssetId: data.equipmentAssetId,
      maintenanceType: data.maintenanceType,
      status: "SCHEDULED",
      description: data.description,
      scheduledDate: new Date(data.scheduledDate),
      expectedCompletionDate: data.expectedCompletionDate ? new Date(data.expectedCompletionDate) : null,
      estimatedCost: data.estimatedCost ? new prismaClientModule.Prisma.Decimal(data.estimatedCost) : null,
      remarks: data.remarks ? data.remarks.trim() : null,
      createdById: currentUser.id,
      isActive: true,
    });

    const populated = await this.maintenanceRepository.findById(created.id);
    return this.sanitizeMaintenance(populated!);
  }

  public async startMaintenance(
    currentUser: prismaClientModule.User,
    id: string,
    body: any
  ): Promise<maintenanceTypes.MaintenanceResponse> {
    const record = await this.maintenanceRepository.findById(id);
    if (!record) {
      throw new NotFoundError("Maintenance record not found");
    }

    if (record.status !== "SCHEDULED") {
      throw new ValidationError(`Cannot start maintenance: Record is currently in status '${record.status}' (expected SCHEDULED)`);
    }

    const asset = await prisma.equipmentAsset.findFirst({
      where: { id: record.equipmentAssetId, isActive: true },
    });
    if (!asset) {
      throw new NotFoundError("Associated asset not found or inactive");
    }

    // Scope check
    if (currentUser.role !== "ADMIN" && asset.baseId !== currentUser.baseId) {
      throw new ForbiddenError("Access Denied: Associated asset belongs to another base");
    }

    // Validate status transition: AVAILABLE -> MAINTENANCE
    const nextStatus = statusTransitions.validateStatusTransition(asset.status, "START_MAINTENANCE");

    await orchestrator.orchestrateAssetTransaction({
      assetId: record.equipmentAssetId,
      assetUpdates: {
        status: nextStatus,
      },
      movement: {
        movementType: "MAINTENANCE_START",
        sourceBaseId: asset.baseId,
        referenceType: "MAINTENANCE",
        referenceId: id,
        performedById: currentUser.id,
        remarks: body.remarks || record.remarks || "Maintenance started",
      },
      additionalOperations: async (tx) => {
        await tx.maintenance.update({
          where: { id },
          data: {
            status: "IN_PROGRESS",
            startedAt: body.startedAt ? new Date(body.startedAt) : new Date(),
            vendorName: body.vendorName ? body.vendorName.trim() : null,
            technicianName: body.technicianName ? body.technicianName.trim() : null,
            remarks: body.remarks ? body.remarks.trim() : record.remarks,
          },
        });
      },
    });

    const updated = await this.maintenanceRepository.findById(id);
    return this.sanitizeMaintenance(updated!);
  }

  public async completeMaintenance(
    currentUser: prismaClientModule.User,
    id: string,
    body: any
  ): Promise<maintenanceTypes.MaintenanceResponse> {
    const record = await this.maintenanceRepository.findById(id);
    if (!record) {
      throw new NotFoundError("Maintenance record not found");
    }

    if (record.status !== "IN_PROGRESS") {
      throw new ValidationError(`Cannot complete maintenance: Record is in status '${record.status}' (expected IN_PROGRESS)`);
    }

    const asset = await prisma.equipmentAsset.findFirst({
      where: { id: record.equipmentAssetId, isActive: true },
    });
    if (!asset) {
      throw new NotFoundError("Associated asset not found or inactive");
    }

    // Scope check
    if (currentUser.role !== "ADMIN" && asset.baseId !== currentUser.baseId) {
      throw new ForbiddenError("Access Denied: Associated asset belongs to another base");
    }

    // Validate status transition: MAINTENANCE -> AVAILABLE
    const nextStatus = statusTransitions.validateStatusTransition(asset.status, "COMPLETE_MAINTENANCE");

    await orchestrator.orchestrateAssetTransaction({
      assetId: record.equipmentAssetId,
      assetUpdates: {
        status: nextStatus,
      },
      movement: {
        movementType: "MAINTENANCE_COMPLETE",
        sourceBaseId: asset.baseId,
        referenceType: "MAINTENANCE",
        referenceId: id,
        performedById: currentUser.id,
        remarks: body.remarks || record.remarks || "Maintenance completed",
      },
      additionalOperations: async (tx) => {
        await tx.maintenance.update({
          where: { id },
          data: {
            status: "COMPLETED",
            completedAt: body.completedAt ? new Date(body.completedAt) : new Date(),
            completedById: currentUser.id,
            actualCost: body.actualCost ? new prismaClientModule.Prisma.Decimal(body.actualCost) : null,
            remarks: body.remarks ? body.remarks.trim() : record.remarks,
          },
        });
      },
    });

    const updated = await this.maintenanceRepository.findById(id);
    return this.sanitizeMaintenance(updated!);
  }

  public async cancelMaintenance(
    currentUser: prismaClientModule.User,
    id: string,
    body: any
  ): Promise<maintenanceTypes.MaintenanceResponse> {
    const record = await this.maintenanceRepository.findById(id);
    if (!record) {
      throw new NotFoundError("Maintenance record not found");
    }

    if (record.status !== "SCHEDULED") {
      throw new ValidationError(`Cannot cancel maintenance: Record is in status '${record.status}' (only SCHEDULED can be cancelled)`);
    }

    const asset = await prisma.equipmentAsset.findFirst({
      where: { id: record.equipmentAssetId, isActive: true },
    });
    if (!asset) {
      throw new NotFoundError("Associated asset not found or inactive");
    }

    // Scope check
    if (currentUser.role !== "ADMIN" && asset.baseId !== currentUser.baseId) {
      throw new ForbiddenError("Access Denied: Associated asset belongs to another base");
    }

    const updated = await this.maintenanceRepository.update(id, {
      status: "CANCELLED",
      remarks: body.remarks ? body.remarks.trim() : record.remarks,
    });

    const populated = await this.maintenanceRepository.findById(updated.id);
    return this.sanitizeMaintenance(populated!);
  }

  public async getMaintenanceById(
    currentUser: prismaClientModule.User,
    id: string
  ): Promise<maintenanceTypes.MaintenanceResponse> {
    const record = await this.maintenanceRepository.findById(id);
    if (!record) {
      throw new NotFoundError("Maintenance record not found");
    }

    // Base scope check
    if (currentUser.role === "BASE_COMMANDER" || currentUser.role === "LOGISTICS_OFFICER") {
      if ((record as any).equipmentAsset.baseId !== currentUser.baseId) {
        throw new ForbiddenError("Access Denied: Associated asset belongs to another base");
      }
    }

    return this.sanitizeMaintenance(record);
  }

  public async getMaintenances(
    currentUser: prismaClientModule.User,
    queryParams: any
  ): Promise<maintenanceTypes.PaginatedMaintenance> {
    const page = queryParams.page ?? 1;
    const limit = queryParams.limit ?? 10;
    const sortBy = queryParams.sortBy ?? "createdAt";
    const sortOrder = queryParams.sortOrder ?? "desc";
    const search = queryParams.search ? queryParams.search.trim() : undefined;

    const where: prismaClientModule.Prisma.MaintenanceWhereInput = { isActive: true };

    // Apply base scoping
    if (currentUser.role === "BASE_COMMANDER" || currentUser.role === "LOGISTICS_OFFICER") {
      if (!currentUser.baseId) {
        throw new ForbiddenError("Access Denied: User not assigned to a base");
      }
      where.equipmentAsset = { baseId: currentUser.baseId };
    } else if (currentUser.role === "ADMIN" && queryParams.baseId) {
      where.equipmentAsset = { baseId: queryParams.baseId };
    }

    if (queryParams.equipmentAssetId) {
      where.equipmentAssetId = queryParams.equipmentAssetId;
    }

    if (queryParams.maintenanceType) {
      where.maintenanceType = queryParams.maintenanceType;
    }

    if (queryParams.status) {
      where.status = queryParams.status;
    }

    if (search) {
      where.OR = [
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          remarks: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          equipmentAsset: {
            serialNumber: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    const { maintenances, total } = await this.maintenanceRepository.findMany(where, {
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      maintenances: maintenances.map((m) => this.sanitizeMaintenance(m)),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
      },
    };
  }
}

export = MaintenanceService;
