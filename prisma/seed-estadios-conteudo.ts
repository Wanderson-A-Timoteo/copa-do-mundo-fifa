import { prisma } from "./lib";

export async function main() {
  console.log("Inserindo conteúdos editoriais para os Estádios...");

  await prisma.estadio.update({
    where: { slug: "levis-stadium" },
    data: {
      descricao:
        "Inaugurado em 2014, o Levi's Stadium não é apenas a casa do San Francisco 49ers, mas um dos maiores ícones da tecnologia sustentável aplicados ao esporte mundial. Localizado em Santa Clara, o coração do Vale do Silício, o estádio redefine a experiência do torcedor ao integrar inovação extrema e design ecológico. Para a Copa do Mundo de 2026, ele será o epicentro tecnológico do torneio na Costa Oeste dos Estados Unidos.",
      historia:
        "O projeto do Levi's Stadium surgiu com a missão de substituir o antigo Candlestick Park. Desde a sua concepção, o objetivo foi criar um estádio inteligente que oferecesse conectividade sem precedentes — com banda larga e rede Wi-Fi que suportam os 68.000 torcedores simultaneamente. O estádio já foi palco do Super Bowl 50 e de centenas de mega-eventos internacionais, consolidando-se como um dos principais complexos multiúso do planeta.",
      curiosidades: [
        "Tem um teto verde de 2.500 m² coberto de painéis solares e vegetação nativa.",
        "Foi o primeiro estádio profissional da NFL a receber a cobiçada certificação LEED Ouro por sustentabilidade ecológica.",
        "Possui uma rede de Wi-Fi tão potente que poderia fornecer banda larga de ultra-velocidade para uma pequena cidade inteira.",
        "Localizado literalmente no Vale do Silício, a arena costuma usar um aplicativo próprio que até entrega comida no assento do torcedor.",
      ],
    },
  });

  await prisma.estadio.update({
    where: { slug: "estadio-azteca" },
    data: {
      descricao:
        "O Estádio Azteca não é apenas um campo, é o maior templo do futebol mundial. Localizado na Cidade do México, ele respira história e mística. Sendo o único estádio do mundo a sediar três edições da Copa do Mundo (1970, 1986 e agora 2026), o 'Colosso de Santa Úrsula' é temido e reverenciado por sua altitude, acústica ensurdecedora e atmosfera monumental.",
      historia:
        "Inaugurado em 1966, o Azteca foi palco de alguns dos momentos mais inesquecíveis da história do esporte. Foi no seu gramado sagrado que Pelé e a mítica Seleção Brasileira de 1970 conquistaram o tri, e foi ali também que Diego Maradona marcou os lendários 'Gol do Século' e a 'Mão de Deus' em 1986 contra a Inglaterra.",
      curiosidades: [
        "Único estádio da Terra a sediar TRÊS Copas do Mundo.",
        "Tem capacidade atual para mais de 83.000 pessoas, mas seu recorde de público foi impressionantes 119.853 torcedores em 1968.",
        "A altitude da Cidade do México (2.240 metros acima do nível do mar) torna os jogos no Azteca fisicamente exaustivos para times visitantes.",
        "O gramado foi palco das duas atuações individuais mais célebres das Copas: Pelé (1970) e Maradona (1986).",
      ],
    },
  });

  console.log("Conteúdo de estádios atualizado com sucesso!");
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
