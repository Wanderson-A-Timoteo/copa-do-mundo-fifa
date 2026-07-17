import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma_v2: PrismaClient | undefined;
};

function createClient() {
  const url = process.env.DATABASE_URL;

  if (!url) return {} as unknown as PrismaClient;

  const adapter = new PrismaPg({ connectionString: url });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma_v2 ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma_v2 = prisma;
