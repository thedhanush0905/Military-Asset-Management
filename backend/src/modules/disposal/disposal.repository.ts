import prisma = require("../../shared/prisma/prisma.js");
import prismaClientModule = require("../../../generated/prisma/index.js");

class DisposalRepository {
  public async create(
    data: prismaClientModule.Prisma.DisposalUncheckedCreateInput,
    tx?: prismaClientModule.Prisma.TransactionClient
  ): Promise<prismaClientModule.Disposal> {
    const client = tx || prisma;
    return client.disposal.create({ data });
  }

  public async update(
    id: string,
    data: prismaClientModule.Prisma.DisposalUncheckedUpdateInput,
    tx?: prismaClientModule.Prisma.TransactionClient
  ): Promise<prismaClientModule.Disposal> {
    const client = tx || prisma;
    return client.disposal.update({
      where: { id },
      data,
    });
  }

  public async findById(id: string): Promise<prismaClientModule.Disposal | null> {
    return prisma.disposal.findUnique({
      where: { id },
      include: {
        equipmentAsset: {
          include: {
            equipment: true,
          },
        },
        approvedBy: true,
        disposedBy: true,
      },
    });
  }

  public async findMany(
    where: prismaClientModule.Prisma.DisposalWhereInput,
    options: {
      skip: any;
      take: any;
      orderBy: prismaClientModule.Prisma.DisposalOrderByWithRelationInput;
    }
  ): Promise<{ disposals: prismaClientModule.Disposal[]; total: number }> {
    const parsedSkip = Number(options.skip ?? 0);
    const parsedTake = Number(options.take ?? 10);

    const [disposals, total] = await Promise.all([
      prisma.disposal.findMany({
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
          approvedBy: true,
          disposedBy: true,
        },
      }),
      prisma.disposal.count({ where }),
    ]);

    return { disposals, total };
  }
}

export = DisposalRepository;
