import AppError = require("./AppError.js");
import HttpStatus = require("../../constants/httpStatus.js");

class ConflictError extends AppError {
  constructor(message: string) {
    super(message, HttpStatus.CONFLICT);
  }
}

export = ConflictError;
