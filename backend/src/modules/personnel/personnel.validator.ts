import express = require("express");
import zod = require("zod");
import ValidationError = require("../../shared/errors/ValidationError.js");

const statuses = ["ACTIVE", "INACTIVE", "DEPLOYED", "ON_LEAVE"] as const;

const createPersonnelSchema = zod.object({
  serviceNumber: zod.string().min(2, "Service Number must be at least 2 characters long").trim().toUpperCase(),
  rank: zod.string().min(1, "Rank cannot be empty").trim(),
  firstName: zod.string().min(1, "First Name cannot be empty").trim(),
  lastName: zod.string().min(1, "Last Name cannot be empty").trim(),
  unitId: zod.string().cuid("Invalid organizational unit ID").optional().nullable(),
  email: zod.string().email("Invalid email format").trim().optional().nullable().or(zod.literal("")),
  phone: zod.string().trim().optional().nullable(),
  status: zod.enum(statuses).default("ACTIVE"),
});

const updatePersonnelSchema = createPersonnelSchema.partial();

const queryPersonnelSchema = zod.object({
  page: zod.coerce.number().int().positive().default(1),
  limit: zod.coerce.number().int().positive().max(100).default(10),
  status: zod.enum(statuses).optional(),
  unitId: zod.string().cuid("Invalid organizational unit ID").optional(),
  search: zod.string().trim().optional(),
});

const validateCreate = (
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction
): void => {
  const result = createPersonnelSchema.safeParse(req.body);
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
  const result = updatePersonnelSchema.safeParse(req.body);
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
  const result = queryPersonnelSchema.safeParse(req.query);
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

const personnelValidator = {
  validateCreate,
  validateUpdate,
  validateQuery,
};

export = personnelValidator;
