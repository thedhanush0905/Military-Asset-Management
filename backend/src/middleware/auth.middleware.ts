import express = require("express");
import jwt = require("jsonwebtoken");
import env = require("../config/env.js");
import AuthRepository = require("../modules/auth/auth.repository.js");
import UnauthorizedError = require("../shared/errors/UnauthorizedError.js");

const authRepository = new AuthRepository();

const authenticate = async (
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader || typeof authHeader !== "string") {
      throw new UnauthorizedError("Authentication token is missing");
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      throw new UnauthorizedError("Authentication token format is invalid");
    }

    const token = parts[1];
    if (!token) {
      throw new UnauthorizedError("Authentication token is empty");
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (err) {
      throw new UnauthorizedError("Session expired or invalid");
    }

    if (!decoded || !decoded.sub) {
      throw new UnauthorizedError("Session payload is invalid");
    }

    const user = await authRepository.findUserById(decoded.sub);
    if (!user) {
      throw new UnauthorizedError("User account not found");
    }

    if (user.status !== "ACTIVE") {
      throw new UnauthorizedError("User account is deactivated");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export = authenticate;
