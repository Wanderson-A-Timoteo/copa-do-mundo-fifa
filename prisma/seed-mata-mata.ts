import { prisma } from "./lib";

export async function main() {
  const existentes = await prisma.partida.count({ where: { fase: { not: "GRUPOS" } } });
  if (existentes > 0) {
    console.log("Mata mata já foi semeado.");
    return;
  }

  const fases = [
    { numFrom: 73, numTo: 88, fase: "SEGUNDAS" },
    { numFrom: 89, numTo: 96, fase: "OITAVAS" },
    { numFrom: 97, numTo: 100, fase: "QUARTAS" },
    { numFrom: 101, numTo: 102, fase: "SEMI" },
    { numFrom: 103, numTo: 103, fase: "TERCEIRO" },
    { numFrom: 104, numTo: 104, fase: "FINAL" },
  ];

  const partidas = [];

  const estadio = await prisma.estadio.findFirst();

  for (const f of fases) {
    for (let i = f.numFrom; i <= f.numTo; i++) {
      partidas.push({
        id: i, // Force ID 73 to 104
        fase: f.fase as "SEGUNDAS" | "OITAVAS" | "QUARTAS" | "SEMI" | "TERCEIRO" | "FINAL",
        dataHora: new Date(),
        estadioId: estadio?.id ?? 1,
        encerrada: false,
      });
    }
  }

  await prisma.partida.createMany({
    data: partidas,
  });

  console.log("Partidas de mata-mata criadas com sucesso (IDs 73 a 104).");
}

// executed from seed.ts
