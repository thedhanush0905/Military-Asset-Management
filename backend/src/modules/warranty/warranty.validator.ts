import express = require("express");
import zod = require("zod");
import ValidationError = require("../../shared/errors/ValidationError.js");

const statuses = ["ACTIVE", "EXPIRED", "VOIDED"] as const;

const createWarrantySchema = zod
  .object({
    equipmentAssetId: zod.string().cuid("Invalid asset ID format"),
    startDate: zod.string().datetime({ message: "Invalid startDate format" }).transform((val) => new Date(val)),
    endDate: zod.string().datetime({ message: "Invalid endDate format" }).transform((val) => new Date(val)),
    vendorId: zod.string().cuid("Invalid supplier ID format").optional().nullable(),
    coverageDetails: zod.string().trim().optional().nullable(),
    status: zod.enum(statuses).default("ACTIVE"),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "endDate must be later than startDate",
    path: ["endDate"],
  });

const updateWarrantySchema = zod
  .object({
    startDate: zod.string().datetime({ message: "Invalid startDate format" }).transform((val) => new Date(val)).optional(),
    endDate: zod.string().datetime({ message: "Invalid endDate format" }).transform((val) => new Date(val)).optional(),
    vendorId: zod.string().cuid("Invalid supplier ID").optional().nullable(),
    coverageDetails: zod.string().trim().optional().nullable(),
    status: zod.enum(statuses).optional(),
  })
  .refine((data) => {
    if (data.startDate && data.endDate) {
      return data.endDate > data.startDate;
    }
    return true;
  }, {
    message: "endDate must be later than startDate",
    path: ["endDate"],
  });

const queryWarrantySchema = zod.object({
  page: zod.coerce.number().int().positive().default(1),
  limit: zod.coerce.number().int().positive().max(100).default(10),
  status: zod.enum(statuses).optional(),
  equipmentAssetId: zod.string().cuid("Invalid asset ID").optional(),
});

const validateCreate = (
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction
): void => {
  const result = createWarrantySchema.safeParse(req.body);
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
  const result = updateWarrantySchema.safeParse(req.body);
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
  const result = queryWarrantySchema.safeParse(req.query);
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

const warrantyValidator = {
  validateCreate,
  validateUpdate,
  validateQuery,
};

export = warrantyValidator;
