import ProcurementRepository = require("./procurement.repository.js");
import prisma = require("../../shared/prisma/prisma.js");
import prismaClientModule = require("../../../generated/prisma/index.js");
import ValidationError = require("../../shared/errors/ValidationError.js");
import NotFoundError = require("../../shared/errors/NotFoundError.js");
import ForbiddenError = require("../../shared/errors/ForbiddenError.js");
import ConflictError = require("../../shared/errors/ConflictError.js");
import type procurementTypes = require("./procurement.types.js");
import syncInventory = require("../../shared/utils/inventorySync.js");
import AuditService = require("../../shared/services/audit.service.js");
import NotificationService = require("../../shared/services/notification.service.js");

class ProcurementService {
  private readonly procurementRepository: ProcurementRepository;

  constructor() {
    this.procurementRepository = new ProcurementRepository();
  }

  private sanitizeProcurement(p: any): procurementTypes.ProcurementResponse {
    return {
      id: p.id,
      procurementNumber: p.procurementNumber,
      supplier: p.supplier,
      status: p.status,
      purchaseDate: p.purchaseDate,
      expectedDeliveryDate: p.expectedDeliveryDate,
      receivedDate: p.receivedDate,
      totalCost: p.totalCost ? p.totalCost.toString() : "0.00",
      remarks: p.remarks,
      baseId: p.baseId,
      createdById: p.createdById,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      items: p.items ? p.items.map((i: any) => ({
        id: i.id,
        procurementId: i.procurementId,
        equipmentId: i.equipmentId,
        quantity: i.quantity,
        receivedQuantity: i.receivedQuantity,
        unitCost: i.unitCost ? i.unitCost.toString() : "0.00",
        equipment: i.equipment ? {
          id: i.equipment.id,
          name: i.equipment.name,
          category: i.equipment.category,
          unit: i.equipment.unit,
        } : undefined,
      })) : undefined,
      base: p.base ? {
        id: p.base.id,
        code: p.base.code,
        name: p.base.name,
      } : undefined,
      createdBy: p.createdBy ? {
        id: p.createdBy.id,
        name: p.createdBy.name,
        email: p.createdBy.email,
      } : undefined,
    };
  }

  public async createProcurement(
    currentUser: prismaClientModule.User,
    data: any
  ): Promise<procurementTypes.ProcurementResponse> {
    const base = await prisma.base.findFirst({
      where: { id: data.baseId, isActive: true },
    });
    if (!base) {
      throw new NotFoundError(`Destination base with ID '${data.baseId}' not found or inactive`);
    }

    // Base scope check
    if (currentUser.role !== "ADMIN" && data.baseId !== currentUser.baseId) {
      throw new ForbiddenError("Access Denied: Cannot register procurement for another base");
    }

    // Verify procurement number uniqueness
    const existing = await prisma.procurement.findUnique({
      where: { procurementNumber: data.procurementNumber.trim() },
    });
    if (existing) {
      throw new ConflictError(`Procurement number '${data.procurementNumber}' is already registered`);
    }

    // Verify equipment models
    const equipmentIds = data.items.map((i: any) => i.equipmentId);
    const uniqueEqIds = Array.from(new Set(equipmentIds)) as string[];
    if (uniqueEqIds.length !== equipmentIds.length) {
      throw new ValidationError("Duplicate equipment IDs specified in items list");
    }

    const matchedEquipment = await prisma.equipment.findMany({
      where: { id: { in: uniqueEqIds }, isActive: true },
    });
    if (matchedEquipment.length !== uniqueEqIds.length) {
      throw new NotFoundError("One or more equipment catalog models specified are inactive or not found");
    }

    // Calculate total cost
    let totalCost = new prismaClientModule.Prisma.Decimal(0);
    const itemCreates: any[] = [];

    for (const item of data.items) {
      const q = new prismaClientModule.Prisma.Decimal(item.quantity);
      const c = new prismaClientModule.Prisma.Decimal(item.unitCost);
      totalCost = totalCost.plus(q.times(c));

      itemCreates.push({
        equipmentId: item.equipmentId,
        quantity: item.quantity,
        receivedQuantity: 0,
        unitCost: c,
      });
    }

    const created = await this.procurementRepository.create({
      procurementNumber: data.procurementNumber.trim(),
      supplier: data.supplier.trim(),
      status: "DRAFT",
      purchaseDate: new Date(data.purchaseDate),
      expectedDeliveryDate: new Date(data.expectedDeliveryDate),
      totalCost,
      remarks: data.remarks ? data.remarks.trim() : null,
      baseId: data.baseId,
      createdById: currentUser.id,
      items: itemCreates,
    });

    const populated = await this.procurementRepository.findById(created.id);
    return this.sanitizeProcurement(populated!);
  }

  public async approveProcurement(
    currentUser: prismaClientModule.User,
    id: string
  ): Promise<procurementTypes.ProcurementResponse> {
    const procurement = await this.procurementRepository.findById(id);
    if (!procurement) {
      throw new NotFoundError("Procurement record not found");
    }

    if (procurement.status !== "DRAFT") {
      throw new ValidationError(`Cannot approve procurement: Record is in status '${procurement.status}' (expected DRAFT)`);
    }

    // Scope check
    if (currentUser.role !== "ADMIN" && procurement.baseId !== currentUser.baseId) {
      throw new ForbiddenError("Access Denied: Associated base belongs to another base");
    }

    const updated = await this.procurementRepository.update(id, { status: "APPROVED" });
    const populated = await this.procurementRepository.findById(updated.id);

    await AuditService.logAction({
      userId: currentUser.id,
      performedByType: "USER",
      module: "PROCUREMENT",
      action: "PROCUREMENT_APPROVE",
      entityType: "Procurement",
      entityId: id,
      oldValues: { status: "DRAFT" },
      newValues: { status: "APPROVED" },
    });

    await NotificationService.createNotification({
      userId: currentUser.id,
      title: "Procurement Order Approved",
      message: `Procurement order #${populated?.procurementNumber} has been approved.`,
      type: "PROCUREMENT",
      priority: "MEDIUM",
      actionUrl: `/procurement/${id}`,
    });

    return this.sanitizeProcurement(populated!);
  }

  public async receiveProcurement(
    currentUser: prismaClientModule.User,
    id: string,
    body: any
  ): Promise<procurementTypes.ProcurementResponse> {
    const procurement = await this.procurementRepository.findById(id);
    if (!procurement) {
      throw new NotFoundError("Procurement record not found");
    }

    if (procurement.status !== "APPROVED" && procurement.status !== "PARTIALLY_RECEIVED") {
      throw new ValidationError(`Cannot receive procurement: Record is in status '${procurement.status}' (expected APPROVED or PARTIALLY_RECEIVED)`);
    }

    // Scope check
    if (currentUser.role !== "ADMIN" && procurement.baseId !== currentUser.baseId) {
      throw new ForbiddenError("Access Denied: Associated base belongs to another base");
    }

    // 1. Validate serial numbers and quantities
    const allSerials: string[] = [];
    const itemMap = new Map<string, any>();

    for (const item of body.items) {
      const dbItem = (procurement as any).items?.find((i: any) => i.equipmentId === item.equipmentId);
      if (!dbItem) {
        throw new ValidationError(`Equipment model '${item.equipmentId}' is not part of this procurement request`);
      }

      const outstanding = dbItem.quantity - dbItem.receivedQuantity;
      if (item.serialNumbers.length !== outstanding) {
        throw new ValidationError(`Cannot receive: Expected exactly ${outstanding} serial numbers for equipment '${item.equipmentId}', but got ${item.serialNumbers.length}`);
      }

      // Collect all serials
      for (const sn of item.serialNumbers) {
        const trimmed = sn.trim();
        if (allSerials.includes(trimmed)) {
          throw new ValidationError(`Duplicate serial number '${trimmed}' specified in request`);
        }
        allSerials.push(trimmed);
      }

      itemMap.set(item.equipmentId, {
        dbItemId: dbItem.id,
        unitCost: dbItem.unitCost,
        serialNumbers: item.serialNumbers,
      });
    }

    if (allSerials.length === 0) {
      throw new ValidationError("Must provide at least one serial number to receive");
    }

    // Check database for existing serials
    const existingAssets = await prisma.equipmentAsset.findMany({
      where: { serialNumber: { in: allSerials } },
      select: { serialNumber: true },
    });
    if (existingAssets.length > 0) {
      const existingList = existingAssets.map((a) => a.serialNumber).join(", ");
      throw new ConflictError(`One or more serial numbers already exist in the database: ${existingList}`);
    }

    // 2. Perform receive operations inside transaction
    await prisma.$transaction(async (tx) => {
      for (const [eqId, details] of itemMap.entries()) {
        // Create assets
        for (const sn of details.serialNumbers) {
          const asset = await tx.equipmentAsset.create({
            data: {
              equipmentId: eqId,
              baseId: procurement.baseId,
              serialNumber: sn.trim(),
              purchaseDate: procurement.purchaseDate,
              purchaseCost: details.unitCost,
              status: "AVAILABLE",
              condition: "NEW",
              remarks: `Procured under ref ${procurement.procurementNumber}`,
              isActive: true,
            },
          });

          // Create one MovementHistory record per asset
          await tx.movementHistory.create({
            data: {
              equipmentAssetId: asset.id,
              movementType: "PROCUREMENT",
              sourceBaseId: null,
              destinationBaseId: procurement.baseId,
              referenceType: "PROCUREMENT",
              referenceId: id,
              performedById: currentUser.id,
              remarks: `Received item from Procurement ref: ${procurement.procurementNumber}`,
            },
          });
        }

        // Increment receivedQuantity
        await tx.procurementItem.update({
          where: { id: details.dbItemId },
          data: {
            receivedQuantity: {
              increment: details.serialNumbers.length,
            },
          },
        });
      }

      // Fetch updated items inside transaction
      const updatedItems = await tx.procurementItem.findMany({
        where: { procurementId: id },
      });

      const allReceived = updatedItems.every((i) => i.receivedQuantity === i.quantity);

      // Update procurement status
      await tx.procurement.update({
        where: { id },
        data: {
          status: allReceived ? "RECEIVED" : "PARTIALLY_RECEIVED",
          receivedDate: allReceived ? new Date() : null,
        },
      });

      // Synchronize affected inventory aggregates
      for (const eqId of itemMap.keys()) {
        await syncInventory(eqId, procurement.baseId, tx);
      }
    });

    const populated = await this.procurementRepository.findById(id);

    await AuditService.logAction({
      userId: currentUser.id,
      performedByType: "USER",
      module: "PROCUREMENT",
      action: "PROCUREMENT_RECEIVE",
      entityType: "Procurement",
      entityId: id,
      oldValues: { status: procurement.status },
      newValues: { status: populated?.status },
    });

    await NotificationService.createNotification({
      userId: currentUser.id,
      title: populated?.status === "RECEIVED" ? "Procurement Order Completed" : "Procurement Order Partially Received",
      message: `Procurement order #${populated?.procurementNumber} items have been received (Status: ${populated?.status}).`,
      type: "PROCUREMENT",
      priority: "MEDIUM",
      actionUrl: `/procurement/${id}`,
    });

    return this.sanitizeProcurement(populated!);
  }

  public async cancelProcurement(
    currentUser: prismaClientModule.User,
    id: string
  ): Promise<procurementTypes.ProcurementResponse> {
    const procurement = await this.procurementRepository.findById(id);
    if (!procurement) {
      throw new NotFoundError("Procurement record not found");
    }

    if (procurement.status === "RECEIVED") {
      throw new ValidationError("Cannot cancel procurement: Items have already been fully received");
    }

    // Scope check
    if (currentUser.role !== "ADMIN" && procurement.baseId !== currentUser.baseId) {
      throw new ForbiddenError("Access Denied: Associated base belongs to another base");
    }

    const updated = await this.procurementRepository.update(id, { status: "CANCELLED" });
    const populated = await this.procurementRepository.findById(updated.id);
    return this.sanitizeProcurement(populated!);
  }

  public async getProcurementById(
    currentUser: prismaClientModule.User,
    id: string
  ): Promise<procurementTypes.ProcurementResponse> {
    const record = await this.procurementRepository.findById(id);
    if (!record) {
      throw new NotFoundError("Procurement record not found");
    }

    // Base scope check
    if (currentUser.role === "BASE_COMMANDER" || currentUser.role === "LOGISTICS_OFFICER") {
      if (record.baseId !== currentUser.baseId) {
        throw new ForbiddenError("Access Denied: Procurement belongs to another base");
      }
    }

    return this.sanitizeProcurement(record);
  }

  public async getProcurements(
    currentUser: prismaClientModule.User,
    queryParams: any
  ): Promise<procurementTypes.PaginatedProcurement> {
    const page = queryParams.page ?? 1;
    const limit = queryParams.limit ?? 10;
    const sortBy = queryParams.sortBy ?? "createdAt";
    const sortOrder = queryParams.sortOrder ?? "desc";
    const search = queryParams.search ? queryParams.search.trim() : undefined;

    const where: prismaClientModule.Prisma.ProcurementWhereInput = {};

    // Apply base scoping
    if (currentUser.role === "BASE_COMMANDER" || currentUser.role === "LOGISTICS_OFFICER") {
      if (!currentUser.baseId) {
        throw new ForbiddenError("Access Denied: User not assigned to a base");
      }
      where.baseId = currentUser.baseId;
    } else if (currentUser.role === "ADMIN" && queryParams.baseId) {
      where.baseId = queryParams.baseId;
    }

    if (queryParams.status) {
      where.status = queryParams.status;
    }

    if (queryParams.supplier) {
      where.supplier = {
        contains: queryParams.supplier.trim(),
        mode: "insensitive",
      };
    }

    if (search) {
      where.OR = [
        {
          procurementNumber: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          supplier: {
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
      ];
    }

    const { procurements, total } = await this.procurementRepository.findMany(where, {
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      procurements: procurements.map((p) => this.sanitizeProcurement(p)),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
      },
    };
  }
}

export = ProcurementService;
