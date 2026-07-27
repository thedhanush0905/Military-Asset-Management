import prisma = require("../../shared/prisma/prisma.js");
import prismaClientModule = require("../../../generated/prisma/index.js");

class AssignmentRepository {
  public async create(
    data: prismaClientModule.Prisma.AssignmentUncheckedCreateInput,
    tx?: prismaClientModule.Prisma.TransactionClient
  ): Promise<prismaClientModule.Assignment> {
    const client = tx || prisma;
    return client.assignment.create({ data });
  }

  public async update(
    id: string,
    data: prismaClientModule.Prisma.AssignmentUncheckedUpdateInput,
    tx?: prismaClientModule.Prisma.TransactionClient
  ): Promise<prismaClientModule.Assignment> {
    const client = tx || prisma;
    return client.assignment.update({
      where: { id },
      data,
    });
  }

  public async findById(id: string): Promise<prismaClientModule.Assignment | null> {
    return prisma.assignment.findUnique({
      where: { id },
      include: {
        equipmentAsset: {
          include: {
            equipment: true,
          },
        },
        base: true,
        assignedBy: true,
        returnedBy: true,
      },
    });
  }

  public async findActiveByAssetId(assetId: string): Promise<prismaClientModule.Assignment | null> {
    return prisma.assignment.findFirst({
      where: {
        equipmentAssetId: assetId,
        status: "ACTIVE",
      },
    });
  }

  public async findMany(
    where: prismaClientModule.Prisma.AssignmentWhereInput,
    options: {
      skip: any;
      take: any;
      orderBy: prismaClientModule.Prisma.AssignmentOrderByWithRelationInput;
    }
  ): Promise<{ assignments: prismaClientModule.Assignment[]; total: number }> {
    const parsedSkip = Number(options.skip ?? 0);
    const parsedTake = Number(options.take ?? 10);

    const [assignments, total] = await Promise.all([
      prisma.assignment.findMany({
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
          base: true,
          assignedBy: true,
          returnedBy: true,
        },
      }),
      prisma.assignment.count({ where }),
    ]);

    return { assignments, total };
  }
}

export = AssignmentRepository;
