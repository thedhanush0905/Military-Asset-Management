import express = require("express");
import zod = require("zod");
import ValidationError = require("../../shared/errors/ValidationError.js");

const categoryValues = ["WEAPON", "VEHICLE", "AMMUNITION", "COMMUNICATION", "MEDICAL", "OTHER"];
const unitValues = ["NOS", "ROUNDS", "BOXES", "LITRES", "KGS", "METRES"];

const createEquipmentSchema = zod.object({
  name: zod.string().trim().min(2, "Name must be at least 2 characters").max(100),
  category: zod.enum(categoryValues as any, { message: "Invalid category" }),
  unit: zod.enum(unitValues as any, { message: "Invalid unit" }),
  description: zod.string().trim().max(1000).optional().nullable(),
  manufacturer: zod.string().trim().max(100).optional().nullable(),
  model: zod.string().trim().max(100).optional().nullable(),
  specifications: zod.string().trim().max(2000).optional().nullable(),
  expectedLifeYears: zod.number().int().positive("Expected life years must be positive").optional().nullable(),
});

const updateEquipmentSchema = zod.object({
  name: zod.string().trim().min(2, "Name must be at least 2 characters").max(100).optional(),
  category: zod.enum(categoryValues as any).optional(),
  unit: zod.enum(unitValues as any).optional(),
  description: zod.string().trim().max(1000).optional().nullable(),
  manufacturer: zod.string().trim().max(100).optional().nullable(),
  model: zod.string().trim().max(100).optional().nullable(),
  specifications: zod.string().trim().max(2000).optional().nullable(),
  expectedLifeYears: zod.number().int().positive().optional().nullable(),
});

const listQuerySchema = zod.object({
  page: zod.coerce.number().int().positive().default(1),
  limit: zod.coerce.number().int().positive().max(100).default(10),
  search: zod.string().optional(),
  category: zod.enum(categoryValues as any).optional(),
  sortBy: zod.enum(["name", "category", "manufacturer", "model", "createdAt"] as any).optional().default("createdAt"),
  sortOrder: zod.enum(["asc", "desc"] as any).optional().default("desc"),
});

const validateCreateEquipment = (
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction
): void => {
  const result = createEquipmentSchema.safeParse(req.body);
  if (!result.success) {
    const errorDetails = result.error.issues.map((issue) => issue.message);
    next(new ValidationError("Validation Error", errorDetails));
    return;
  }
  req.body = result.data;
  next();
};

const validateUpdateEquipment = (
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction
): void => {

  // console.log("req.body:", req.body);
  // console.log("keys:", Object.keys(req.body ?? {}));

  const body = req.body ?? {};

  const forbiddenFields = [
    "id",
    "isActive",
    "createdAt",
    "updatedAt",
    "assets",
    "inventories",
  ];

  const passedFields = Object.keys(body);

  if (passedFields.length === 0) {
    next(
      new ValidationError(
        "Validation Error",
        ["Request body cannot be empty."]
      )
    );
    return;
  }

  const matchedForbidden = passedFields.filter((f) =>
    forbiddenFields.includes(f)
  );

  if (matchedForbidden.length > 0) {
    next(
      new ValidationError(
        "Updates to id, isActive, createdAt, updatedAt, assets, or inventories are not allowed",
        matchedForbidden
      )
    );
    return;
  }

  const result = updateEquipmentSchema.safeParse(body);

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

const equipmentValidator = {
  validateCreateEquipment,
  validateUpdateEquipment,
  validateListQuery,
};

export = equipmentValidator;
