import DepreciationRepository = require("./depreciation.repository.js");
import StraightLineStrategy = require("./strategies/straight-line.strategy.js");
import DoubleDecliningStrategy = require("./strategies/double-declining.strategy.js");
import NotFoundError = require("../../shared/errors/NotFoundError.js");
import ForbiddenError = require("../../shared/errors/ForbiddenError.js");
import ValidationError = require("../../shared/errors/ValidationError.js");
import prisma = require("../../shared/prisma/prisma.js");
import prismaClientModule = require("../../../generated/prisma/index.js");
import AuditService = require("../../shared/services/audit.service.js");

class DepreciationService {
  private readonly depreciationRepository: DepreciationRepository;
  private readonly straightLineStrategy: StraightLineStrategy;
  private readonly doubleDecliningStrategy: DoubleDecliningStrategy;

  constructor() {
    this.depreciationRepository = new DepreciationRepository();
    this.straightLineStrategy = new StraightLineStrategy();
    this.doubleDecliningStrategy = new DoubleDecliningStrategy();
  }

  public async setupValuation(
    currentUser: prismaClientModule.User,
    data: any
  ): Promise<prismaClientModule.AssetValuation> {
    if (currentUser.role !== "ADMIN" && currentUser.role !== "BASE_COMMANDER") {
      throw new ForbiddenError("Access Denied: Insufficient permissions to manage asset valuations");
    }

    const asset = await prisma.equipmentAsset.findFirst({
      where: { id: data.equipmentAssetId, isActive: true },
      include: { equipment: true },
    });

    if (!asset) {
      throw new NotFoundError("Associated asset not found or inactive");
    }

    if (currentUser.role !== "ADMIN" && asset.baseId !== currentUser.baseId) {
      throw new ForbiddenError("Access Denied: Asset belongs to another base");
    }

    if (Number(data.residualValue) > Number(asset.purchaseCost)) {
      throw new ValidationError("Residual value cannot exceed the original purchase cost");
    }

    const valuation = await this.depreciationRepository.upsertValuation({
      equipmentAssetId: data.equipmentAssetId,
      purchaseValue: asset.purchaseCost,
      currentValue: asset.purchaseCost,
      bookValue: asset.purchaseCost,
      residualValue: data.residualValue,
      depreciationMethod: data.depreciationMethod,
      depreciationRate: data.depreciationRate,
      lastCalculatedAt: null,
    });

    await AuditService.logAction({
      userId: currentUser.id,
      performedByType: "USER",
      module: "DEPRECIATION",
      action: "VALUATION_SETUP",
      entityType: "AssetValuation",
      entityId: valuation.id,
      newValues: { purchaseValue: valuation.purchaseValue, residualValue: valuation.residualValue, method: valuation.depreciationMethod },
    });

    return valuation;
  }

  public async calculateAssetDepreciation(
    currentUser: prismaClientModule.User,
    equipmentAssetId: string,
    targetDate: Date
  ): Promise<prismaClientModule.AssetValuation> {
    const valuation = await this.depreciationRepository.findValuationByAssetId(equipmentAssetId);
    if (!valuation) {
      throw new NotFoundError(`Asset valuation parameters have not been set up for asset ID '${equipmentAssetId}'`);
    }

    if (currentUser.role !== "ADMIN" && (valuation as any).equipmentAsset.baseId !== currentUser.baseId) {
      throw new ForbiddenError("Access Denied: Asset belongs to another base scope");
    }

    const purchaseDate = (valuation as any).equipmentAsset.purchaseDate || (valuation as any).equipmentAsset.createdAt;
    if (targetDate < purchaseDate) {
      throw new ValidationError("Target calculation date cannot be earlier than the asset purchase date");
    }

    const expectedLifeYears = (valuation as any).equipmentAsset.equipment.expectedLifeYears || 5;

    // Resolve Strategy pattern
    const strategy =
      valuation.depreciationMethod === "DOUBLE_DECLINING"
        ? this.doubleDecliningStrategy
        : this.straightLineStrategy;

    const result = strategy.calculateDepreciation({
      purchaseValue: Number(valuation.purchaseValue),
      residualValue: Number(valuation.residualValue),
      expectedLifeYears,
      purchaseDate,
      targetDate,
      rate: Number(valuation.depreciationRate),
    });

    const previousBookValue = valuation.bookValue;

    // Save calculation run
    const updatedValuation = await this.depreciationRepository.upsertValuation({
      equipmentAssetId,
      purchaseValue: valuation.purchaseValue,
      currentValue: result.currentValue,
      bookValue: result.currentValue,
      residualValue: valuation.residualValue,
      depreciationMethod: valuation.depreciationMethod,
      depreciationRate: valuation.depreciationRate,
      lastCalculatedAt: new Date(),
    });

    // Save to historical log if there is any depreciated difference
    const depreciationDelta = Number(previousBookValue) - result.currentValue;
    if (depreciationDelta > 0) {
      await this.depreciationRepository.createDepreciationHistory({
        equipmentAssetId,
        date: targetDate,
        amount: depreciationDelta,
        previousBookValue,
        newBookValue: result.currentValue,
      });
    }

    await AuditService.logAction({
      userId: currentUser.id,
      performedByType: "USER",
      module: "DEPRECIATION",
      action: "ASSET_DEPRECIATE",
      entityType: "AssetValuation",
      entityId: valuation.id,
      oldValues: { bookValue: previousBookValue },
      newValues: { bookValue: result.currentValue, depreciationAmount: depreciationDelta },
    });

    return updatedValuation;
  }

  public async getValuations(currentUser: prismaClientModule.User, query: any) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);

    const where: prismaClientModule.Prisma.AssetValuationWhereInput = {};

    if (currentUser.role !== "ADMIN") {
      where.equipmentAsset = {
        baseId: currentUser.baseId!,
        isActive: true,
      };
    } else {
      where.equipmentAsset = {
        isActive: true,
      };
    }

    const { valuations, total } = await this.depreciationRepository.findValuations(where, {
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      valuations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  public async getAssetValuationHistory(
    currentUser: prismaClientModule.User,
    equipmentAssetId: string
  ): Promise<prismaClientModule.DepreciationHistory[]> {
    const valuation = await this.depreciationRepository.findValuationByAssetId(equipmentAssetId);
    if (!valuation) {
      throw new NotFoundError("Valuation record not found");
    }

    if (currentUser.role !== "ADMIN" && (valuation as any).equipmentAsset.baseId !== currentUser.baseId) {
      throw new ForbiddenError("Access Denied: Asset belongs to another base scope");
    }

    return this.depreciationRepository.findHistoryByAssetId(equipmentAssetId);
  }
}

export = DepreciationService;
