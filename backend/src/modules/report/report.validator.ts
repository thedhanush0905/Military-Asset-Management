import express = require("express");
import zod = require("zod");
import ValidationError = require("../../shared/errors/ValidationError.js");

const reportTypes = ["INVENTORY", "ASSETS", "MAINTENANCE", "PROCUREMENT", "DISPOSALS"] as const;
const formats = ["PDF", "XLSX", "CSV"] as const;

const requestReportSchema = zod.object({
  reportType: zod.enum(["INVENTORY", "ASSETS", "MAINTENANCE", "PROCUREMENT", "DISPOSALS"] as any, { message: "Invalid report type" }),
  exportFormat: zod.enum(["PDF", "XLSX", "CSV"] as any, { message: "Invalid export format" }),
  filters: zod.record(zod.string(), zod.any()).optional().default({}),
});

const validateRequest = (
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction
): void => {
  const result = requestReportSchema.safeParse(req.body);
  if (!result.success) {
    const errorDetails = result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
    next(new ValidationError("Validation Error", errorDetails));
    return;
  }
  req.body = result.data;
  next();
};

const reportValidator = {
  validateRequest,
};

export = reportValidator;
