import prismaClientModule = require("../../../generated/prisma/index.js");

const globalForPrisma = globalThis as unknown as {
  prisma: prismaClientModule.PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new prismaClientModule.PrismaClient();

if (process.env["NODE_ENV"] !== "production") {
  globalForPrisma.prisma = prisma;
}

export = prisma;
