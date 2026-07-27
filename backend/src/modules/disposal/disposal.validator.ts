import express = require("express");
import zod = require("zod");
import ValidationError = require("../../shared/errors/ValidationError.js");

const decimalSchema = zod.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid value: must be a decimal number with up to 2 decimal places");

const createDisposalSchema = zod.object({
  equipmentAssetId: zod.string().trim().cuid("Invalid equipment asset ID"),
  disposalReason: zod.enum(["RETIRED", "DAMAGED", "LOST", "DESTROYED", "SOLD", "SCRAPPED"]),
  bookValue: decimalSchema.optional().nullable(),
  remarks: zod.string().trim().max(1000).optional().nullable(),
});

const completeDisposalSchema = zod.object({
  disposalDate: zod.string().datetime().transform((val) => new Date(val)).optional(),
  remarks: zod.string().trim().max(1000).optional().nullable(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "PATCH payload cannot be empty",
});

const cancelDisposalSchema = zod.object({
  remarks: zod.string().trim().max(1000).optional().nullable(),
});

const listQuerySchema = zod.object({
  page: zod.coerce.number().int().positive().default(1),
  limit: zod.coerce.number().int().positive().max(100).default(10),
  search: zod.string().optional(),
  baseId: zod.string().optional(),
  disposalReason: zod.enum(["RETIRED", "DAMAGED", "LOST", "DESTROYED", "SOLD", "SCRAPPED"]).optional(),
  status: zod.enum(["PENDING", "APPROVED", "COMPLETED", "CANCELLED"]).optional(),
  sortBy: zod.enum(["disposalDate", "createdAt"]).optional().default("createdAt"),
  sortOrder: zod.enum(["asc", "desc"]).optional().default("desc"),
});

const validateCreate = (
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction
): void => {
  const result = createDisposalSchema.safeParse(req.body);
  if (!result.success) {
    const errorDetails = result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
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
  const result = completeDisposalSchema.safeParse(req.body);
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
  const result = cancelDisposalSchema.safeParse(req.body);
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

const disposalValidator = {
  validateCreate,
  validateComplete,
  validateCancel,
  validateListQuery,
};

export = disposalValidator;
