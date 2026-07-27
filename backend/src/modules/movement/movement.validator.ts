import express = require("express");
import zod = require("zod");
import ValidationError = require("../../shared/errors/ValidationError.js");

const listQuerySchema = zod.object({
  page: zod.coerce.number().int().positive().default(1),
  limit: zod.coerce.number().int().positive().max(100).default(10),
  search: zod.string().optional(),
  equipmentAssetId: zod.string().optional(),
  movementType: zod.enum([
    "ASSIGNMENT",
    "RETURN",
    "TRANSFER_OUT",
    "TRANSFER_IN",
    "MAINTENANCE_START",
    "MAINTENANCE_COMPLETE",
    "PROCUREMENT",
    "DISPOSAL"
  ]).optional(),
  sourceBaseId: zod.string().optional(),
  destinationBaseId: zod.string().optional(),
  referenceType: zod.enum([
    "ASSIGNMENT",
    "TRANSFER",
    "MAINTENANCE",
    "PROCUREMENT",
    "DISPOSAL"
  ]).optional(),
  referenceId: zod.string().optional(),
  sortBy: zod.enum(["createdAt"]).optional().default("createdAt"),
  sortOrder: zod.enum(["asc", "desc"]).optional().default("desc"),
});

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

const movementValidator = {
  validateListQuery,
};

export = movementValidator;
