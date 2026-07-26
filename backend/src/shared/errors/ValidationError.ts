import AppError = require("./AppError.js");
import HttpStatus = require("../../constants/httpStatus.js");
import Messages = require("../../constants/messages.js");

class ValidationError extends AppError {
  public readonly details?: unknown[] | undefined;

  constructor(message: string = Messages.VALIDATION_ERROR, details?: unknown[]) {
    super(message, HttpStatus.BAD_REQUEST, true);
    this.details = details;
  }
}

export = ValidationError;
