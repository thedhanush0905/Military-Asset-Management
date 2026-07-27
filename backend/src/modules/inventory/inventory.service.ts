import InventoryRepository = require("./inventory.repository.js");
import prismaClientModule = require("../../../generated/prisma/index.js");
import ValidationError = require("../../shared/errors/ValidationError.js");
import NotFoundError = require("../../shared/errors/NotFoundError.js");
import ForbiddenError = require("../../shared/errors/ForbiddenError.js");
import type inventoryTypes = require("./inventory.types.js");

class InventoryService {
  private readonly inventoryRepository: InventoryRepository;

  constructor() {
    this.inventoryRepository = new InventoryRepository();
  }

  private sanitizeInventory(inv: any): inventoryTypes.InventoryResponse {
    return {
      id: inv.id,
      equipmentId: inv.equipmentId,
      baseId: inv.baseId,
      quantity: inv.quantity,
      availableQuantity: inv.availableQuantity,
      allocatedQuantity: inv.allocatedQuantity,
      maintenanceQuantity: inv.maintenanceQuantity,
      damagedQuantity: inv.damagedQuantity,
      minimumStock: inv.minimumStock,
      remarks: inv.remarks,
      isActive: inv.isActive,
      createdAt: inv.createdAt,
      updatedAt: inv.updatedAt,
      equipment: inv.equipment ? {
        id: inv.equipment.id,
        name: inv.equipment.name,
        category: inv.equipment.category,
        unit: inv.equipment.unit,
      } : undefined,
      base: inv.base ? {
        id: inv.base.id,
        code: inv.base.code,
        name: inv.base.name,
      } : undefined,
    };
  }

  private applyBaseScoping(
    currentUser: prismaClientModule.User,
    whereClause: prismaClientModule.Prisma.InventoryWhereInput,
    baseIdParam?: string
  ): void {
    if (currentUser.role === "BASE_COMMANDER" || currentUser.role === "LOGISTICS_OFFICER") {
      if (!currentUser.baseId) {
        throw new ForbiddenError("Access Denied: User is not assigned to a base");
      }
      whereClause.baseId = currentUser.baseId;
    } else if (currentUser.role === "ADMIN" && baseIdParam) {
      whereClause.baseId = baseIdParam;
    }
  }

  public async getInventories(
    currentUser: prismaClientModule.User,
    queryParams: any
  ): Promise<inventoryTypes.PaginatedInventory> {
    const page = queryParams.page ?? 1;
    const limit = queryParams.limit ?? 10;
    const sortBy = queryParams.sortBy ?? "createdAt";
    const sortOrder = queryParams.sortOrder ?? "desc";
    const search = queryParams.search ? queryParams.search.trim() : undefined;

    const where: prismaClientModule.Prisma.InventoryWhereInput = {
      isActive: true,
    };

    this.applyBaseScoping(currentUser, where, queryParams.baseId);

    if (queryParams.equipmentId) {
      where.equipmentId = queryParams.equipmentId;
    }

    if (search) {
      where.OR = [
        {
          equipment: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          equipment: {
            manufacturer: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          equipment: {
            model: {
              contains: search,
              mode: "insensitive",
            },
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
      ];
    }

    const { inventories, total } = queryParams.lowStock
      ? await this.inventoryRepository.findLowStock(where, {
          skip: (page - 1) * limit,
          take: limit,
          orderBy: {
            [sortBy]: sortOrder,
          },
        })
      : await this.inventoryRepository.findMany(where, {
          skip: (page - 1) * limit,
          take: limit,
          orderBy: {
            [sortBy]: sortOrder,
          },
        });

    const totalPages = Math.ceil(total / limit);

    return {
      inventories: inventories.map((i) => this.sanitizeInventory(i)),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
      },
    };
  }

  public async getInventoryById(
    currentUser: prismaClientModule.User,
    id: string
  ): Promise<inventoryTypes.InventoryResponse> {
    const inventory = await this.inventoryRepository.findById(id);
    if (!inventory) {
      throw new NotFoundError("Inventory record not found");
    }

    // Scoping check
    if (currentUser.role === "BASE_COMMANDER" || currentUser.role === "LOGISTICS_OFFICER") {
      if (inventory.baseId !== currentUser.baseId) {
        throw new ForbiddenError("Access Denied: Inventory belongs to another base");
      }
    }

    return this.sanitizeInventory(inventory);
  }

  public async getInventoryByBaseId(
    currentUser: prismaClientModule.User,
    baseId: string,
    queryParams: any
  ): Promise<inventoryTypes.PaginatedInventory> {
    // Scoping check
    if (currentUser.role === "BASE_COMMANDER" || currentUser.role === "LOGISTICS_OFFICER") {
      if (baseId !== currentUser.baseId) {
        throw new ForbiddenError("Access Denied: Cannot view inventory for other bases");
      }
    }

    return this.getInventories(currentUser, { ...queryParams, baseId });
  }

  public async getInventoryByEquipmentId(
    currentUser: prismaClientModule.User,
    equipmentId: string,
    queryParams: any
  ): Promise<inventoryTypes.PaginatedInventory> {
    return this.getInventories(currentUser, { ...queryParams, equipmentId });
  }

  public async getLowStockInventory(
    currentUser: prismaClientModule.User,
    queryParams: any
  ): Promise<inventoryTypes.PaginatedInventory> {
    return this.getInventories(currentUser, { ...queryParams, lowStock: true });
  }
}

export = InventoryService;
