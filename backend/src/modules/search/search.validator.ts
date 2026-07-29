import express = require("express");
import zod = require("zod");
import ValidationError = require("../../shared/errors/ValidationError.js");

const searchSchema = zod.object({
  q: zod.string().min(1, "Search query must be at least 1 character long").trim(),
  limit: zod.coerce.number().int().positive().max(100).default(10).optional(),
});

const validateSearch = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void => {
  const result = searchSchema.safeParse(req.query);
  if (!result.success) {
    const errorDetails = result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
    next(new ValidationError("Validation Error", errorDetails));
    return;
  }
  res.locals.searchQuery = result.data;
  next();
};

const searchValidator = {
  validateSearch,
};

export = searchValidator;
