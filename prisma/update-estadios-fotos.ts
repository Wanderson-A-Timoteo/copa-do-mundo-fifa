import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const url = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString: url });
const prisma = new PrismaClient({ adapter });

const updates: Record<string, string> = {
  "Estádio de Nova York/Nova Jersey":
    "https://upload.wikimedia.org/wikipedia/commons/f/fb/Metlife_stadium_(Aerial_view).jpg",
  "Estádio de Los Angeles":
    "https://upload.wikimedia.org/wikipedia/commons/5/5e/Aerial_view_of_SoFi_Stadium_(July_2022).jpg",
  "Estádio de Houston":
    "https://cdn.loc.gov/service/pnp/highsm/27900/27977r.jpg",
  "Estádio de Atlanta":
    "https://cdn.loc.gov/service/pnp/highsm/46700/46731r.jpg",
  "Estádio de Boston":
    "https://upload.wikimedia.org/wikipedia/commons/7/79/Gillette_Stadium_(Top_View).jpg",
  "BC Place de Vancouver":
    "https://images.pexels.com/photos/32864204/pexels-photo-32864204.jpeg",
  "Estádio de Toronto":
    "https://upload.wikimedia.org/wikipedia/commons/9/93/BMO_Field%2C_Toronto%2C_Ontario_(29969149766).jpg",
};

async function main() {
  for (const [nome, fotoUrl] of Object.entries(updates)) {
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
