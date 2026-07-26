import express = require("express");
import zod = require("zod");
import ValidationError = require("../../shared/errors/ValidationError.js");

const createBaseSchema = zod.object({
  code: zod.string()
    .trim()
    .toUpperCase()
    .min(2, "Code must be at least 2 characters")
    .max(20, "Code must be at most 20 characters")
    .regex(/^[A-Z0-9_-]+$/, "Code must contain only uppercase letters, numbers, hyphens, or underscores"),
  name: zod.string().trim().min(2, "Name must be at least 2 characters"),
  location: zod.string().trim().min(2, "Location must be at least 2 characters"),
});

const updateBaseSchema = zod.object({
  code: zod.string()
    .trim()
    .toUpperCase()
    .min(2, "Code must be at least 2 characters")
    .max(20, "Code must be at most 20 characters")
    .regex(/^[A-Z0-9_-]+$/, "Code must contain only uppercase letters, numbers, hyphens, or underscores")
    .optional(),
  name: zod.string().trim().min(2, "Name must be at least 2 characters").optional(),
  location: zod.string().trim().min(2, "Location must be at least 2 characters").optional(),
});

const listQuerySchema = zod.object({
  page: zod.coerce.number().int().positive().default(1),
  limit: zod.coerce.number().int().positive().max(100).default(10),
  search: zod.string().optional(),
  sortBy: zod.enum(["code", "name", "location", "createdAt"]).optional().default("createdAt"),
  sortOrder: zod.enum(["asc", "desc"]).optional().default("desc"),
});

const validateCreateBase = (
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction
): void => {
  const result = createBaseSchema.safeParse(req.body);
  if (!result.success) {
    const errorDetails = result.error.issues.map((issue) => issue.message);
    next(new ValidationError("Validation Error", errorDetails));
    return;
  }
  req.body = result.data;
  next();
};

const validateUpdateBase = (
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction
): void => {
  const forbiddenFields = ["id", "isActive", "createdAt", "updatedAt", "users", "inventories", "equipment"];
  const passedFields = Object.keys(req.body);
  const matchedForbidden = passedFields.filter((f) => forbiddenFields.includes(f));
  
  if (matchedForbidden.length > 0) {
    next(new ValidationError("Updates to id, isActive, createdAt, updatedAt, users, inventories, or equipment are not allowed", matchedForbidden));
    return;
  }

  const result = updateBaseSchema.safeParse(req.body);
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

const baseValidator = {
  validateCreateBase,
  validateUpdateBase,
  validateListQuery,
};

export = baseValidator;
