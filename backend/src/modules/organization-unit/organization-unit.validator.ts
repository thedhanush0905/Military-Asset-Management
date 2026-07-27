import express = require("express");
import zod = require("zod");
import ValidationError = require("../../shared/errors/ValidationError.js");

const levels = ["COMMAND", "DIVISION", "BRIGADE", "BATTALION", "COMPANY", "PLATOON", "SECTION"] as const;

const createUnitSchema = zod.object({
  name: zod.string().min(2, "Name must be at least 2 characters long").trim(),
  code: zod.string().min(2, "Code must be at least 2 characters long").trim().toUpperCase(),
  level: zod.enum(levels),
  parentId: zod.string().cuid("Invalid parent ID format").optional().nullable(),
});

const updateUnitSchema = createUnitSchema.partial();

const validateCreate = (
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction
): void => {
  const result = createUnitSchema.safeParse(req.body);
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
  const result = updateUnitSchema.safeParse(req.body);
  if (!result.success) {
    const errorDetails = result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
    next(new ValidationError("Validation Error", errorDetails));
    return;
  }
  req.body = result.data;
  next();
};

const organizationUnitValidator = {
  validateCreate,
  validateUpdate,
};

export = organizationUnitValidator;
