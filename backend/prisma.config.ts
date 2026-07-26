import "dotenv/config";
import prismaConfig = require("prisma/config");

const datasource: { url?: string } = {};
if (process.env["DATABASE_URL"]) {
  datasource.url = process.env["DATABASE_URL"];
}

export = prismaConfig.defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource,
});
