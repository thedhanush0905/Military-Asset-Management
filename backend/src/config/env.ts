import dotenv = require("dotenv");
dotenv.config();

import zod = require("zod");

const envSchema = zod.object({
  JWT_SECRET: zod.string().min(1, "JWT_SECRET is required"),
  DATABASE_URL: zod.string().min(1, "DATABASE_URL is required"),
  PORT: zod.string().optional().default("5000"),
  NODE_ENV: zod.enum(["development", "production", "test"]).optional().default("development"),
  BCRYPT_SALT_ROUNDS: zod.string().optional().default("12"),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  const missingVars = result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("\n");
  console.error("FATAL: Environment validation failed:\n" + missingVars);
  process.exit(1);
}

const env = result.data;

export = env;
