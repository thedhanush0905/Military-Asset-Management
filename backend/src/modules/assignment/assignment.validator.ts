import express = require("express");
import zod = require("zod");
import ValidationError = require("../../shared/errors/ValidationError.js");

const createAssignmentSchema = zod.object({
  equipmentAssetId: zod.string().trim().cuid("Invalid equipment asset ID"),
  assignedTo: zod.string().trim().min(2, "AssignedTo must be at least 2 characters").max(100),
  remarks: zod.string().trim().max(1000).optional().nullable(),
});

const listQuerySchema = zod.object({
  page: zod.coerce.number().int().positive().default(1),
  limit: zod.coerce.number().int().positive().max(100).default(10),
  search: zod.string().optional(),
  baseId: zod.string().optional(),
  equipmentAssetId: zod.string().optional(),
  status: zod.enum(["ACTIVE", "RETURNED"]).optional(),
  sortBy: zod.enum(["assignedAt", "returnedAt", "createdAt"]).optional().default("createdAt"),
  sortOrder: zod.enum(["asc", "desc"]).optional().default("desc"),
});

const validateCreateAssignment = (
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction
): void => {
  const result = createAssignmentSchema.safeParse(req.body);
  if (!result.success) {
    const errorDetails = result.error.issues.map((issue) => issue.message);
    next(new ValidationError("Validation Error", errorDetails));
    return;
  }

  // Defensively reject manual overwrite keys
  const forbiddenFields = ["id", "status", "assignedById", "assignedAt", "returnedAt", "returnedById"];
  const passedFields = Object.keys(req.body);
  const matchedForbidden = passedFields.filter((f) => forbiddenFields.includes(f));
  if (matchedForbidden.length > 0) {
    next(new ValidationError("Fields are not allowed during creation", matchedForbidden));
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

const assignmentValidator = {
  validateCreateAssignment,
  validateListQuery,
};

export = assignmentValidator;
