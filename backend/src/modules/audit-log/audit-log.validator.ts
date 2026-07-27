import express = require("express");
import zod = require("zod");
import ValidationError = require("../../shared/errors/ValidationError.js");

const auditLogQuerySchema = zod.object({
  page: zod.coerce.number().int().positive().default(1),
  limit: zod.coerce.number().int().positive().max(100).default(10),
  module: zod.string().trim().optional(),
  userId: zod.string().trim().optional(),
  action: zod.string().trim().optional(),
  startDate: zod.string().datetime({ message: "Invalid startDate format" }).transform((val) => new Date(val)).optional(),
  endDate: zod.string().datetime({ message: "Invalid endDate format" }).transform((val) => new Date(val)).optional(),
});

const validateQuery = (
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction
): void => {
  const result = auditLogQuerySchema.safeParse(req.query);
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

const auditLogValidator = {
  validateQuery,
};

export = auditLogValidator;
