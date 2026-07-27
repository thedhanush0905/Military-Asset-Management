import prisma = require("../../shared/prisma/prisma.js");
import prismaClientModule = require("../../../generated/prisma/index.js");

class ProcurementRepository {
  public async create(
    data: prismaClientModule.Prisma.ProcurementUncheckedCreateInput & {
      items: prismaClientModule.Prisma.ProcurementItemUncheckedCreateWithoutProcurementInput[];
    },
    tx?: prismaClientModule.Prisma.TransactionClient
  ): Promise<prismaClientModule.Procurement> {
    const client = tx || prisma;
    const { items, ...procData } = data;
    return client.procurement.create({
      data: {
        ...procData,
        items: {
          create: items,
        },
      },
    });
  }

  public async update(
    id: string,
    data: prismaClientModule.Prisma.ProcurementUncheckedUpdateInput,
    tx?: prismaClientModule.Prisma.TransactionClient
  ): Promise<prismaClientModule.Procurement> {
    const client = tx || prisma;
    return client.procurement.update({
      where: { id },
      data,
    });
  }

  public async findById(id: string): Promise<prismaClientModule.Procurement | null> {
    return prisma.procurement.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            equipment: true,
          },
        },
        base: true,
        createdBy: true,
      },
    });
  }

  public async findMany(
    where: prismaClientModule.Prisma.ProcurementWhereInput,
    options: {
      skip: any;
      take: any;
      orderBy: prismaClientModule.Prisma.ProcurementOrderByWithRelationInput;
    }
  ): Promise<{ procurements: prismaClientModule.Procurement[]; total: number }> {
    const parsedSkip = Number(options.skip ?? 0);
    const parsedTake = Number(options.take ?? 10);

    const [procurements, total] = await Promise.all([
      prisma.procurement.findMany({
        where,
        skip: parsedSkip,
        take: parsedTake,
        orderBy: options.orderBy,
        include: {
          items: {
            include: {
              equipment: true,
            },
          },
          base: true,
          createdBy: true,
        },
      }),
      prisma.procurement.count({ where }),
    ]);

    return { procurements, total };
  }
}

export = ProcurementRepository;
