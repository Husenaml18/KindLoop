import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

/**
 * Does the database actually answer?
 *
 * A read rather than a `$connect()`, because connecting proves the network and the
 * credentials and nothing else — a schema that was never migrated connects
 * perfectly happily and then fails on the first query. This runs a real query
 * against a real table, which is the thing the application will do.
 *
 * On failure it prints the error as thrown. Wrapping it in something friendlier
 * would hide the one piece of information worth having.
 */
const connectionString = process.env.DATABASE_URL?.replace(
  /([?&]sslmode=)(require|prefer|verify-ca)\b/,
  "$1verify-full"
);
if (!connectionString) {
  console.error("❌ DATABASE_URL is not set. Nothing to connect to.");
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  const users = await prisma.user.count();
  const gifts = await prisma.gift.count();
  const [{ version }] = await prisma.$queryRaw<{ version: string }[]>`SELECT version()`;

  console.log("✅ Connected");
  console.log(`   ${version.split(",")[0]}`);
  console.log(`   ${users} users, ${gifts} gifts`);
}

main()
  .catch((e) => {
    console.error("❌ Could not reach the database.\n");
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
