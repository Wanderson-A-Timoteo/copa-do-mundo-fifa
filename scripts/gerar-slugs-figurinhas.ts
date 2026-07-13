import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const url = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString: url });
const prisma = new PrismaClient({ adapter });

function slugify(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  const figurinhas = await prisma.figurinha.findMany({
    include: { jogador: true, selecao: true },
    orderBy: { id: "asc" },
  });

  console.log(`Total de figurinhas: ${figurinhas.length}`);

  const slugsUsados = new Set<string>();
  const slugMap: { id: number; slug: string }[] = [];

  for (const fig of figurinhas) {
    const nome = fig.jogador?.nome || fig.selecao.nome;
    let slug = slugify(nome);

    let tentativa = slug;
    let contador = 1;
    while (slugsUsados.has(tentativa)) {
      contador++;
      tentativa = `${slug}-${contador}`;
    }

    slugsUsados.add(tentativa);
    slugMap.push({ id: fig.id, slug: tentativa });
  }

  // Bulk update via raw SQL
  const cases = slugMap.map(({ id, slug }) => `WHEN ${id} THEN '${slug}'`).join("\n");
  await prisma.$executeRawUnsafe(`
    UPDATE figurinhas SET slug = CASE id
      ${cases}
    END
    WHERE id IN (${slugMap.map(({ id }) => id).join(",")})
  `);

  console.log(`${slugMap.length} slugs gerados com sucesso.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
