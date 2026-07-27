import express = require("express");
import zod = require("zod");
import ValidationError = require("../../shared/errors/ValidationError.js");

const statusValues = ["AVAILABLE", "ASSIGNED", "TRANSIT", "MAINTENANCE", "DAMAGED", "LOST", "RETIRED"] as const;
const conditionValues = ["NEW", "GOOD", "FAIR", "DAMAGED", "UNSERVICEABLE"] as const;

const createAssetSchema = zod.object({
  equipmentId: zod.string().trim().cuid("Invalid equipment ID"),
  baseId: zod.string().trim().cuid("Invalid base ID"),
  serialNumber: zod.string().trim().min(2, "Serial number must be at least 2 characters").max(100),
  purchaseDate: zod.preprocess((val) => (val === undefined || val === null ? null : typeof val === "string" ? new Date(val) : val), zod.date().nullable().optional()),
  purchaseCost: zod.preprocess((val) => (typeof val === "string" ? parseFloat(val) : val), zod.number().nonnegative("Purchase cost cannot be negative")),
  status: zod.enum(statusValues).optional().default("AVAILABLE"),
  condition: zod.enum(conditionValues).optional().default("NEW"),
  remarks: zod.string().trim().max(1000).optional().nullable(),
});

const updateAssetSchema = zod.object({
  serialNumber: zod.string().trim().min(2, "Serial number must be at least 2 characters").max(100).optional(),
  purchaseDate: zod.preprocess((val) => (val === undefined || val === null ? null : typeof val === "string" ? new Date(val) : val), zod.date().nullable().optional()),
  purchaseCost: zod.preprocess((val) => (val === undefined ? undefined : typeof val === "string" ? parseFloat(val) : val), zod.number().nonnegative().optional()),
  status: zod.enum(statusValues).optional(),
  condition: zod.enum(conditionValues).optional(),
  remarks: zod.string().trim().max(1000).optional().nullable(),
});

const listQuerySchema = zod.object({
  page: zod.coerce.number().int().positive().default(1),
  limit: zod.coerce.number().int().positive().max(100).default(10),
  search: zod.string().optional(),
  baseId: zod.string().optional(),
  equipmentId: zod.string().optional(),
  status: zod.enum(statusValues).optional(),
  condition: zod.enum(conditionValues).optional(),
  sortBy: zod.enum(["serialNumber", "status", "condition", "purchaseCost", "purchaseDate", "createdAt"]).optional().default("createdAt"),
  sortOrder: zod.enum(["asc", "desc"]).optional().default("desc"),
});

const validateCreateAsset = (
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction
): void => {
  const result = createAssetSchema.safeParse(req.body);
  if (!result.success) {
    const errorDetails = result.error.issues.map((issue) => issue.message);
    next(new ValidationError("Validation Error", errorDetails));
    return;
  }
  req.body = result.data;
  next();
};

const validateUpdateAsset = (
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction
): void => {
  const forbiddenFields = ["id", "isActive", "createdAt", "updatedAt", "equipmentId", "baseId"];
  const passedFields = Object.keys(req.body);
  const matchedForbidden = passedFields.filter((f) => forbiddenFields.includes(f));
  
  if (matchedForbidden.length > 0) {
    next(new ValidationError("Updates to id, isActive, createdAt, updatedAt, equipmentId, or baseId are not allowed", matchedForbidden));
    return;
  }

  const result = updateAssetSchema.safeParse(req.body);
  if (!result.success) {
    const errorDetails = result.error.issues.map((issue) => issue.message);
    next(new ValidationError("Validation Error", errorDetails));
    return;
  }
  req.body = result.data;
  next();
};

const validateListQuery = (
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction
): void => {
  const result = listQuerySchema.safeParse(req.query);
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

const equipmentAssetValidator = {
  validateCreateAsset,
  validateUpdateAsset,
  validateListQuery,
};

export = equipmentAssetValidator;
