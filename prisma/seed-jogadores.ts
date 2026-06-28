import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { JOGADORES_POR_SELECAO } from "./dados-jogadores";

const url = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString: url });
const prisma = new PrismaClient({ adapter });

const RENOMEAR_SELECOES: Record<string, string> = {
  "República da Coreia": "Coreia do Sul",
  Tchéquia: "República Tcheca",
  EUA: "Estados Unidos",
  Curaçau: "Curaçao",
  "RI do Irã": "Irã",
};

async function main() {
  console.log("=== Seed de Jogadores ===");

  // 1. Renomear seleções (se ainda estiverem com nomes antigos)
  for (const [nomeAntigo, nomeNovo] of Object.entries(RENOMEAR_SELECOES)) {
    const selecao = await prisma.selecao.findFirst({ where: { nome: nomeAntigo } });
    if (selecao) {
      const slug = nomeNovo
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      await prisma.selecao.update({
        where: { id: selecao.id },
        data: { nome: nomeNovo, slug },
      });
      console.log(`  Renomeado: "${nomeAntigo}" -> "${nomeNovo}"`);
    } else {
      const jaExiste = await prisma.selecao.findFirst({ where: { nome: nomeNovo } });
      if (jaExiste) {
        console.log(`  "${nomeNovo}" já existe, pulando renomeio.`);
      } else {
        console.log(`  "${nomeAntigo}" não encontrado no banco.`);
      }
    }
  }

  // 2. Deletar figurinhas e jogadores existentes
  const todasSelecoes = await prisma.selecao.findMany({ orderBy: { id: "asc" } });
  const nomesParaSeed = Object.keys(JOGADORES_POR_SELECAO);

  for (const selecao of todasSelecoes) {
    const nomeCorrigido = RENOMEAR_SELECOES[selecao.nome] ?? selecao.nome;
    if (nomesParaSeed.includes(nomeCorrigido)) {
      const qtdFig = await prisma.figurinha.count({ where: { selecaoId: selecao.id } });
      const qtdJog = await prisma.jogador.count({ where: { selecaoId: selecao.id } });
      if (qtdFig > 0 || qtdJog > 0) {
        console.log(`  ${nomeCorrigido}: deletando ${qtdFig} figurinhas e ${qtdJog} jogadores...`);
        const idsFig = (await prisma.figurinha.findMany({ where: { selecaoId: selecao.id }, select: { id: true } })).map(f => f.id);
        if (idsFig.length > 0) {
          await prisma.albumFigurinha.deleteMany({ where: { figurinhaId: { in: idsFig } } });
          await prisma.troca.deleteMany({ where: { figurinhaOferecidaId: { in: idsFig } } });
          await prisma.troca.deleteMany({ where: { figurinhaDesejadaId: { in: idsFig } } });
        }
        await prisma.figurinha.deleteMany({ where: { selecaoId: selecao.id } });
        await prisma.jogador.deleteMany({ where: { selecaoId: selecao.id } });
      }
    }
  }

  // 3. Inserir jogadores e figurinhas em lote
  let totalJogadores = 0;
  let totalFigurinhas = 0;
  let numFigurinha = (await prisma.figurinha.findFirst({ orderBy: { numero: "desc" } }))?.numero ?? 0;
  numFigurinha++;

  for (const selecao of todasSelecoes) {
    const nomeCorrigido = RENOMEAR_SELECOES[selecao.nome] ?? selecao.nome;
    const jogadores = JOGADORES_POR_SELECAO[nomeCorrigido];
    if (!jogadores) {
      console.log(`  Aviso: Nenhum jogador encontrado para "${nomeCorrigido}"`);
      continue;
    }

    const jogadoresData = jogadores.map((j) => ({
      selecaoId: selecao.id,
      nome: j.nome,
      posicao: j.posicao,
      numeroCamisa: Math.floor(Math.random() * 30) + 1,
    }));

    const criados = await prisma.jogador.createManyAndReturn({ data: jogadoresData });

    const figurinhasData = criados.map((jogador, i) => ({
      numero: numFigurinha++,
      selecaoId: selecao.id,
      jogadorId: jogador.id,
      tipo: "jogador",
      raridade: Math.random() < 0.1 ? "rara" : "comum",
    }));

    await prisma.figurinha.createMany({ data: figurinhasData });

    totalJogadores += criados.length;
    totalFigurinhas += figurinhasData.length;
  }

  console.log(`\nSeed concluído!`);
  console.log(`  Jogadores inseridos: ${totalJogadores}`);
  console.log(`  Figurinhas criadas: ${totalFigurinhas}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
