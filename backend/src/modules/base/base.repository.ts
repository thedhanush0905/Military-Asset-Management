import prisma = require("../../shared/prisma/prisma.js");
import prismaClientModule = require("../../../generated/prisma/index.js");

class BaseRepository {
  public async create(data: prismaClientModule.Prisma.BaseUncheckedCreateInput): Promise<prismaClientModule.Base> {
    return prisma.base.create({ data });
  }

  public async findById(id: string): Promise<prismaClientModule.Base | null> {
    return prisma.base.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            inventories: true,
          },
        },
      },
    });
  }

  public async findByCode(code: string): Promise<prismaClientModule.Base | null> {
    return prisma.base.findUnique({
      where: { code },
    });
  }

  public async findActiveById(id: string): Promise<prismaClientModule.Base | null> {
    return prisma.base.findFirst({
      where: { id, isActive: true },
      include: {
        _count: {
          select: {
            users: true,
            inventories: true,
          },
        },
      },
    });
  }

  public async findActiveByNameAndLocation(name: string, location: string): Promise<prismaClientModule.Base | null> {
    return prisma.base.findFirst({
      where: { name, location, isActive: true },
    });
  }

  public async findMany(
    where: prismaClientModule.Prisma.BaseWhereInput,
    options: {
      skip: any;
      take: any;
      orderBy: prismaClientModule.Prisma.BaseOrderByWithRelationInput;
    }
  ): Promise<{ bases: prismaClientModule.Base[]; total: number }> {
    const parsedSkip = Number(options.skip ?? 0);
    const parsedTake = Number(options.take ?? 10);

    const [bases, total] = await Promise.all([
      prisma.base.findMany({
        where,
        skip: parsedSkip,
        take: parsedTake,
        orderBy: options.orderBy,
        include: {
          _count: {
            select: {
              users: true,
              inventories: true,
            },
          },
        },
      }),
      prisma.base.count({ where }),
    ]);

    return { bases, total };
  }

  public async update(id: string, data: prismaClientModule.Prisma.BaseUncheckedUpdateInput): Promise<prismaClientModule.Base> {
    return prisma.base.update({
      where: { id },
      data,
    });
  }

  public async countUsersByBaseId(baseId: string): Promise<number> {
    return prisma.user.count({
      where: { baseId, status: "ACTIVE" },
    });
  }

  public async countActiveStockByBaseId(baseId: string): Promise<number> {
    return prisma.inventory.count({
      where: { baseId, quantity: { gt: 0 } },
    });
  }

  public async softDelete(id: string): Promise<prismaClientModule.Base> {
    return prisma.base.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

export = BaseRepository;
