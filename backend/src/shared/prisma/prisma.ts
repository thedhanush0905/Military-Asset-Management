import env = require("../../config/env.js");
import pg = require("pg");
import prismaAdapterPg = require("@prisma/adapter-pg");
import prismaClientModule = require("../../../generated/prisma/index.js");

const globalForPrisma = globalThis as unknown as {
  prisma: prismaClientModule.PrismaClient | undefined;
};

let prisma: prismaClientModule.PrismaClient;

if (globalForPrisma.prisma) {
  prisma = globalForPrisma.prisma;
} else {
  const pool = new pg.Pool({
    connectionString: env.DATABASE_URL,
  });
  const adapter = new prismaAdapterPg.PrismaPg(pool);
  prisma = new prismaClientModule.PrismaClient({ adapter });

  if (process.env["NODE_ENV"] !== "production") {
    globalForPrisma.prisma = prisma;
  }
}

export = prisma;
