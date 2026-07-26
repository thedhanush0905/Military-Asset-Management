import dotenv = require("dotenv");
dotenv.config();

import pg = require("pg");
import prismaAdapterPg = require("@prisma/adapter-pg");
import bcrypt = require("bcrypt");
import prismaClientModule = require("../generated/prisma/index.js");

const pool = new pg.Pool({
  connectionString: process.env["DATABASE_URL"],
});
const adapter = new prismaAdapterPg.PrismaPg(pool);
const prisma = new prismaClientModule.PrismaClient({ adapter });

async function main() {
  const adminEmail = process.env["ADMIN_EMAIL"] || "admin@military.gov";
  const adminPassword = process.env["ADMIN_PASSWORD"] || "Admin@123456";
  const adminName = process.env["ADMIN_NAME"] || "System Admin";

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log(`Admin user with email ${adminEmail} already exists. Skipping seed.`);
    return;
  }

  const envRounds = process.env["BCRYPT_SALT_ROUNDS"];
  const saltRounds = envRounds ? parseInt(envRounds, 10) : 12;
  const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

  const adminUser = await prisma.user.create({
    data: {
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  console.log(`Admin user seeded successfully with ID: ${adminUser.id}`);
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
