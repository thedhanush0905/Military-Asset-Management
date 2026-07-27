import prisma = require("../../shared/prisma/prisma.js");
import prismaClientModule = require("../../../generated/prisma/index.js");

class SupplierRepository {
  public async create(data: prismaClientModule.Prisma.SupplierUncheckedCreateInput): Promise<prismaClientModule.Supplier> {
    return prisma.supplier.create({ data });
  }

  public async update(
    id: string,
    data: prismaClientModule.Prisma.SupplierUncheckedUpdateInput
  ): Promise<prismaClientModule.Supplier> {
    return prisma.supplier.update({
      where: { id },
      data,
    });
  }

  public async findById(id: string): Promise<prismaClientModule.Supplier | null> {
    return prisma.supplier.findUnique({
      where: { id, isActive: true },
      include: {
        _count: {
          select: { procurements: true, warranties: true },
        },
      },
    });
  }

  public async findByCode(code: string): Promise<prismaClientModule.Supplier | null> {
    return prisma.supplier.findFirst({
      where: { code: code.trim().toUpperCase(), isActive: true },
    });
  }

  public async findMany(
    where: prismaClientModule.Prisma.SupplierWhereInput,
    options: {
      skip: number;
      take: number;
      orderBy: prismaClientModule.Prisma.SupplierOrderByWithRelationInput;
    }
  ): Promise<{ suppliers: prismaClientModule.Supplier[]; total: number }> {
    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({
        where: { ...where, isActive: true },
        skip: options.skip,
        take: options.take,
        orderBy: options.orderBy,
        include: {
          _count: {
            select: { procurements: true, warranties: true },
          },
        },
      }),
      prisma.supplier.count({
        where: { ...where, isActive: true },
      }),
    ]);

    return { suppliers, total };
  }

  public async softDelete(id: string): Promise<prismaClientModule.Supplier> {
    return prisma.supplier.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

export = SupplierRepository;
