import express = require("express");
import zod = require("zod");
import ValidationError = require("../../shared/errors/ValidationError.js");

const decimalSchema = zod.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid cost value: must be a decimal number with up to 2 decimal places");

const createItemSchema = zod.object({
  equipmentId: zod.string().cuid("Invalid equipment catalog model ID"),
  quantity: zod.number().int().positive("Quantity must be a positive integer"),
  unitCost: decimalSchema,
});

const createProcurementSchema = zod.object({
  procurementNumber: zod.string().trim().min(3, "Procurement number must be at least 3 characters").max(50),
  supplier: zod.string().trim().min(2, "Supplier must be at least 2 characters").max(100),
  purchaseDate: zod.string().datetime().transform((val) => new Date(val)),
  expectedDeliveryDate: zod.string().datetime().transform((val) => new Date(val)),
  baseId: zod.string().cuid("Invalid destination base ID"),
  remarks: zod.string().trim().max(1000).optional().nullable(),
  items: zod.array(createItemSchema).min(1, "Procurement must contain at least one item"),
});

const receiveItemSchema = zod.object({
  equipmentId: zod.string().cuid("Invalid equipment catalog model ID"),
  serialNumbers: zod.array(zod.string().trim().min(2, "Serial number must be at least 2 characters")).min(1, "Must provide at least one serial number"),
});

const receiveProcurementSchema = zod.object({
  items: zod.array(receiveItemSchema).min(1, "Must specify items to receive"),
}).refine((data) => Object.keys(data).length > 0, {
  message: "PATCH payload cannot be empty",
});

const listQuerySchema = zod.object({
  page: zod.coerce.number().int().positive().default(1),
  limit: zod.coerce.number().int().positive().max(100).default(10),
  search: zod.string().optional(),
  baseId: zod.string().optional(),
  supplier: zod.string().optional(),
  status: zod.enum(["DRAFT", "APPROVED", "PARTIALLY_RECEIVED", "RECEIVED", "CANCELLED"]).optional(),
  sortBy: zod.enum(["purchaseDate", "createdAt"]).optional().default("createdAt"),
  sortOrder: zod.enum(["asc", "desc"]).optional().default("desc"),
});

const validateCreate = (
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction
): void => {
  const result = createProcurementSchema.safeParse(req.body);
  if (!result.success) {
    const errorDetails = result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
    next(new ValidationError("Validation Error", errorDetails));
    return;
  }
  req.body = result.data;
  next();
};

const validateReceive = (
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction
): void => {
  const result = receiveProcurementSchema.safeParse(req.body);
  if (!result.success) {
    const errorDetails = result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
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

const procurementValidator = {
  validateCreate,
  validateReceive,
  validateListQuery,
};

export = procurementValidator;
