import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";

/**
 * One client for the process.
 *
 * Three things worth knowing about this file.
 *
 * The client is imported from `generated/prisma` rather than `@prisma/client`.
 * Prisma 7 emits real TypeScript into the repo instead of rewriting a package
 * inside `node_modules` at generate time, which is what makes the output survive
 * a clean install and a bundler that reasonably assumes packages hold still.
 *
 * The connection goes through a driver adapter — `PrismaPg`, which is node-postgres
 * underneath. Prisma 7 requires one, and the practical consequence is that the
 * connection string is now read here rather than by a query engine reading the
 * schema, so `schema.prisma` holds no credential at all.
 *
 * And it is cached on `globalThis` outside production, because every hot reload in
 * development would otherwise construct another client, each with its own pool.
 * Postgres runs out of connections long before anybody works out why.
 */
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function build(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    /* Said plainly and early. Without this the first query fails somewhere deep
       inside the adapter with a message about an undefined host. */
    throw new Error("DATABASE_URL is not set — Prisma has nothing to connect to.");
  }
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? build();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
