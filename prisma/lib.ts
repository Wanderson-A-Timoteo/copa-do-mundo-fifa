import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const url = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString: url });
export const prisma = new PrismaClient({ adapter });
