import { prisma } from "./lib";
import { JOGADORES_POR_SELECAO, TECNICOS_POR_SELECAO } from "./data/dados-jogadores";
import { FISICOS_POR_SELECAO } from "./data/dados-fisicos-jogadores";

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function gerarAltura(posicao: string): number {
  switch (posicao) {
    case "Goleiro":
      return randomInt(185, 200);
    case "Defensor":
      return randomInt(175, 195);
    case "Meia":
      return randomInt(165, 185);
    case "Atacante":
      return randomInt(168, 192);
    default:
      return randomInt(170, 190);
  }
}

function gerarPeso(_posicao: string, _altura: number): number {
  return randomInt(65, 85);
}

function gerarDataNascimento(): Date {
  const hoje = new Date();
  const ano = hoje.getFullYear() - randomInt(18, 38);
  const mes = randomInt(0, 11);
  const dia = randomInt(1, 28);
  return new Date(ano, mes, dia);
}

const RENOMEAR_SELECOES: Record<string, string> = {
  "República da Coreia": "Coreia do Sul",
  Tchéquia: "República Tcheca",
  EUA: "Estados Unidos",
  Curaçau: "Curaçao",
  "RI do Irã": "Irã",
};

export async function main() {
  console.log("=== Seed de Jogadores ===");

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

  const todasSelecoes = await prisma.selecao.findMany({ orderBy: { id: "asc" } });
  const nomesParaSeed = Object.keys(JOGADORES_POR_SELECAO);

  for (const selecao of todasSelecoes) {
    const nomeCorrigido = RENOMEAR_SELECOES[selecao.nome] ?? selecao.nome;
    if (nomesParaSeed.includes(nomeCorrigido)) {
      const qtdFig = await prisma.figurinha.count({ where: { selecaoId: selecao.id } });
      const qtdJog = await prisma.jogador.count({ where: { selecaoId: selecao.id } });
      if (qtdFig > 0 || qtdJog > 0) {
        console.log(`  ${nomeCorrigido}: deletando ${qtdFig} figurinhas e ${qtdJog} jogadores...`);
        const idsFig = (
          await prisma.figurinha.findMany({
            where: { selecaoId: selecao.id },
            select: { id: true },
          })
        ).map((f) => f.id);
        if (idsFig.length > 0) {
          await prisma.albumFigurinha.deleteMany({ where: { figurinhaId: { in: idsFig } } });
          await prisma.trocaFigurinhaOferecida.deleteMany({ where: { figurinhaId: { in: idsFig } } });
          await prisma.troca.deleteMany({ where: { figurinhaDesejadaId: { in: idsFig } } });
        }
        await prisma.figurinha.deleteMany({ where: { selecaoId: selecao.id } });
        await prisma.jogador.deleteMany({ where: { selecaoId: selecao.id } });
      }
    }
  }

  let totalJogadores = 0;
  let totalFigurinhas = 0;
  let numFigurinha =
    (await prisma.figurinha.findFirst({ orderBy: { numero: "desc" } }))?.numero ?? 0;
  numFigurinha++;

  for (const selecao of todasSelecoes) {
    const nomeCorrigido = RENOMEAR_SELECOES[selecao.nome] ?? selecao.nome;
    const jogadores = JOGADORES_POR_SELECAO[nomeCorrigido];
    if (!jogadores) {
      console.log(`  Aviso: Nenhum jogador encontrado para "${nomeCorrigido}"`);
      continue;
    }

    const fisicos = FISICOS_POR_SELECAO[nomeCorrigido] ?? [];

    const jogadoresData = jogadores.map((j) => {
      const fisico = fisicos.find((f) => f.nome === j.nome);
      let altura = fisico?.altura;
      let peso = fisico?.peso;
      let dataNascimento = fisico ? new Date(fisico.dataNascimento) : undefined;

      if (!altura || !peso || !dataNascimento) {
        altura = gerarAltura(j.posicao);
        peso = gerarPeso(j.posicao, altura);
        dataNascimento = gerarDataNascimento();
      }

      return {
        selecaoId: selecao.id,
        nome: j.nome,
        posicao: j.posicao as any,
        numeroCamisa: Math.floor(Math.random() * 30) + 1,
        altura,
        peso,
        dataNascimento,
      };
    });

    const criados = await prisma.jogador.createManyAndReturn({ data: jogadoresData });

    const figurinhasData = criados.map((jogador, index) => {
      const num = numFigurinha++;
      return {
        numero: num,
        selecaoId: selecao.id,
        jogadorId: jogador.id,
        tipo: "jogador" as const,
        raridade: (Math.random() < 0.1 ? "rara" : "comum") as any,
        slug: `fig-${num}-${jogador.nome.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
      };
    });

    await prisma.figurinha.createMany({ data: figurinhasData });

    totalJogadores += criados.length;
    totalFigurinhas += figurinhasData.length;
  }

  for (const selecao of todasSelecoes) {
    const nomeCorrigido = RENOMEAR_SELECOES[selecao.nome] ?? selecao.nome;
    const tecnico = TECNICOS_POR_SELECAO[nomeCorrigido];
    if (tecnico) {
      await prisma.selecao.update({
        where: { id: selecao.id },
        data: { tecnico },
      });
      console.log(`  ${nomeCorrigido}: técnico "${tecnico}"`);
    } else {
      console.log(`  Aviso: Nenhum técnico encontrado para "${nomeCorrigido}"`);
    }
  }

  console.log(`\nSeed de jogadores concluído!`);
  console.log(`  Jogadores inseridos: ${totalJogadores}`);
  console.log(`  Figurinhas criadas: ${totalFigurinhas}`);
}

// executed from seed.ts
