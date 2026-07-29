import prisma = require("../../shared/prisma/prisma.js");
import prismaClientModule = require("../../../generated/prisma/index.js");

class EquipmentRepository {
  public async create(data: prismaClientModule.Prisma.EquipmentUncheckedCreateInput): Promise<prismaClientModule.Equipment> {
    return prisma.equipment.create({ data });
  }

  public async findById(id: string, includeInactive = false): Promise<prismaClientModule.Equipment | null> {
    const where: prismaClientModule.Prisma.EquipmentWhereUniqueInput = { id };
    if (!includeInactive) {
      return prisma.equipment.findFirst({
        where: { id, isActive: true },
        include: {
          supplier: true,
          _count: {
            select: {
              assets: { where: { isActive: true } },
              inventories: { where: { isActive: true } },
            },
          },
        },
      });
    }
    return prisma.equipment.findUnique({
      where,
      include: {
        supplier: true,
        _count: {
          select: {
            assets: true,
            inventories: true,
          },
        },
      },
    });
  }

  public async findMany(
    where: prismaClientModule.Prisma.EquipmentWhereInput,
    options: {
      skip: any;
      take: any;
      orderBy: prismaClientModule.Prisma.EquipmentOrderByWithRelationInput;
    },
    includeInactive = false
  ): Promise<{ equipment: prismaClientModule.Equipment[]; total: number }> {
    const parsedSkip = Number(options.skip ?? 0);
    const parsedTake = Number(options.take ?? 10);

    const activeWhere: prismaClientModule.Prisma.EquipmentWhereInput = {
      ...where,
      ...(includeInactive ? {} : { isActive: true }),
    };

    const [equipment, total] = await Promise.all([
      prisma.equipment.findMany({
        where: activeWhere,
        skip: parsedSkip,
        take: parsedTake,
        orderBy: options.orderBy,
        include: {
          supplier: true,
          _count: {
            select: {
              assets: { where: { isActive: true } },
              inventories: { where: { isActive: true } },
            },
          },
        },
      }),
      prisma.equipment.count({ where: activeWhere }),
    ]);

    return { equipment, total };
  }

  public async update(id: string, data: prismaClientModule.Prisma.EquipmentUncheckedUpdateInput): Promise<prismaClientModule.Equipment> {
    return prisma.equipment.update({
      where: { id },
      data,
    });
  }

  public async countActiveAssets(equipmentId: string): Promise<number> {
    return prisma.equipmentAsset.count({
      where: { equipmentId, isActive: true },
    });
  }

  public async softDelete(id: string): Promise<prismaClientModule.Equipment> {
    return prisma.equipment.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

export = EquipmentRepository;
