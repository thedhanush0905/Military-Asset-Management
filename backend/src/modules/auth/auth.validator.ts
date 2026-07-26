import express = require("express");
import zod = require("zod");
import ValidationError = require("../../shared/errors/ValidationError.js");

const loginSchema = zod.object({
  email: zod.string().email("Email format is invalid"),
  password: zod.string().min(6, "Password must be at least 6 characters long"),
});

const validateLogin = (
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction
): void => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    const errorDetails = result.error.issues.map((issue) => issue.message);
    next(new ValidationError("Validation Error", errorDetails));
    return;
  }

  req.body = result.data;
  next();
};

const authValidator = {
  validateLogin,
};

export = authValidator;
