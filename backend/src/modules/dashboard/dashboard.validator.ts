import express = require("express");
import zod = require("zod");
import ValidationError = require("../../shared/errors/ValidationError.js");

const dashboardQuerySchema = zod.object({
  baseId: zod.string().cuid("Invalid base ID format").optional(),
  equipmentId: zod.string().cuid("Invalid equipment ID format").optional(),
  startDate: zod.string().datetime({ message: "Invalid start date format (ISO datetime expected)" }).transform((val) => new Date(val)).optional(),
  endDate: zod.string().datetime({ message: "Invalid end date format (ISO datetime expected)" }).transform((val) => new Date(val)).optional(),
  page: zod.coerce.number().int().positive().default(1),
  limit: zod.coerce.number().int().positive().max(100).default(10),
  search: zod.string().trim().optional(),
});

const validateQuery = (
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction
): void => {
  const result = dashboardQuerySchema.safeParse(req.query);
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

const dashboardValidator = {
  validateQuery,
};

export = dashboardValidator;
