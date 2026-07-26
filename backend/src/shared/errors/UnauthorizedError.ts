import AppError = require("./AppError.js");
import HttpStatus = require("../../constants/httpStatus.js");
import Messages = require("../../constants/messages.js");

class UnauthorizedError extends AppError {
  constructor(message: string = Messages.UNAUTHORIZED) {
    super(message, HttpStatus.UNAUTHORIZED, true);
  }
}

export = UnauthorizedError;
