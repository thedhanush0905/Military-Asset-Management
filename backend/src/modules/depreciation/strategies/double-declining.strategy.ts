import IDepreciationStrategy = require("../depreciation-strategy.interface.js");

class DoubleDecliningStrategy implements IDepreciationStrategy {
  public calculateDepreciation(params: {
    purchaseValue: number;
    residualValue: number;
    expectedLifeYears: number;
    purchaseDate: Date;
    targetDate: Date;
    rate?: number;
  }): { currentValue: number; depreciationAmount: number } {
    const { purchaseValue, residualValue, expectedLifeYears, purchaseDate, targetDate, rate } = params;

    if (purchaseValue <= residualValue || expectedLifeYears <= 0) {
      return { currentValue: purchaseValue, depreciationAmount: 0 };
    }

    const elapsedMs = targetDate.getTime() - purchaseDate.getTime();
    if (elapsedMs <= 0) {
      return { currentValue: purchaseValue, depreciationAmount: 0 };
    }

    const elapsedYears = elapsedMs / (1000 * 60 * 60 * 24 * 365.25);
    
    // Default factor is 2 (Double Declining) if no custom rate is provided
    const depreciationRate = rate ? (rate / 100) : (2 / expectedLifeYears);
    const valueFactor = Math.pow(1 - depreciationRate, elapsedYears);
    const calculatedValue = purchaseValue * valueFactor;

    const currentValue = Math.max(residualValue, Number(calculatedValue.toFixed(2)));
    const depreciationAmount = Number((purchaseValue - currentValue).toFixed(2));

    return { currentValue, depreciationAmount };
  }
}

export = DoubleDecliningStrategy;
