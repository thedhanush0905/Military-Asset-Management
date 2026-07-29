import EquipmentAssetRepository = require("./equipment-asset.repository.js");
import prisma = require("../../shared/prisma/prisma.js");
import prismaClientModule = require("../../../generated/prisma/index.js");
import ValidationError = require("../../shared/errors/ValidationError.js");
import NotFoundError = require("../../shared/errors/NotFoundError.js");
import ForbiddenError = require("../../shared/errors/ForbiddenError.js");
import ConflictError = require("../../shared/errors/ConflictError.js");
import type equipmentAssetTypes = require("./equipment-asset.types.js");
import syncInventory = require("../../shared/utils/inventorySync.js");
import AuditService = require("../../shared/services/audit.service.js");

class EquipmentAssetService {
  private readonly assetRepository: EquipmentAssetRepository;

  constructor() {
    this.assetRepository = new EquipmentAssetRepository();
  }

  private sanitizeAsset(asset: any): equipmentAssetTypes.EquipmentAssetResponse {
    return {
      id: asset.id,
      equipmentId: asset.equipmentId,
      baseId: asset.baseId,
      serialNumber: asset.serialNumber,
      purchaseDate: asset.purchaseDate,
      purchaseCost: asset.purchaseCost ? asset.purchaseCost.toString() : "0.00",
      status: asset.status,
      condition: asset.condition,
      remarks: asset.remarks,
      isActive: asset.isActive,
      createdAt: asset.createdAt,
      updatedAt: asset.updatedAt,
      equipment: asset.equipment ? {
        id: asset.equipment.id,
        name: asset.equipment.name,
        category: asset.equipment.category,
        unit: asset.equipment.unit,
      } : undefined,
      base: asset.base ? {
        id: asset.base.id,
        code: asset.base.code,
        name: asset.base.name,
      } : undefined,
    };
  }



  public async createAsset(
    currentUser: prismaClientModule.User,
    data: any
  ): Promise<equipmentAssetTypes.EquipmentAssetResponse> {
    const equipment = await prisma.equipment.findFirst({
      where: { id: data.equipmentId, isActive: true },
    });
    if (!equipment) {
      throw new NotFoundError("Target equipment catalog model not found or inactive");
    }

    const base = await prisma.base.findFirst({
      where: { id: data.baseId, isActive: true },
    });
    if (!base) {
      throw new NotFoundError("Target base not found or inactive");
    }

    // Role verification for base scope
    if (currentUser.role !== "ADMIN" && currentUser.baseId !== data.baseId) {
      throw new ForbiddenError("Access Denied: Cannot register assets to another base");
    }

    const serialNumber = data.serialNumber.trim();
    const existingSerial = await this.assetRepository.findBySerialNumber(serialNumber, true);
    if (existingSerial) {
      throw new ConflictError("Serial number already in use");
    }

    const created = await prisma.$transaction(async (tx) => {
      const asset = await this.assetRepository.create({
        equipmentId: data.equipmentId,
        baseId: data.baseId,
        serialNumber,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
        purchaseCost: new prismaClientModule.Prisma.Decimal(data.purchaseCost),
        status: data.status || "AVAILABLE",
        condition: data.condition || "NEW",
        remarks: data.remarks ? data.remarks.trim() : null,
        isActive: true,
      }, tx);

      // Recalculate inventory
      await syncInventory(data.equipmentId, data.baseId, tx);

      return asset;
    });

    // Fetch complete record with relations
    const completedRecord = await this.assetRepository.findById(created.id);

    if (completedRecord) {
      await AuditService.logAction({
        userId: currentUser.id,
        performedByType: "USER",
        module: "ASSET",
        action: "ASSET_CREATE",
        entityType: "EquipmentAsset",
        entityId: completedRecord.id,
        newValues: { serialNumber: completedRecord.serialNumber, status: completedRecord.status, condition: completedRecord.condition, baseId: completedRecord.baseId },
      });
    }

    return this.sanitizeAsset(completedRecord);
  }

  public async getAssets(
    currentUser: prismaClientModule.User,
    queryParams: any
  ): Promise<equipmentAssetTypes.PaginatedEquipmentAsset> {
    const page = Number(queryParams.page ?? 1);
    const limit = Number(queryParams.limit ?? 10);
    const sortBy = queryParams.sortBy ?? "createdAt";
    const sortOrder = queryParams.sortOrder ?? "desc";
    const search = queryParams.search ? queryParams.search.trim() : undefined;

    const where: prismaClientModule.Prisma.EquipmentAssetWhereInput = {
      isActive: true,
    };

    // Scoping check
    if (currentUser.role === "BASE_COMMANDER" || currentUser.role === "LOGISTICS_OFFICER") {
      if (!currentUser.baseId) {
        throw new ForbiddenError("Access Denied: User not assigned to a base");
      }
      where.baseId = currentUser.baseId;
    } else if (currentUser.role === "ADMIN" && queryParams.baseId) {
      where.baseId = queryParams.baseId;
    }

    if (queryParams.equipmentId) {
      where.equipmentId = queryParams.equipmentId;
    }

    if (queryParams.status) {
      where.status = queryParams.status;
    }

    if (queryParams.condition) {
      where.condition = queryParams.condition;
    }

    if (search) {
      where.OR = [
        {
          serialNumber: {
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
          base: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          base: {
            code: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          equipment: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    const { assets, total } = await this.assetRepository.findMany(where, {
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      assets: assets.map((a) => this.sanitizeAsset(a)),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
      },
    };
  }

  public async getAssetById(
    currentUser: prismaClientModule.User,
    id: string
  ): Promise<equipmentAssetTypes.EquipmentAssetResponse> {
    const asset = await this.assetRepository.findById(id);
    if (!asset) {
      throw new NotFoundError("Equipment asset not found");
    }

    // Scoping check
    if (currentUser.role === "BASE_COMMANDER" || currentUser.role === "LOGISTICS_OFFICER") {
      if (asset.baseId !== currentUser.baseId) {
        throw new ForbiddenError("Access Denied: Asset belongs to another base");
      }
    }

    return this.sanitizeAsset(asset);
  }

  public async updateAsset(
    currentUser: prismaClientModule.User,
    id: string,
    data: any
  ): Promise<equipmentAssetTypes.EquipmentAssetResponse> {
    const target = await this.assetRepository.findById(id);
    if (!target) {
      throw new NotFoundError("Equipment asset not found");
    }

    // Scoping check
    if (currentUser.role === "LOGISTICS_OFFICER" && target.baseId !== currentUser.baseId) {
      throw new ForbiddenError("Access Denied: Asset belongs to another base");
    }

    const updatePayload: prismaClientModule.Prisma.EquipmentAssetUncheckedUpdateInput = {};

    if (data.serialNumber !== undefined) {
      const serial = data.serialNumber.trim();
      if (serial !== target.serialNumber) {
        const existingSerial = await this.assetRepository.findBySerialNumber(serial, true);
        if (existingSerial) {
          throw new ConflictError("Serial number already in use");
        }
      }
      updatePayload.serialNumber = serial;
    }

    if (data.purchaseDate !== undefined) updatePayload.purchaseDate = data.purchaseDate ? new Date(data.purchaseDate) : null;
    if (data.purchaseCost !== undefined) updatePayload.purchaseCost = new prismaClientModule.Prisma.Decimal(data.purchaseCost);
    if (data.status !== undefined) updatePayload.status = data.status;
    if (data.condition !== undefined) updatePayload.condition = data.condition;
    if (data.remarks !== undefined) updatePayload.remarks = data.remarks ? data.remarks.trim() : null;

    const updated = await prisma.$transaction(async (tx) => {
      const updatedAsset = await this.assetRepository.update(id, updatePayload, tx);

      // Recalculate inventory counts
      await syncInventory(target.equipmentId, target.baseId, tx);

      return updatedAsset;
    });

    // Fetch populated record
    const completedRecord = await this.assetRepository.findById(updated.id);

    if (completedRecord) {
      await AuditService.logAction({
        userId: currentUser.id,
        performedByType: "USER",
        module: "ASSET",
        action: "ASSET_UPDATE",
        entityType: "EquipmentAsset",
        entityId: completedRecord.id,
        oldValues: { serialNumber: target.serialNumber, status: target.status, condition: target.condition, baseId: target.baseId },
        newValues: { serialNumber: completedRecord.serialNumber, status: completedRecord.status, condition: completedRecord.condition, baseId: completedRecord.baseId },
      });
    }

    return this.sanitizeAsset(completedRecord);
  }

  public async deleteAsset(
    currentUser: prismaClientModule.User,
    id: string
  ): Promise<equipmentAssetTypes.EquipmentAssetResponse> {
    const target = await this.assetRepository.findById(id);
    if (!target) {
      throw new NotFoundError("Equipment asset not found");
    }

    // Scoping check
    if (currentUser.role === "LOGISTICS_OFFICER" && target.baseId !== currentUser.baseId) {
      throw new ForbiddenError("Access Denied: Asset belongs to another base");
    }

    // Deletion checks
    const activeAssignments = await this.assetRepository.countActiveAssignments(id);
    if (activeAssignments > 0) {
      throw new ConflictError("Cannot delete asset: asset has active personnel assignments");
    }

    const pendingTransfers = await this.assetRepository.countPendingTransfers(id);
    if (pendingTransfers > 0) {
      throw new ConflictError("Cannot delete asset: asset is part of a pending transfer");
    }

    const activeMaintenance = await this.assetRepository.countActiveMaintenanceRecords(id);
    if (activeMaintenance > 0) {
      throw new ConflictError("Cannot delete asset: asset is currently under active maintenance");
    }

    const deleted = await prisma.$transaction(async (tx) => {
      const softDeletedAsset = await this.assetRepository.softDelete(id, tx);

      // Recalculate inventory
      await syncInventory(target.equipmentId, target.baseId, tx);

      return softDeletedAsset;
    });

    // Fetch complete populated record
    const completedRecord = await this.assetRepository.findById(deleted.id, true);

    if (completedRecord) {
      await AuditService.logAction({
        userId: currentUser.id,
        performedByType: "USER",
        module: "ASSET",
        action: "ASSET_DELETE",
        entityType: "EquipmentAsset",
        entityId: completedRecord.id,
        oldValues: { serialNumber: target.serialNumber, status: target.status, condition: target.condition, baseId: target.baseId },
      });
    }

    return this.sanitizeAsset(completedRecord);
  }
}

export = EquipmentAssetService;
