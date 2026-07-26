"use strict";
require("dotenv/config");
const prismaConfig = require("prisma/config");
const datasource = {};
if (process.env["DATABASE_URL"]) {
    datasource.url = process.env["DATABASE_URL"];
}
module.exports = prismaConfig.defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
        seed: "npx tsx prisma/seed.ts",
    },
    datasource,
});
