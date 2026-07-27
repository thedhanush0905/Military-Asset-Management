import prisma = require("../../shared/prisma/prisma.js");
import prismaClientModule = require("../../../generated/prisma/index.js");

class DepreciationRepository {
  public async upsertValuation(
    data: prismaClientModule.Prisma.AssetValuationUncheckedCreateInput
  ): Promise<prismaClientModule.AssetValuation> {
    return prisma.assetValuation.upsert({
      where: { equipmentAssetId: data.equipmentAssetId },
      update: {
        purchaseValue: data.purchaseValue,
        currentValue: data.currentValue,
        bookValue: data.bookValue,
        residualValue: data.residualValue,
        depreciationMethod: data.depreciationMethod as any,
        depreciationRate: data.depreciationRate,
        lastCalculatedAt: data.lastCalculatedAt as any,
      },
      create: data,
    });
  }

  public async findValuationByAssetId(equipmentAssetId: string): Promise<prismaClientModule.AssetValuation | null> {
    return prisma.assetValuation.findUnique({
      where: { equipmentAssetId },
      include: {
        equipmentAsset: {
          include: { equipment: true },
        },
      },
    });
  }

  public async findValuations(
    where: prismaClientModule.Prisma.AssetValuationWhereInput,
    options: {
      skip: number;
      take: number;
    }
  ): Promise<{ valuations: prismaClientModule.AssetValuation[]; total: number }> {
    const [valuations, total] = await Promise.all([
      prisma.assetValuation.findMany({
        where,
        skip: options.skip,
        take: options.take,
        include: {
          equipmentAsset: {
            select: { id: true, serialNumber: true, status: true, purchaseDate: true },
          },
        },
      }),
      prisma.assetValuation.count({ where }),
    ]);

    return { valuations, total };
  }

  public async createDepreciationHistory(
    data: prismaClientModule.Prisma.DepreciationHistoryUncheckedCreateInput
  ): Promise<prismaClientModule.DepreciationHistory> {
    return prisma.depreciationHistory.create({ data });
  }

  public async findHistoryByAssetId(equipmentAssetId: string): Promise<prismaClientModule.DepreciationHistory[]> {
    return prisma.depreciationHistory.findMany({
      where: { equipmentAssetId },
      orderBy: { date: "desc" },
    });
  }
}

export = DepreciationRepository;
