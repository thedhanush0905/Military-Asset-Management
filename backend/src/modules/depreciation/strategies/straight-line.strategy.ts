import IDepreciationStrategy = require("../depreciation-strategy.interface.js");

class StraightLineStrategy implements IDepreciationStrategy {
  public calculateDepreciation(params: {
    purchaseValue: number;
    residualValue: number;
    expectedLifeYears: number;
    purchaseDate: Date;
    targetDate: Date;
    rate?: number;
  }): { currentValue: number; depreciationAmount: number } {
    const { purchaseValue, residualValue, expectedLifeYears, purchaseDate, targetDate } = params;

    if (purchaseValue <= residualValue || expectedLifeYears <= 0) {
      return { currentValue: purchaseValue, depreciationAmount: 0 };
    }

    const elapsedMs = targetDate.getTime() - purchaseDate.getTime();
    if (elapsedMs <= 0) {
      return { currentValue: purchaseValue, depreciationAmount: 0 };
    }

    const elapsedYears = elapsedMs / (1000 * 60 * 60 * 24 * 365.25);
    const annualDepreciation = (purchaseValue - residualValue) / expectedLifeYears;
    const totalDepreciation = Math.min(purchaseValue - residualValue, annualDepreciation * elapsedYears);

    const currentValue = Number((purchaseValue - totalDepreciation).toFixed(2));
    const depreciationAmount = Number(totalDepreciation.toFixed(2));

    return { currentValue, depreciationAmount };
  }
}

export = StraightLineStrategy;
