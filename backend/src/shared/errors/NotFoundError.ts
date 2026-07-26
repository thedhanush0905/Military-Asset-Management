import AppError = require("./AppError.js");
import HttpStatus = require("../../constants/httpStatus.js");

class NotFoundError extends AppError {
  constructor(message: string = "Not Found") {
    super(message, HttpStatus.NOT_FOUND, true);
  }
}

export = NotFoundError;
