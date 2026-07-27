import express = require("express");
import zod = require("zod");
import ValidationError = require("../../shared/errors/ValidationError.js");

const upsertConfigSchema = zod.object({
  key: zod.string().min(2, "Key must be at least 2 characters long").trim(),
  value: zod.string().min(1, "Value cannot be empty").trim(),
  description: zod.string().optional(),
});

const validateUpsert = (
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction
): void => {
  const result = upsertConfigSchema.safeParse(req.body);
  if (!result.success) {
    const errorDetails = result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
    next(new ValidationError("Validation Error", errorDetails));
    return;
  }
  req.body = result.data;
  next();
};

const systemConfigValidator = {
  validateUpsert,
};

export = systemConfigValidator;
