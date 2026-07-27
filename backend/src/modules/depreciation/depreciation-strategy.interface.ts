abstract class IDepreciationStrategy {
  abstract calculateDepreciation(params: {
    purchaseValue: number;
    residualValue: number;
    expectedLifeYears: number;
    purchaseDate: Date;
    targetDate: Date;
    rate?: number;
  }): { currentValue: number; depreciationAmount: number };
}

export = IDepreciationStrategy;
