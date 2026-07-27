import express = require("express");
import zod = require("zod");
import ValidationError = require("../../shared/errors/ValidationError.js");

const decimalSchema = zod.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid cost value: must be a decimal number with up to 2 decimal places");

const createMaintenanceSchema = zod.object({
  equipmentAssetId: zod.string().trim().cuid("Invalid equipment asset ID"),
  maintenanceType: zod.enum(["PREVENTIVE", "CORRECTIVE", "INSPECTION", "CALIBRATION"]),
  description: zod.string().trim().min(3, "Description must be at least 3 characters").max(1000),
  scheduledDate: zod.string().datetime({ message: "Invalid scheduled date (ISO datetime format required)" }).transform((val) => new Date(val)),
  expectedCompletionDate: zod.string().datetime().transform((val) => new Date(val)).optional().nullable(),
  estimatedCost: decimalSchema.optional().nullable(),
  remarks: zod.string().trim().max(1000).optional().nullable(),
});

const startMaintenanceSchema = zod.object({
  startedAt: zod.string().datetime().transform((val) => new Date(val)).optional(),
  vendorName: zod.string().trim().max(255).optional().nullable(),
  technicianName: zod.string().trim().max(255).optional().nullable(),
  remarks: zod.string().trim().max(1000).optional().nullable(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "PATCH payload cannot be empty",
});

const completeMaintenanceSchema = zod.object({
  completedAt: zod.string().datetime().transform((val) => new Date(val)).optional(),
  actualCost: decimalSchema.optional().nullable(),
  remarks: zod.string().trim().max(1000).optional().nullable(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "PATCH payload cannot be empty",
});

const cancelMaintenanceSchema = zod.object({
  remarks: zod.string().trim().max(1000).optional().nullable(),
});

const listQuerySchema = zod.object({
  page: zod.coerce.number().int().positive().default(1),
  limit: zod.coerce.number().int().positive().max(100).default(10),
  search: zod.string().optional(),
  equipmentAssetId: zod.string().optional(),
  baseId: zod.string().optional(),
  maintenanceType: zod.enum(["PREVENTIVE", "CORRECTIVE", "INSPECTION", "CALIBRATION"]).optional(),
  status: zod.enum(["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
  sortBy: zod.enum(["scheduledDate", "createdAt"]).optional().default("createdAt"),
  sortOrder: zod.enum(["asc", "desc"]).optional().default("desc"),
});

const validateCreate = (
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction
): void => {
  const result = createMaintenanceSchema.safeParse(req.body);
  if (!result.success) {
    const errorDetails = result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
    next(new ValidationError("Validation Error", errorDetails));
    return;
  }
  req.body = result.data;
  next();
};

const validateStart = (
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction
): void => {
  const result = startMaintenanceSchema.safeParse(req.body);
  if (!result.success) {
    const errorDetails = result.error.issues.map((issue) => issue.message);
    next(new ValidationError("Validation Error", errorDetails));
    return;
  }
  req.body = result.data;
  next();
};

const validateComplete = (
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction
): void => {
  const result = completeMaintenanceSchema.safeParse(req.body);
  if (!result.success) {
    const errorDetails = result.error.issues.map((issue) => issue.message);
    next(new ValidationError("Validation Error", errorDetails));
    return;
  }
  req.body = result.data;
  next();
};

const validateCancel = (
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction
): void => {
  const result = cancelMaintenanceSchema.safeParse(req.body);
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

const maintenanceValidator = {
  validateCreate,
  validateStart,
  validateComplete,
  validateCancel,
  validateListQuery,
};

export = maintenanceValidator;
