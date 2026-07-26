import express = require("express");
import ForbiddenError = require("../shared/errors/ForbiddenError.js");
import prismaClientModule = require("../../generated/prisma/index.js");

const authorize = (...allowedRoles: prismaClientModule.Role[]) => {
  return (
    req: express.Request,
    _res: express.Response,
    next: express.NextFunction
  ): void => {
    try {
      const user = req.user;
      if (!user) {
        throw new ForbiddenError("Access Denied: Unauthenticated");
      }

      if (!allowedRoles.includes(user.role)) {
        throw new ForbiddenError("Access Denied: Insufficient privileges");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export = authorize;
