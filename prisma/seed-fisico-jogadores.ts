import { prisma } from "./lib";
import { JOGADORES_POR_SELECAO } from "./dados-jogadores";
import { FISICOS_POR_SELECAO } from "./dados-fisicos-jogadores";

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

export async function main() {
  console.log("=== Seed de Dados Físicos dos Jogadores ===");

  const todasSelecoes = await prisma.selecao.findMany({
    orderBy: { id: "asc" },
    include: { jogadores: true },
  });

  let atualizados = 0;
  let comDadosReais = 0;

  for (const selecao of todasSelecoes) {
    const fisicos = FISICOS_POR_SELECAO[selecao.nome] ?? [];
    const jogadoresInput = JOGADORES_POR_SELECAO[selecao.nome] ?? [];

    for (const jogador of selecao.jogadores) {
      const fisico = fisicos.find((f) => f.nome === jogador.nome);

      if (fisico) {
        await prisma.jogador.update({
          where: { id: jogador.id },
          data: {
            altura: fisico.altura,
            peso: fisico.peso,
            dataNascimento: new Date(fisico.dataNascimento),
          },
        });
        comDadosReais++;
      } else {
        const _input = jogadoresInput.find((j) => j.nome === jogador.nome);
        const altura = gerarAltura(jogador.posicao);
        const peso = gerarPeso(jogador.posicao, altura);
        await prisma.jogador.update({
          where: { id: jogador.id },
          data: {
            altura,
            peso,
            dataNascimento: gerarDataNascimento(),
          },
        });
      }
      atualizados++;
    }
  }

  console.log(`\nSeed de dados físicos concluído!`);
  console.log(`  Total de jogadores atualizados: ${atualizados}`);
  console.log(`  Com dados reais: ${comDadosReais}`);
  console.log(`  Com dados gerados: ${atualizados - comDadosReais}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
