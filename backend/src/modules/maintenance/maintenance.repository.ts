import prisma = require("../../shared/prisma/prisma.js");
import prismaClientModule = require("../../../generated/prisma/index.js");

class MaintenanceRepository {
  public async create(
    data: prismaClientModule.Prisma.MaintenanceUncheckedCreateInput,
    tx?: prismaClientModule.Prisma.TransactionClient
  ): Promise<prismaClientModule.Maintenance> {
    const client = tx || prisma;
    return client.maintenance.create({ data });
  }

  public async update(
    id: string,
    data: prismaClientModule.Prisma.MaintenanceUncheckedUpdateInput,
    tx?: prismaClientModule.Prisma.TransactionClient
  ): Promise<prismaClientModule.Maintenance> {
    const client = tx || prisma;
    return client.maintenance.update({
      where: { id },
      data,
    });
  }

  public async findById(id: string): Promise<prismaClientModule.Maintenance | null> {
    return prisma.maintenance.findFirst({
      where: { id, isActive: true },
      include: {
        equipmentAsset: {
          include: {
            equipment: true,
          },
        },
        createdBy: true,
        completedBy: true,
      },
    });
  }

  public async findActiveByAssetId(
    assetId: string,
    tx?: prismaClientModule.Prisma.TransactionClient
  ): Promise<prismaClientModule.Maintenance | null> {
    const client = tx || prisma;
    return client.maintenance.findFirst({
      where: {
        equipmentAssetId: assetId,
        status: { in: ["SCHEDULED", "IN_PROGRESS"] },
        isActive: true,
      },
    });
  }

  public async findMany(
    where: prismaClientModule.Prisma.MaintenanceWhereInput,
    options: {
      skip: any;
      take: any;
      orderBy: prismaClientModule.Prisma.MaintenanceOrderByWithRelationInput;
    }
  ): Promise<{ maintenances: prismaClientModule.Maintenance[]; total: number }> {
    const parsedSkip = Number(options.skip ?? 0);
    const parsedTake = Number(options.take ?? 10);

    const [maintenances, total] = await Promise.all([
      prisma.maintenance.findMany({
        where,
        skip: parsedSkip,
        take: parsedTake,
        orderBy: options.orderBy,
        include: {
          equipmentAsset: {
            include: {
              equipment: true,
            },
          },
          createdBy: true,
          completedBy: true,
        },
      }),
      prisma.maintenance.count({ where }),
    ]);

    return { maintenances, total };
  }
}

export = MaintenanceRepository;
