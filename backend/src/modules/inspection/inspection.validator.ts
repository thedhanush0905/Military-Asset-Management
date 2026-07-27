import express = require("express");
import zod = require("zod");
import ValidationError = require("../../shared/errors/ValidationError.js");

const results = ["PENDING", "PASS", "FAIL"] as const;

const createInspectionSchema = zod.object({
  equipmentAssetId: zod.string().cuid("Invalid asset ID format"),
  scheduledDate: zod.string().datetime({ message: "Invalid scheduledDate format" }).transform((val) => new Date(val)),
  remarks: zod.string().trim().optional().nullable(),
});

const updateInspectionSchema = zod.object({
  completedDate: zod.string().datetime({ message: "Invalid completedDate format" }).transform((val) => new Date(val)).optional(),
  result: zod.enum(results).optional(),
  remarks: zod.string().trim().optional().nullable(),
});

const queryInspectionSchema = zod.object({
  page: zod.coerce.number().int().positive().default(1),
  limit: zod.coerce.number().int().positive().max(100).default(10),
  result: zod.enum(results).optional(),
  equipmentAssetId: zod.string().cuid("Invalid asset ID").optional(),
});

const validateCreate = (
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction
): void => {
  const result = createInspectionSchema.safeParse(req.body);
  if (!result.success) {
    const errorDetails = result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
    next(new ValidationError("Validation Error", errorDetails));
    return;
  }
  req.body = result.data;
  next();
};

const validateUpdate = (
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction
): void => {
  const result = updateInspectionSchema.safeParse(req.body);
  if (!result.success) {
    const errorDetails = result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
    next(new ValidationError("Validation Error", errorDetails));
    return;
  }
  req.body = result.data;
  next();
};

const validateQuery = (
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction
): void => {
  const result = queryInspectionSchema.safeParse(req.query);
  if (!result.success) {
    const errorDetails = result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
    next(new ValidationError("Validation Error", errorDetails));
    return;
  }
  const query = req.query as any;
  for (const key of Object.keys(query)) {
    delete query[key];
  }
  Object.assign(query, result.data);
  next();
};

const inspectionValidator = {
  validateCreate,
  validateUpdate,
  validateQuery,
};

export = inspectionValidator;
