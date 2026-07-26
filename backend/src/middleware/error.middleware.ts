import express = require("express");
import AppError = require("../shared/errors/AppError.js");
import ValidationError = require("../shared/errors/ValidationError.js");
import apiResponse = require("../shared/responses/apiResponse.js");
import Messages = require("../constants/messages.js");
import HttpStatus = require("../constants/httpStatus.js");

const errorHandler = (
  err: any,
  _req: express.Request,
  res: express.Response,
  _next: express.NextFunction
): void => {
  const isDevelopment = process.env["NODE_ENV"] === "development";
  const stack = isDevelopment ? err.stack : undefined;

  if (err instanceof ValidationError) {
    apiResponse.validationResponse({
      res,
      statusCode: err.statusCode,
      message: err.message,
      details: err.details || [],
      stack,
    });
    return;
  }

  if (err instanceof AppError) {
    apiResponse.errorResponse({
      res,
      statusCode: err.statusCode,
      message: err.message,
      stack,
    });
    return;
  }

  // Handle unexpected errors
  const statusCode = err.statusCode || err.status || HttpStatus.INTERNAL_SERVER_ERROR;
  const message = statusCode === HttpStatus.INTERNAL_SERVER_ERROR ? Messages.INTERNAL_SERVER_ERROR : err.message;

  apiResponse.errorResponse({
    res,
    statusCode,
    message,
    stack,
  });
};

export = errorHandler;
