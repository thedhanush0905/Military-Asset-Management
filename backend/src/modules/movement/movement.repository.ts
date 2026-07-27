import prisma = require("../../shared/prisma/prisma.js");
import prismaClientModule = require("../../../generated/prisma/index.js");

class MovementRepository {
  public async findById(id: string): Promise<prismaClientModule.MovementHistory | null> {
    return prisma.movementHistory.findUnique({
      where: { id },
      include: {
        equipmentAsset: {
          include: {
            equipment: true,
          },
        },
        sourceBase: true,
        destinationBase: true,
        performedBy: true,
      },
    });
  }

  public async findMany(
    where: prismaClientModule.Prisma.MovementHistoryWhereInput,
    options: {
      skip: any;
      take: any;
      orderBy: prismaClientModule.Prisma.MovementHistoryOrderByWithRelationInput;
    }
  ): Promise<{ movements: prismaClientModule.MovementHistory[]; total: number }> {
    const parsedSkip = Number(options.skip ?? 0);
    const parsedTake = Number(options.take ?? 10);

    const [movements, total] = await Promise.all([
      prisma.movementHistory.findMany({
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
          sourceBase: true,
          destinationBase: true,
          performedBy: true,
        },
      }),
      prisma.movementHistory.count({ where }),
    ]);

    return { movements, total };
  }
}

export = MovementRepository;
