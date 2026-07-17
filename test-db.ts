import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const p = await prisma.partida.findMany({ where: { fase: { not: "GRUPOS" } }});
  console.log("Mata Mata matches count:", p.length);
}
main().finally(() => prisma.$disconnect());
