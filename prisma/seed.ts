import { prisma } from "./lib";
import { seedBase } from "./seed-base";

async function main() {
  await seedBase();

  console.log("\n--- Executando seed-jogadores ---");
  const { main: seedJogadores } = await import("./seed-jogadores");
  await seedJogadores();

  console.log("\n--- Executando seed-partidas ---");
  const { main: seedPartidas } = await import("./seed-partidas");
  await seedPartidas();

  console.log("\n--- Executando seed-estadios-fotos ---");
  const { main: seedEstadiosFotos } = await import("./seed-estadios-fotos");
  await seedEstadiosFotos();

  console.log("\n--- Executando seed-estadios-conteudo ---");
  const { main: seedEstadiosConteudo } = await import("./seed-estadios-conteudo");
  await seedEstadiosConteudo();

  console.log("\n=== Seed completo! ===");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
