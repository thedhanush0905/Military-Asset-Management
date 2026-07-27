import express = require("express");
import zod = require("zod");
import ValidationError = require("../../shared/errors/ValidationError.js");

const entityTypes = ["PROCUREMENT", "MAINTENANCE", "DISPOSAL", "EQUIPMENT_ASSET", "INSPECTION"] as const;

const uploadMetadataSchema = zod.object({
  entityType: zod.enum(["PROCUREMENT", "MAINTENANCE", "DISPOSAL", "EQUIPMENT_ASSET", "INSPECTION"] as any, { message: "Invalid associated entity type" }),
  entityId: zod.string().cuid("Associated entity ID must be a valid CUID"),
});

const validateUpload = (
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction
): void => {
  const result = uploadMetadataSchema.safeParse(req.body);
  if (!result.success) {
    const errorDetails = result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
    next(new ValidationError("Validation Error", errorDetails));
    return;
  }
  req.body = result.data;
  next();
};

const attachmentValidator = {
  validateUpload,
};

export = attachmentValidator;
