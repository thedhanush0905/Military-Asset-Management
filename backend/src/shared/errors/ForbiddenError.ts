import AppError = require("./AppError.js");
import HttpStatus = require("../../constants/httpStatus.js");
import Messages = require("../../constants/messages.js");

class ForbiddenError extends AppError {
  constructor(message: string = Messages.FORBIDDEN) {
    super(message, HttpStatus.FORBIDDEN, true);
  }
}

export = ForbiddenError;
