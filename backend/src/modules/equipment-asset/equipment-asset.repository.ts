import prisma = require("../../shared/prisma/prisma.js");
import prismaClientModule = require("../../../generated/prisma/index.js");

class EquipmentAssetRepository {
  public async create(
    data: prismaClientModule.Prisma.EquipmentAssetUncheckedCreateInput,
    tx?: prismaClientModule.Prisma.TransactionClient
  ): Promise<prismaClientModule.EquipmentAsset> {
    const client = tx || prisma;
    return client.equipmentAsset.create({ data });
  }

  public async findById(id: string, includeInactive = false): Promise<prismaClientModule.EquipmentAsset | null> {
    if (!includeInactive) {
      return prisma.equipmentAsset.findFirst({
        where: { id, isActive: true },
        include: {
          equipment: true,
          base: true,
        },
      });
    }
    return prisma.equipmentAsset.findUnique({
      where: { id },
      include: {
        equipment: true,
        base: true,
      },
    });
  }

  public async findBySerialNumber(serialNumber: string, includeInactive = false): Promise<prismaClientModule.EquipmentAsset | null> {
    if (!includeInactive) {
      return prisma.equipmentAsset.findFirst({
        where: { serialNumber, isActive: true },
      });
    }
    return prisma.equipmentAsset.findUnique({
      where: { serialNumber },
    });
  }

  public async findMany(
    where: prismaClientModule.Prisma.EquipmentAssetWhereInput,
    options: {
      skip: any;
      take: any;
      orderBy: prismaClientModule.Prisma.EquipmentAssetOrderByWithRelationInput;
    },
    includeInactive = false
  ): Promise<{ assets: prismaClientModule.EquipmentAsset[]; total: number }> {
    const parsedSkip = Number(options.skip ?? 0);
    const parsedTake = Number(options.take ?? 10);

    const activeWhere: prismaClientModule.Prisma.EquipmentAssetWhereInput = {
      ...where,
      ...(includeInactive ? {} : { isActive: true }),
    };

    const [assets, total] = await Promise.all([
      prisma.equipmentAsset.findMany({
        where: activeWhere,
        skip: parsedSkip,
        take: parsedTake,
        orderBy: options.orderBy,
        include: {
          equipment: true,
          base: true,
        },
      }),
      prisma.equipmentAsset.count({ where: activeWhere }),
    ]);

    return { assets, total };
  }

  public async update(
    id: string,
    data: prismaClientModule.Prisma.EquipmentAssetUncheckedUpdateInput,
    tx?: prismaClientModule.Prisma.TransactionClient
  ): Promise<prismaClientModule.EquipmentAsset> {
    const client = tx || prisma;
    return client.equipmentAsset.update({
      where: { id },
      data,
    });
  }

  public async countActiveAssignments(assetId: string): Promise<number> {
    return prisma.assignment.count({
      where: {
        equipmentAssetId: assetId,
        status: { in: ["ACTIVE", "PARTIALLY_RETURNED"] },
      },
    });
  }

  public async countPendingTransfers(assetId: string): Promise<number> {
    return prisma.transfer.count({
      where: {
        equipmentAssetId: assetId,
        status: { in: ["PENDING", "SHIPPED"] },
      },
    });
  }

  public async countActiveMaintenanceRecords(assetId: string): Promise<number> {
    // Placeholder returning 0. To be integrated when the Maintenance module is implemented.
    return 0;
  }

  public async softDelete(
    id: string,
    tx?: prismaClientModule.Prisma.TransactionClient
  ): Promise<prismaClientModule.EquipmentAsset> {
    const client = tx || prisma;
    return client.equipmentAsset.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

export = EquipmentAssetRepository;
