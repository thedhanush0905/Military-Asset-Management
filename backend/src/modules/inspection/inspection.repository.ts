import prisma = require("../../shared/prisma/prisma.js");
import prismaClientModule = require("../../../generated/prisma/index.js");

class InspectionRepository {
  public async create(
    data: prismaClientModule.Prisma.InspectionUncheckedCreateInput
  ): Promise<prismaClientModule.Inspection> {
    return prisma.inspection.create({ data });
  }

  public async update(
    id: string,
    data: prismaClientModule.Prisma.InspectionUncheckedUpdateInput
  ): Promise<prismaClientModule.Inspection> {
    return prisma.inspection.update({
      where: { id },
      data,
    });
  }

  public async findById(id: string): Promise<prismaClientModule.Inspection | null> {
    return prisma.inspection.findUnique({
      where: { id },
      include: {
        equipmentAsset: true,
        inspector: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  public async findMany(
    where: prismaClientModule.Prisma.InspectionWhereInput,
    options: {
      skip: number;
      take: number;
      orderBy: prismaClientModule.Prisma.InspectionOrderByWithRelationInput;
    }
  ): Promise<{ inspections: prismaClientModule.Inspection[]; total: number }> {
    const [inspections, total] = await Promise.all([
      prisma.inspection.findMany({
        where,
        skip: options.skip,
        take: options.take,
        orderBy: options.orderBy,
        include: {
          equipmentAsset: {
            select: { id: true, serialNumber: true, status: true },
          },
          inspector: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      prisma.inspection.count({ where }),
    ]);

    return { inspections, total };
  }

  public async delete(id: string): Promise<prismaClientModule.Inspection> {
    return prisma.inspection.delete({
      where: { id },
    });
  }
}

export = InspectionRepository;
