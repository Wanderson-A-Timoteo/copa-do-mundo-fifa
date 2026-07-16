import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const j = await prisma.jogador.findFirst({ where: { nome: { contains: "Hanley" } } })
  console.log(j)
}
main()
