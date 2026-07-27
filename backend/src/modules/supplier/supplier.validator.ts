import express = require("express");
import zod = require("zod");
import ValidationError = require("../../shared/errors/ValidationError.js");

const createSupplierSchema = zod.object({
  name: zod.string().min(2, "Name must be at least 2 characters long").trim(),
  code: zod.string().min(2, "Code must be at least 2 characters long").trim().toUpperCase(),
  contactName: zod.string().trim().optional().nullable(),
  email: zod.string().email("Invalid email format").trim().optional().nullable().or(zod.literal("")),
  phone: zod.string().trim().optional().nullable(),
  address: zod.string().trim().optional().nullable(),
  status: zod.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

const updateSupplierSchema = createSupplierSchema.partial();

const querySupplierSchema = zod.object({
  page: zod.coerce.number().int().positive().default(1),
  limit: zod.coerce.number().int().positive().max(100).default(10),
  status: zod.enum(["ACTIVE", "INACTIVE"]).optional(),
  search: zod.string().trim().optional(),
});

const validateCreate = (
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction
): void => {
  const result = createSupplierSchema.safeParse(req.body);
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
  const result = updateSupplierSchema.safeParse(req.body);
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
  const result = querySupplierSchema.safeParse(req.query);
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

const supplierValidator = {
  validateCreate,
  validateUpdate,
  validateQuery,
};

export = supplierValidator;
