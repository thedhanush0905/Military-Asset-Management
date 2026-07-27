import WarrantyRepository = require("./warranty.repository.js");
import NotFoundError = require("../../shared/errors/NotFoundError.js");
import ForbiddenError = require("../../shared/errors/ForbiddenError.js");
import ValidationError = require("../../shared/errors/ValidationError.js");
import prisma = require("../../shared/prisma/prisma.js");
import prismaClientModule = require("../../../generated/prisma/index.js");
import AuditService = require("../../shared/services/audit.service.js");

class WarrantyService {
  private readonly warrantyRepository: WarrantyRepository;

  constructor() {
    this.warrantyRepository = new WarrantyRepository();
  }

  public async createWarranty(
    currentUser: prismaClientModule.User,
    data: any
  ): Promise<prismaClientModule.Warranty> {
    // 1. Verify asset exists and scoping is valid
    const asset = await prisma.equipmentAsset.findFirst({
      where: { id: data.equipmentAssetId, isActive: true },
    });
    if (!asset) {
      throw new NotFoundError("Associated asset not found or inactive");
    }

    if (currentUser.role !== "ADMIN" && asset.baseId !== currentUser.baseId) {
      throw new ForbiddenError("Access Denied: Associated asset belongs to another base");
    }

    // 2. Verify supplier exists if specified
    if (data.vendorId) {
      const supplierExists = await prisma.supplier.findFirst({
        where: { id: data.vendorId, isActive: true },
      });
      if (!supplierExists) {
        throw new ValidationError("Assigned supplier (vendor) does not exist");
      }
    }

    let created: prismaClientModule.Warranty;

    // 3. Enforce only one active warranty per asset inside transaction
    created = await prisma.$transaction(async (tx) => {
      if (data.status === "ACTIVE") {
        await tx.warranty.updateMany({
          where: { equipmentAssetId: data.equipmentAssetId, status: "ACTIVE" },
          data: { status: "VOIDED" },
        });
      }

      return tx.warranty.create({
        data: {
          equipmentAssetId: data.equipmentAssetId,
          startDate: data.startDate,
          endDate: data.endDate,
          vendorId: data.vendorId || null,
          coverageDetails: data.coverageDetails || null,
          status: data.status,
        },
      });
    });

    await AuditService.logAction({
      userId: currentUser.id,
      performedByType: "USER",
      module: "WARRANTY",
      action: "WARRANTY_CREATE",
      entityType: "Warranty",
      entityId: created.id,
      newValues: { equipmentAssetId: created.equipmentAssetId, startDate: created.startDate, endDate: created.endDate, status: created.status },
    });

    return created;
  }

  public async updateWarranty(
    currentUser: prismaClientModule.User,
    id: string,
    data: any
  ): Promise<prismaClientModule.Warranty> {
    const warranty = await this.warrantyRepository.findById(id);
    if (!warranty) {
      throw new NotFoundError("Warranty record not found");
    }

    // Scoping check
    if (currentUser.role !== "ADMIN" && (warranty as any).equipmentAsset.baseId !== currentUser.baseId) {
      throw new ForbiddenError("Access Denied: Associated asset belongs to another base");
    }

    if (data.vendorId) {
      const supplierExists = await prisma.supplier.findFirst({
        where: { id: data.vendorId, isActive: true },
      });
      if (!supplierExists) {
        throw new ValidationError("Assigned supplier (vendor) does not exist");
      }
    }

    let updated: prismaClientModule.Warranty;

    updated = await prisma.$transaction(async (tx) => {
      if (data.status === "ACTIVE" && warranty.status !== "ACTIVE") {
        // Void previous active warranties
        await tx.warranty.updateMany({
          where: { equipmentAssetId: warranty.equipmentAssetId, status: "ACTIVE" },
          data: { status: "VOIDED" },
        });
      }

      return tx.warranty.update({
        where: { id },
        data: {
          startDate: data.startDate !== undefined ? data.startDate : undefined,
          endDate: data.endDate !== undefined ? data.endDate : undefined,
          vendorId: data.vendorId !== undefined ? data.vendorId : undefined,
          coverageDetails: data.coverageDetails !== undefined ? data.coverageDetails : undefined,
          status: data.status !== undefined ? data.status : undefined,
        },
      });
    });

    await AuditService.logAction({
      userId: currentUser.id,
      performedByType: "USER",
      module: "WARRANTY",
      action: "WARRANTY_UPDATE",
      entityType: "Warranty",
      entityId: id,
      oldValues: { status: warranty.status },
      newValues: { status: updated.status },
    });

    return updated;
  }

  public async getWarrantyById(
    currentUser: prismaClientModule.User,
    id: string
  ): Promise<prismaClientModule.Warranty> {
    const warranty = await this.warrantyRepository.findById(id);
    if (!warranty) {
      throw new NotFoundError("Warranty record not found");
    }

    if (currentUser.role !== "ADMIN" && (warranty as any).equipmentAsset.baseId !== currentUser.baseId) {
      throw new ForbiddenError("Access Denied: Associated asset belongs to another base");
    }

    return warranty;
  }

  public async getWarranties(currentUser: prismaClientModule.User, query: any) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const where: prismaClientModule.Prisma.WarrantyWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.equipmentAssetId) {
      where.equipmentAssetId = query.equipmentAssetId;
    }

    // Base scoping restriction
    if (currentUser.role !== "ADMIN") {
      where.equipmentAsset = {
        baseId: currentUser.baseId!,
        isActive: true,
      };
    } else {
      where.equipmentAsset = {
        isActive: true,
      };
    }

    const { warranties, total } = await this.warrantyRepository.findMany(where, {
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { endDate: "desc" },
    });

    return {
      warranties,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export = WarrantyService;
