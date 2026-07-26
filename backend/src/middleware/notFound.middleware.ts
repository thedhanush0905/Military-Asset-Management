import express = require("express");
import NotFoundError = require("../shared/errors/NotFoundError.js");
import Messages = require("../constants/messages.js");

const notFoundHandler = (
  _req: express.Request,
  _res: express.Response,
  next: express.NextFunction
): void => {
  next(new NotFoundError(Messages.ROUTE_NOT_FOUND));
};

export = notFoundHandler;
