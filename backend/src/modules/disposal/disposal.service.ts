import DisposalRepository = require("./disposal.repository.js");
import prisma = require("../../shared/prisma/prisma.js");
import prismaClientModule = require("../../../generated/prisma/index.js");
import ValidationError = require("../../shared/errors/ValidationError.js");
import NotFoundError = require("../../shared/errors/NotFoundError.js");
import ForbiddenError = require("../../shared/errors/ForbiddenError.js");
import ConflictError = require("../../shared/errors/ConflictError.js");
import type disposalTypes = require("./disposal.types.js");
import statusTransitions = require("../../shared/utils/statusTransitions.js");
import orchestrator = require("../../shared/utils/transactionOrchestration.js");
import AuditService = require("../../shared/services/audit.service.js");
import NotificationService = require("../../shared/services/notification.service.js");

class DisposalService {
  private readonly disposalRepository: DisposalRepository;

  constructor() {
    this.disposalRepository = new DisposalRepository();
  }

  private sanitizeDisposal(d: any): disposalTypes.DisposalResponse {
    return {
      id: d.id,
      equipmentAssetId: d.equipmentAssetId,
      disposalReason: d.disposalReason,
      status: d.status,
      remarks: d.remarks,
      approvedById: d.approvedById,
      disposedById: d.disposedById,
      disposalDate: d.disposalDate,
      bookValue: d.bookValue ? d.bookValue.toString() : null,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
      equipmentAsset: d.equipmentAsset ? {
        id: d.equipmentAsset.id,
        serialNumber: d.equipmentAsset.serialNumber,
        baseId: d.equipmentAsset.baseId,
        equipment: {
          id: d.equipmentAsset.equipment.id,
          name: d.equipmentAsset.equipment.name,
        },
      } : undefined,
      approvedBy: d.approvedBy ? {
        id: d.approvedBy.id,
        name: d.approvedBy.name,
        email: d.approvedBy.email,
      } : null,
      disposedBy: d.disposedBy ? {
        id: d.disposedBy.id,
        name: d.disposedBy.name,
        email: d.disposedBy.email,
      } : null,
    };
  }

  public async createDisposal(
    currentUser: prismaClientModule.User,
    data: any
  ): Promise<disposalTypes.DisposalResponse> {
    const asset = await prisma.equipmentAsset.findFirst({
      where: { id: data.equipmentAssetId, isActive: true },
    });
    if (!asset) {
      throw new NotFoundError(`Asset with ID '${data.equipmentAssetId}' not found or inactive`);
    }

    // Base scope check
    if (currentUser.role !== "ADMIN" && asset.baseId !== currentUser.baseId) {
      throw new ForbiddenError("Access Denied: Asset belongs to another base");
    }

    // Defense-in-depth checks
    if (asset.status === "RETIRED") {
      throw new ValidationError("Cannot dispose: Asset is already retired");
    }

    if (asset.status === "IN_TRANSIT") {
      throw new ValidationError("Cannot dispose: Asset is currently in transit");
    }

    // Check for active assignment
    const activeAssign = await prisma.assignment.findFirst({
      where: { equipmentAssetId: data.equipmentAssetId, status: "ACTIVE" },
    });
    if (activeAssign) {
      throw new ConflictError("Cannot dispose: Asset is currently assigned to personnel");
    }

    // Check for active maintenance record
    const activeMaint = await prisma.maintenance.findFirst({
      where: {
        equipmentAssetId: data.equipmentAssetId,
        status: { in: ["SCHEDULED", "IN_PROGRESS"] },
        isActive: true,
      },
    });
    if (activeMaint) {
      throw new ConflictError("Cannot dispose: Asset is currently undergoing maintenance");
    }

    // Prevent duplicate disposal requests
    const existingDisposal = await prisma.disposal.findFirst({
      where: {
        equipmentAssetId: data.equipmentAssetId,
        status: { in: ["PENDING", "APPROVED", "COMPLETED"] },
      },
    });
    if (existingDisposal) {
      throw new ConflictError("Cannot dispose: Asset already has a pending or completed disposal record");
    }

    const created = await this.disposalRepository.create({
      equipmentAssetId: data.equipmentAssetId,
      disposalReason: data.disposalReason,
      status: "PENDING",
      bookValue: data.bookValue ? new prismaClientModule.Prisma.Decimal(data.bookValue) : null,
      remarks: data.remarks ? data.remarks.trim() : null,
    });

    const populated = await this.disposalRepository.findById(created.id);
    return this.sanitizeDisposal(populated!);
  }

  public async approveDisposal(
    currentUser: prismaClientModule.User,
    id: string
  ): Promise<disposalTypes.DisposalResponse> {
    const record = await this.disposalRepository.findById(id);
    if (!record) {
      throw new NotFoundError("Disposal record not found");
    }

    if (record.status !== "PENDING") {
      throw new ValidationError(`Cannot approve disposal: Record is in status '${record.status}' (expected PENDING)`);
    }

    // Scope check
    if (currentUser.role !== "ADMIN" && (record as any).equipmentAsset.baseId !== currentUser.baseId) {
      throw new ForbiddenError("Access Denied: Associated asset belongs to another base");
    }

    const updated = await this.disposalRepository.update(id, {
      status: "APPROVED",
      approvedById: currentUser.id,
    });

    const populated = await this.disposalRepository.findById(updated.id);

    await AuditService.logAction({
      userId: currentUser.id,
      performedByType: "USER",
      module: "DISPOSAL",
      action: "DISPOSAL_APPROVE",
      entityType: "Disposal",
      entityId: id,
      oldValues: { status: "PENDING" },
      newValues: { status: "APPROVED" },
    });

    await NotificationService.createNotification({
      userId: currentUser.id,
      title: "Disposal Request Approved",
      message: `Disposal request for asset ${(populated as any)?.equipmentAsset?.serialNumber} has been approved.`,
      type: "DISPOSAL",
      priority: "MEDIUM",
      actionUrl: `/disposal/${id}`,
    });

    return this.sanitizeDisposal(populated!);
  }

  public async completeDisposal(
    currentUser: prismaClientModule.User,
    id: string,
    body: any
  ): Promise<disposalTypes.DisposalResponse> {
    const record = await this.disposalRepository.findById(id);
    if (!record) {
      throw new NotFoundError("Disposal record not found");
    }

    if (record.status !== "APPROVED") {
      throw new ValidationError(`Cannot complete disposal: Record is in status '${record.status}' (expected APPROVED)`);
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

    // Re-verify defense-in-depth checks
    if (asset.status === "RETIRED") {
      throw new ValidationError("Cannot complete disposal: Asset is already retired");
    }
    if (asset.status === "IN_TRANSIT") {
      throw new ValidationError("Cannot complete disposal: Asset is currently in transit");
    }

    const activeAssign = await prisma.assignment.findFirst({
      where: { equipmentAssetId: record.equipmentAssetId, status: "ACTIVE" },
    });
    if (activeAssign) {
      throw new ConflictError("Cannot complete disposal: Asset is currently assigned to personnel");
    }

    const activeMaint = await prisma.maintenance.findFirst({
      where: {
        equipmentAssetId: record.equipmentAssetId,
        status: { in: ["SCHEDULED", "IN_PROGRESS"] },
        isActive: true,
      },
    });
    if (activeMaint) {
      throw new ConflictError("Cannot complete disposal: Asset is currently undergoing maintenance");
    }

    // Validate status transition: AVAILABLE -> RETIRED
    const nextStatus = statusTransitions.validateStatusTransition(asset.status, "DISPOSE");

    await orchestrator.orchestrateAssetTransaction({
      assetId: record.equipmentAssetId,
      assetUpdates: {
        status: nextStatus,
        isActive: false, // Mark asset as soft-deleted upon completion
      },
      movement: {
        movementType: "DISPOSAL",
        sourceBaseId: asset.baseId,
        referenceType: "DISPOSAL",
        referenceId: id,
        performedById: currentUser.id,
        remarks: body.remarks || record.remarks || `Disposed: Reason - ${record.disposalReason}`,
      },
      additionalOperations: async (tx) => {
        await tx.disposal.update({
          where: { id },
          data: {
            status: "COMPLETED",
            disposedById: currentUser.id,
            disposalDate: body.disposalDate ? new Date(body.disposalDate) : new Date(),
            remarks: body.remarks ? body.remarks.trim() : record.remarks,
          },
        });
      },
    });

    const populated = await this.disposalRepository.findById(id);

    await AuditService.logAction({
      userId: currentUser.id,
      performedByType: "USER",
      module: "DISPOSAL",
      action: "DISPOSAL_COMPLETE",
      entityType: "Disposal",
      entityId: id,
      oldValues: { status: "APPROVED" },
      newValues: { status: "COMPLETED" },
    });

    await NotificationService.createNotification({
      userId: currentUser.id,
      title: "Disposal Completed",
      message: `Disposal of asset ${(populated as any)?.equipmentAsset?.serialNumber} has been completed.`,
      type: "DISPOSAL",
      priority: "HIGH",
      actionUrl: `/disposal/${id}`,
    });

    return this.sanitizeDisposal(populated!);
  }

  public async cancelDisposal(
    currentUser: prismaClientModule.User,
    id: string,
    body: any
  ): Promise<disposalTypes.DisposalResponse> {
    const record = await this.disposalRepository.findById(id);
    if (!record) {
      throw new NotFoundError("Disposal record not found");
    }

    if (record.status !== "PENDING" && record.status !== "APPROVED") {
      throw new ValidationError(`Cannot cancel disposal: Record is in status '${record.status}' (only PENDING or APPROVED can be cancelled)`);
    }

    // Scope check
    if (currentUser.role !== "ADMIN" && (record as any).equipmentAsset.baseId !== currentUser.baseId) {
      throw new ForbiddenError("Access Denied: Associated asset belongs to another base");
    }

    const updated = await this.disposalRepository.update(id, {
      status: "CANCELLED",
      remarks: body.remarks ? body.remarks.trim() : record.remarks,
    });

    const populated = await this.disposalRepository.findById(updated.id);
    return this.sanitizeDisposal(populated!);
  }

  public async getDisposalById(
    currentUser: prismaClientModule.User,
    id: string
  ): Promise<disposalTypes.DisposalResponse> {
    const record = await this.disposalRepository.findById(id);
    if (!record) {
      throw new NotFoundError("Disposal record not found");
    }

    // Base scope check
    if (currentUser.role === "BASE_COMMANDER" || currentUser.role === "LOGISTICS_OFFICER") {
      if ((record as any).equipmentAsset.baseId !== currentUser.baseId) {
        throw new ForbiddenError("Access Denied: Associated asset belongs to another base");
      }
    }

    return this.sanitizeDisposal(record);
  }

  public async getDisposals(
    currentUser: prismaClientModule.User,
    queryParams: any
  ): Promise<disposalTypes.PaginatedDisposal> {
    const page = queryParams.page ?? 1;
    const limit = queryParams.limit ?? 10;
    const sortBy = queryParams.sortBy ?? "createdAt";
    const sortOrder = queryParams.sortOrder ?? "desc";
    const search = queryParams.search ? queryParams.search.trim() : undefined;

    const where: prismaClientModule.Prisma.DisposalWhereInput = {};

    // Apply base scoping
    if (currentUser.role === "BASE_COMMANDER" || currentUser.role === "LOGISTICS_OFFICER") {
      if (!currentUser.baseId) {
        throw new ForbiddenError("Access Denied: User not assigned to a base");
      }
      where.equipmentAsset = { baseId: currentUser.baseId };
    } else if (currentUser.role === "ADMIN" && queryParams.baseId) {
      where.equipmentAsset = { baseId: queryParams.baseId };
    }

    if (queryParams.status) {
      where.status = queryParams.status;
    }

    if (queryParams.disposalReason) {
      where.disposalReason = queryParams.disposalReason;
    }

    if (search) {
      where.OR = [
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

    const { disposals, total } = await this.disposalRepository.findMany(where, {
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      disposals: disposals.map((d) => this.sanitizeDisposal(d)),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
      },
    };
  }
}

export = DisposalService;
