import prisma = require("../../shared/prisma/prisma.js");
import prismaClientModule = require("../../../generated/prisma/index.js");

class WarrantyRepository {
  public async create(
    data: prismaClientModule.Prisma.WarrantyUncheckedCreateInput
  ): Promise<prismaClientModule.Warranty> {
    return prisma.warranty.create({ data });
  }

  public async update(
    id: string,
    data: prismaClientModule.Prisma.WarrantyUncheckedUpdateInput
  ): Promise<prismaClientModule.Warranty> {
    return prisma.warranty.update({
      where: { id },
      data,
    });
  }

  public async updateMany(
    where: prismaClientModule.Prisma.WarrantyWhereInput,
    data: prismaClientModule.Prisma.WarrantyUncheckedUpdateManyInput
  ): Promise<prismaClientModule.Prisma.BatchPayload> {
    return prisma.warranty.updateMany({ where, data });
  }

  public async findById(id: string): Promise<prismaClientModule.Warranty | null> {
    return prisma.warranty.findUnique({
      where: { id },
      include: {
        equipmentAsset: true,
        vendor: true,
      },
    });
  }

  public async findMany(
    where: prismaClientModule.Prisma.WarrantyWhereInput,
    options: {
      skip: number;
      take: number;
      orderBy: prismaClientModule.Prisma.WarrantyOrderByWithRelationInput;
    }
  ): Promise<{ warranties: prismaClientModule.Warranty[]; total: number }> {
    const [warranties, total] = await Promise.all([
      prisma.warranty.findMany({
        where,
        skip: options.skip,
        take: options.take,
        orderBy: options.orderBy,
        include: {
          equipmentAsset: {
            select: { id: true, serialNumber: true, status: true },
          },
          vendor: {
            select: { id: true, name: true, code: true },
          },
        },
      }),
      prisma.warranty.count({ where }),
    ]);

    return { warranties, total };
  }
}

export = WarrantyRepository;
