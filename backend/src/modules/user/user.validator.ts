import express = require("express");
import zod = require("zod");
import prismaClientModule = require("../../../generated/prisma/index.js");
import ValidationError = require("../../shared/errors/ValidationError.js");

const createUserSchema = zod.object({
  name: zod.string().min(2, "Name must be at least 2 characters long"),
  email: zod.string().email("Email format is invalid"),
  password: zod.string().min(6, "Password must be at least 6 characters long"),
  role: zod.nativeEnum(prismaClientModule.Role),
  baseId: zod.string().nullable().optional(),
});

const updateUserSchema = zod.object({
  name: zod.string().min(2, "Name must be at least 2 characters long").optional(),
  email: zod.string().email("Email format is invalid").optional(),
  role: zod.nativeEnum(prismaClientModule.Role).optional(),
  status: zod.nativeEnum(prismaClientModule.UserStatus).optional(),
  baseId: zod.string().nullable().optional(),
});

const listQuerySchema = zod.object({
  page: zod.coerce.number().int().positive().default(1),
  limit: zod.coerce.number().int().positive().max(100).default(10),
  search: zod.string().optional(),
  role: zod.nativeEnum(prismaClientModule.Role).optional(),
  status: zod.nativeEnum(prismaClientModule.UserStatus).optional(),
  base: zod.string().optional(),
  sortBy: zod.enum(["name", "email", "role", "status", "createdAt"]).optional().default("createdAt"),
  sortOrder: zod.enum(["asc", "desc"]).optional().default("desc"),
});

const validateCreateUser = (
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction
): void => {
  const result = createUserSchema.safeParse(req.body);
  if (!result.success) {
    const errorDetails = result.error.issues.map((issue) => issue.message);
    next(new ValidationError("Validation Error", errorDetails));
    return;
  }
  req.body = result.data;
  next();
};

const validateUpdateUser = (
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction
): void => {
  const forbiddenFields = ["password", "id", "createdAt", "updatedAt"];
  const passedFields = Object.keys(req.body);
  const matchedForbidden = passedFields.filter((f) => forbiddenFields.includes(f));
  if (matchedForbidden.length > 0) {
    next(new ValidationError("Updates to password, id, createdAt, or updatedAt are not allowed", matchedForbidden));
    return;
  }

  const result = updateUserSchema.safeParse(req.body);
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

const userValidator = {
  validateCreateUser,
  validateUpdateUser,
  validateListQuery,
};

export = userValidator;
