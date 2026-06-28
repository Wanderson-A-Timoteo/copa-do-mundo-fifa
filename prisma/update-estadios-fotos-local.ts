import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const url = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString: url });
const prisma = new PrismaClient({ adapter });

const updates: [string, string][] = [
  ["Estádio de Nova York/Nova Jersey", "/images/estadios/metlife.jpg"],
  ["Estádio de Los Angeles", "/images/estadios/sofi.jpg"],
  ["Estádio de Dallas", "/images/estadios/att-stadium.jpeg"],
  ["Estádio de Houston", "/images/estadios/nrg-stadium.jpg"],
  ["Estádio de Atlanta", "/images/estadios/mercedes-benz.jpg"],
  ["Estádio da Baía de São Francisco", "/images/estadios/levis-stadium.jpg"],
  ["Estádio de Filadélfia", "/images/estadios/lincoln-financial.jpg"],
  ["Estádio de Seattle", "/images/estadios/lumen-field.jpg"],
  ["Estádio de Boston", "/images/estadios/gillette-stadium.jpg"],
  ["Estádio de Kansas City", "/images/estadios/arrowhead.jpg"],
  ["Estádio de Miami", "/images/estadios/hard-rock.jpg"],
  ["Estádio da Cidade do México", "/images/estadios/estadio-azteca.jpg"],
  ["Estádio de Monterrey", "/images/estadios/estadio-bbva.jpg"],
  ["Estádio de Guadalajara", "/images/estadios/estadio-omnilife.jpg"],
  ["BC Place de Vancouver", "/images/estadios/bc-place.jpeg"],
  ["Estádio de Toronto", "/images/estadios/bmo-field.jpg"],
];

async function main() {
  for (const [nome, fotoUrl] of updates) {
    const estadio = await prisma.estadio.findFirst({ where: { nome } });
    if (!estadio) {
      console.log(`Não encontrado: ${nome}`);
      continue;
    }
    await prisma.estadio.update({
      where: { id: estadio.id },
      data: { fotoUrl },
    });
    console.log(`✔ ${nome}`);
  }
  console.log("Concluído!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
