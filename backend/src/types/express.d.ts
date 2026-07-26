import prisma = require("../../generated/prisma/index.js");

declare global {
  namespace Express {
    interface Request {
      user?: prisma.User;
    }
  }
}
