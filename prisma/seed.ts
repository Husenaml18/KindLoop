import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { loveLetterDemo } from "../src/lib/templates/love-letter/demo";
import { winYouBackDemo } from "../src/lib/templates/win-you-back/demo";

/**
 * A few rows, so an empty database is not indistinguishable from a broken one.
 *
 * Every write is an `upsert` keyed on something stable, which makes this safe to
 * run twice — and it will be run twice, because seeding is the thing people reach
 * for when they are not sure whether the last command worked.
 *
 * The gift content is the real demo content the walkthroughs use, parsed by the
 * same schemas the app parses it with. Inventing plausible-looking JSON here would
 * mean a seed that succeeds while writing rows the application cannot read, which
 * is a worse failure than an empty table because it looks like success.
 *
 * Everything is namespaced under `@seed.kindloop.local`, so it is obvious in the
 * database what is sample data and trivial to delete.
 */
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set.");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  const sam = await prisma.user.upsert({
    where: { email: "sam@seed.kindloop.local" },
    update: {},
    create: { email: "sam@seed.kindloop.local", name: "Sam", bio: "Sample account created by the seed." },
  });

  const ana = await prisma.user.upsert({
    where: { email: "ana@seed.kindloop.local" },
    update: {},
    create: { email: "ana@seed.kindloop.local", name: "Ana" },
  });

  /* One free gift and one paid-but-unlocked, so both states exist to look at. */
  await prisma.gift.upsert({
    where: { slug: "seed-love-letter" },
    update: {},
    create: {
      slug: "seed-love-letter",
      template: "love-letter",
      content: JSON.stringify(loveLetterDemo),
      ownerId: sam.id,
    },
  });

  await prisma.gift.upsert({
    where: { slug: "seed-win-you-back" },
    update: {},
    create: {
      slug: "seed-win-you-back",
      template: "win-you-back",
      content: JSON.stringify(winYouBackDemo),
      ownerId: ana.id,
    },
  });

  await prisma.waitlistEntry.upsert({
    where: { email: "curious@seed.kindloop.local" },
    update: {},
    create: { email: "curious@seed.kindloop.local", source: "seed" },
  });

  const [users, gifts, waitlist] = await Promise.all([
    prisma.user.count(),
    prisma.gift.count(),
    prisma.waitlistEntry.count(),
  ]);
  console.log(`Seeded. ${users} users, ${gifts} gifts, ${waitlist} waitlist entries.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
