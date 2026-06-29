import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const url = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString: url });
const prisma = new PrismaClient({ adapter });

type PartidaDef = {
  mand: number; vis: number; mes: number; dia: number; hora: number; min: number; est: number;
};

const jogos: PartidaDef[] = [
  { mand: 0, vis: 1, mes: 6, dia: 11, hora: 16, min: 0, est: 11 },
  { mand: 2, vis: 3, mes: 6, dia: 11, hora: 19, min: 0, est: 13 },
  { mand: 3, vis: 1, mes: 6, dia: 18, hora: 13, min: 0, est: 4 },
  { mand: 0, vis: 2, mes: 6, dia: 18, hora: 16, min: 0, est: 13 },
  { mand: 3, vis: 0, mes: 6, dia: 24, hora: 19, min: 0, est: 11 },
  { mand: 1, vis: 2, mes: 6, dia: 24, hora: 21, min: 0, est: 12 },
  { mand: 5, vis: 6, mes: 6, dia: 12, hora: 13, min: 0, est: 15 },
  { mand: 7, vis: 4, mes: 6, dia: 13, hora: 16, min: 0, est: 5 },
  { mand: 4, vis: 6, mes: 6, dia: 18, hora: 19, min: 0, est: 1 },
  { mand: 5, vis: 7, mes: 6, dia: 18, hora: 21, min: 0, est: 14 },
  { mand: 4, vis: 5, mes: 6, dia: 24, hora: 13, min: 0, est: 14 },
  { mand: 6, vis: 7, mes: 6, dia: 24, hora: 16, min: 0, est: 7 },
  { mand: 8, vis: 9, mes: 6, dia: 13, hora: 13, min: 0, est: 0 },
  { mand: 11, vis: 10, mes: 6, dia: 13, hora: 19, min: 0, est: 8 },
  { mand: 10, vis: 9, mes: 6, dia: 19, hora: 13, min: 0, est: 8 },
  { mand: 8, vis: 11, mes: 6, dia: 19, hora: 16, min: 0, est: 6 },
  { mand: 10, vis: 8, mes: 6, dia: 24, hora: 19, min: 0, est: 10 },
  { mand: 9, vis: 11, mes: 6, dia: 24, hora: 21, min: 0, est: 4 },
  { mand: 12, vis: 14, mes: 6, dia: 12, hora: 19, min: 0, est: 1 },
  { mand: 13, vis: 15, mes: 6, dia: 14, hora: 13, min: 0, est: 14 },
  { mand: 12, vis: 13, mes: 6, dia: 19, hora: 19, min: 0, est: 7 },
  { mand: 15, vis: 14, mes: 6, dia: 19, hora: 21, min: 0, est: 5 },
  { mand: 15, vis: 12, mes: 6, dia: 25, hora: 13, min: 0, est: 1 },
  { mand: 14, vis: 13, mes: 6, dia: 25, hora: 16, min: 0, est: 5 },
  { mand: 16, vis: 19, mes: 6, dia: 14, hora: 16, min: 0, est: 3 },
  { mand: 17, vis: 18, mes: 6, dia: 14, hora: 19, min: 0, est: 6 },
  { mand: 16, vis: 17, mes: 6, dia: 20, hora: 13, min: 0, est: 15 },
  { mand: 18, vis: 19, mes: 6, dia: 20, hora: 16, min: 0, est: 9 },
  { mand: 19, vis: 17, mes: 6, dia: 25, hora: 19, min: 0, est: 6 },
  { mand: 18, vis: 16, mes: 6, dia: 25, hora: 21, min: 0, est: 0 },
  { mand: 20, vis: 21, mes: 6, dia: 14, hora: 13, min: 0, est: 2 },
  { mand: 22, vis: 23, mes: 6, dia: 14, hora: 21, min: 0, est: 12 },
  { mand: 20, vis: 22, mes: 6, dia: 20, hora: 19, min: 0, est: 3 },
  { mand: 23, vis: 21, mes: 6, dia: 21, hora: 13, min: 0, est: 12 },
  { mand: 21, vis: 22, mes: 6, dia: 25, hora: 13, min: 0, est: 2 },
  { mand: 23, vis: 20, mes: 6, dia: 25, hora: 16, min: 0, est: 9 },
  { mand: 26, vis: 24, mes: 6, dia: 15, hora: 13, min: 0, est: 7 },
  { mand: 25, vis: 27, mes: 6, dia: 15, hora: 16, min: 0, est: 1 },
  { mand: 26, vis: 25, mes: 6, dia: 21, hora: 16, min: 0, est: 1 },
  { mand: 27, vis: 24, mes: 6, dia: 21, hora: 19, min: 0, est: 14 },
  { mand: 24, vis: 25, mes: 6, dia: 26, hora: 23, min: 0, est: 7 },
  { mand: 27, vis: 26, mes: 6, dia: 26, hora: 23, min: 0, est: 14 },
  { mand: 28, vis: 30, mes: 6, dia: 15, hora: 19, min: 0, est: 4 },
  { mand: 31, vis: 29, mes: 6, dia: 15, hora: 21, min: 0, est: 10 },
  { mand: 28, vis: 31, mes: 6, dia: 21, hora: 13, min: 0, est: 4 },
  { mand: 29, vis: 30, mes: 6, dia: 21, hora: 21, min: 0, est: 10 },
  { mand: 30, vis: 31, mes: 6, dia: 26, hora: 20, min: 0, est: 3 },
  { mand: 29, vis: 28, mes: 6, dia: 26, hora: 20, min: 0, est: 13 },
  { mand: 32, vis: 34, mes: 6, dia: 16, hora: 13, min: 0, est: 0 },
  { mand: 35, vis: 33, mes: 6, dia: 16, hora: 16, min: 0, est: 8 },
  { mand: 32, vis: 35, mes: 6, dia: 22, hora: 13, min: 0, est: 6 },
  { mand: 33, vis: 34, mes: 6, dia: 22, hora: 16, min: 0, est: 0 },
  { mand: 33, vis: 32, mes: 6, dia: 26, hora: 15, min: 0, est: 8 },
  { mand: 34, vis: 35, mes: 6, dia: 26, hora: 15, min: 0, est: 15 },
  { mand: 36, vis: 38, mes: 6, dia: 16, hora: 19, min: 0, est: 9 },
  { mand: 37, vis: 39, mes: 6, dia: 17, hora: 13, min: 0, est: 5 },
  { mand: 36, vis: 37, mes: 6, dia: 22, hora: 19, min: 0, est: 2 },
  { mand: 39, vis: 38, mes: 6, dia: 22, hora: 21, min: 0, est: 5 },
  { mand: 38, vis: 37, mes: 6, dia: 27, hora: 22, min: 0, est: 9 },
  { mand: 39, vis: 36, mes: 6, dia: 27, hora: 22, min: 0, est: 2 },
  { mand: 41, vis: 42, mes: 6, dia: 17, hora: 16, min: 0, est: 3 },
  { mand: 43, vis: 40, mes: 6, dia: 17, hora: 19, min: 0, est: 11 },
  { mand: 41, vis: 43, mes: 6, dia: 23, hora: 13, min: 0, est: 3 },
  { mand: 40, vis: 42, mes: 6, dia: 23, hora: 16, min: 0, est: 13 },
  { mand: 40, vis: 41, mes: 6, dia: 27, hora: 19, min: 30, est: 10 },
  { mand: 42, vis: 43, mes: 6, dia: 27, hora: 19, min: 30, est: 4 },
  { mand: 44, vis: 46, mes: 6, dia: 17, hora: 13, min: 0, est: 2 },
  { mand: 45, vis: 47, mes: 6, dia: 17, hora: 21, min: 0, est: 15 },
  { mand: 44, vis: 45, mes: 6, dia: 23, hora: 19, min: 0, est: 8 },
  { mand: 47, vis: 46, mes: 6, dia: 23, hora: 21, min: 0, est: 15 },
  { mand: 47, vis: 44, mes: 6, dia: 27, hora: 17, min: 0, est: 0 },
  { mand: 46, vis: 45, mes: 6, dia: 27, hora: 17, min: 0, est: 6 },
];

async function main() {
  const todasSelecoes = await prisma.selecao.findMany({ orderBy: { id: "asc" } });
  const todosEstadios = await prisma.estadio.findMany({ orderBy: { id: "asc" } });

  if (todasSelecoes.length < 48) {
    console.error(`ERRO: Apenas ${todasSelecoes.length} selecoes encontradas (esperado 48). Execute o seed completo primeiro.`);
    process.exit(1);
  }

  const existentes = await prisma.partida.count();
  if (existentes > 0) {
    console.log(`Ja existem ${existentes} partidas. Nada a fazer.`);
    console.log("Para recriar, execute: npx prisma db seed (recria tudo)");
    return;
  }

  console.log("Criando partidas da fase de grupos...");
  for (const j of jogos) {
    await prisma.partida.create({
      data: {
        fase: "GRUPOS",
        grupoId: todasSelecoes[j.mand].grupoId,
        selecaoMandanteId: todasSelecoes[j.mand].id,
        selecaoVisitanteId: todasSelecoes[j.vis].id,
        dataHora: new Date(2026, j.mes - 1, j.dia, j.hora, j.min),
        estadioId: todosEstadios[j.est].id,
        encerrada: false,
      },
    });
  }

  const total = await prisma.partida.count();
  console.log(`Pronto! ${total} partidas criadas.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
