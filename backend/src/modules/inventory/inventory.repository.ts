import prisma = require("../../shared/prisma/prisma.js");
import prismaClientModule = require("../../../generated/prisma/index.js");

class InventoryRepository {
  public async findById(id: string): Promise<prismaClientModule.Inventory | null> {
    return prisma.inventory.findFirst({
      where: { id, isActive: true },
      include: {
        equipment: true,
        base: true,
      },
    });
  }

  public async findByEquipmentAndBase(equipmentId: string, baseId: string): Promise<prismaClientModule.Inventory | null> {
    return prisma.inventory.findFirst({
      where: { equipmentId, baseId, isActive: true },
      include: {
        equipment: true,
        base: true,
      },
    });
  }

  public async findMany(
    where: prismaClientModule.Prisma.InventoryWhereInput,
    options: {
      skip: any;
      take: any;
      orderBy: prismaClientModule.Prisma.InventoryOrderByWithRelationInput;
    }
  ): Promise<{ inventories: prismaClientModule.Inventory[]; total: number }> {
    const parsedSkip = Number(options.skip ?? 0);
    const parsedTake = Number(options.take ?? 10);

    const activeWhere: prismaClientModule.Prisma.InventoryWhereInput = {
      ...where,
      isActive: true,
    };

    const [inventories, total] = await Promise.all([
      prisma.inventory.findMany({
        where: activeWhere,
        skip: parsedSkip,
        take: parsedTake,
        orderBy: options.orderBy,
        include: {
          equipment: true,
          base: true,
        },
      }),
      prisma.inventory.count({ where: activeWhere }),
    ]);

    return { inventories, total };
  }

  /**
   * Queries low stock items (quantity < minimumStock) at the database level.
   * 
   * [ARCHITECTURAL NOTE ON RAW SQL]
   * Standard Prisma Client (up to client version 7.x) does not natively support column-to-column comparison 
   * (e.g. `quantity < minimumStock` within the same record) inside a standard `findMany.where` query block. 
   * To execute this filter efficiently at the database level rather than fetching all rows into memory, 
   * we use a raw SQL query `prisma.$queryRawUnsafe` to select the IDs of low-stock inventories matching the filters,
   * and then leverage the standard, paginated, and relation-included `findMany` using those matching IDs.
   */
  public async findLowStock(
    where: prismaClientModule.Prisma.InventoryWhereInput,
    options: {
      skip: any;
      take: any;
      orderBy: prismaClientModule.Prisma.InventoryOrderByWithRelationInput;
    }
  ): Promise<{ inventories: prismaClientModule.Inventory[]; total: number }> {
    const baseIdFilter = (where.baseId as string) || null;
    const equipmentIdFilter = (where.equipmentId as string) || null;

    let query = `SELECT id FROM "Inventory" WHERE quantity < "minimumStock" AND "isActive" = true`;
    const params: any[] = [];

    if (baseIdFilter) {
      params.push(baseIdFilter);
      query += ` AND "baseId" = $${params.length}`;
    }

    if (equipmentIdFilter) {
      params.push(equipmentIdFilter);
      query += ` AND "equipmentId" = $${params.length}`;
    }

    const matchedRecords = await prisma.$queryRawUnsafe<{ id: string }[]>(query, ...params);
    const ids = matchedRecords.map((r) => r.id);

    const lowStockWhere: prismaClientModule.Prisma.InventoryWhereInput = {
      ...where,
      id: { in: ids },
    };

    return this.findMany(lowStockWhere, options);
  }
}

export = InventoryRepository;
