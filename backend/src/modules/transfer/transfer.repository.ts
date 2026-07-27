import prisma = require("../../shared/prisma/prisma.js");
import prismaClientModule = require("../../../generated/prisma/index.js");

class TransferRepository {
  public async create(
    data: prismaClientModule.Prisma.TransferUncheckedCreateInput,
    tx?: prismaClientModule.Prisma.TransactionClient
  ): Promise<prismaClientModule.Transfer> {
    const client = tx || prisma;
    return client.transfer.create({ data });
  }

  public async update(
    id: string,
    data: prismaClientModule.Prisma.TransferUncheckedUpdateInput,
    tx?: prismaClientModule.Prisma.TransactionClient
  ): Promise<prismaClientModule.Transfer> {
    const client = tx || prisma;
    return client.transfer.update({
      where: { id },
      data,
    });
  }

  public async findById(id: string): Promise<prismaClientModule.Transfer | null> {
    return prisma.transfer.findUnique({
      where: { id },
      include: {
        equipmentAsset: {
          include: {
            equipment: true,
          },
        },
        fromBase: true,
        toBase: true,
        transferredBy: true,
      },
    });
  }

  public async findMany(
    where: prismaClientModule.Prisma.TransferWhereInput,
    options: {
      skip: any;
      take: any;
      orderBy: prismaClientModule.Prisma.TransferOrderByWithRelationInput;
    }
  ): Promise<{ transfers: prismaClientModule.Transfer[]; total: number }> {
    const parsedSkip = Number(options.skip ?? 0);
    const parsedTake = Number(options.take ?? 10);

    const [transfers, total] = await Promise.all([
      prisma.transfer.findMany({
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
          fromBase: true,
          toBase: true,
          transferredBy: true,
        },
      }),
      prisma.transfer.count({ where }),
    ]);

    return { transfers, total };
  }
}

export = TransferRepository;
