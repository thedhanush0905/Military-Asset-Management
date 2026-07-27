import express = require("express");
import zod = require("zod");
import ValidationError = require("../../shared/errors/ValidationError.js");

const methods = ["STRAIGHT_LINE", "DOUBLE_DECLINING"] as const;

const setupValuationSchema = zod.object({
  equipmentAssetId: zod.string().cuid("Invalid asset ID format"),
  residualValue: zod.coerce.number().nonnegative("Residual value cannot be negative"),
  depreciationMethod: zod.enum(methods),
  depreciationRate: zod.coerce.number().min(0).max(100, "Depreciation rate percentage must be between 0 and 100"),
});

const calculateQuerySchema = zod.object({
  targetDate: zod.string().datetime({ message: "Invalid targetDate format" }).transform((val) => new Date(val)).optional(),
});

const validateSetup = (
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction
): void => {
  const result = setupValuationSchema.safeParse(req.body);
  if (!result.success) {
    const errorDetails = result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
    next(new ValidationError("Validation Error", errorDetails));
    return;
  }
  req.body = result.data;
  next();
};

const validateCalculateQuery = (
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction
): void => {
  const result = calculateQuerySchema.safeParse(req.query);
  if (!result.success) {
    const errorDetails = result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
    next(new ValidationError("Validation Error", errorDetails));
    return;
  }
  req.query = result.data as any;
  next();
};

const depreciationValidator = {
  validateSetup,
  validateCalculateQuery,
};

export = depreciationValidator;
