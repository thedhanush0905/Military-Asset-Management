import express = require("express");
import zod = require("zod");
import ValidationError = require("../../shared/errors/ValidationError.js");

const notificationQuerySchema = zod.object({
  page: zod.coerce.number().int().positive().default(1),
  limit: zod.coerce.number().int().positive().max(100).default(10),
  priority: zod.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  type: zod.enum(["MAINTENANCE", "PROCUREMENT", "TRANSFER", "ASSIGNMENT", "DISPOSAL", "SYSTEM"]).optional(),
  isRead: zod
    .string()
    .transform((val) => val === "true")
    .optional(),
});

const validateQuery = (
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction
): void => {
  const result = notificationQuerySchema.safeParse(req.query);
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

const notificationValidator = {
  validateQuery,
};

export = notificationValidator;
