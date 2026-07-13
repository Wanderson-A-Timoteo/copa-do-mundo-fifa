import { prisma } from "./lib";
import { seedBase } from "./seed-base";

async function main() {
  await seedBase();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
