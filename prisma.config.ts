import "dotenv/config";
import { defineConfig, env } from "prisma/config";

/**
 * Prisma's own configuration, for the CLI.
 *
 * Separate from `schema.prisma` because the two answer different questions: the
 * schema describes the data, this describes how the tooling should behave. Since
 * Prisma 7 the CLI reads its datasource from here rather than from the schema, so
 * `dotenv/config` is imported first — without it `env("DATABASE_URL")` resolves
 * against a process that has never read `.env`, and every command fails claiming
 * the variable is missing.
 *
 * The seed command lives here rather than only in `package.json#prisma.seed`,
 * which Prisma 7 no longer reads.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
