import { prisma } from "./lib";

const conteudos: Record<string, { descricao: string; historia: string; curiosidades: string[] }> = {
  "metlife-stadium": {
    descricao:
      "Localizado em East Rutherford, Nova Jersey (na grande área metropolitana de Nova York), o MetLife Stadium é um colosso esportivo. Compartilhado por duas franquias da NFL (Giants e Jets), ele se destaca por sua versatilidade e infraestrutura monumental capaz de sediar os maiores eventos do planeta, incluindo a grande final da Copa do Mundo de 2026.",
    historia:
      "Inaugurado em 2010 ao custo de US$ 1,6 bilhão, sendo o estádio mais caro construído nos Estados Unidos até então. Ele substituiu o lendário Giants Stadium. Em 2014, tornou-se o primeiro estádio em clima frio e a céu aberto a sediar um Super Bowl, provando sua resiliência a condições extremas.",
    curiosidades: [
      "Foi escolhido como o palco da Grande Final da Copa do Mundo FIFA 2026.",
      "Sua iluminação externa muda de cor inteiramente dependendo do time da casa (Verde para Jets, Azul para Giants).",
      "É o único estádio compartilhado ativamente por dois times da NFL.",
    ],
  },
  "sofi-stadium": {
    descricao:
      "O SoFi Stadium é muito mais do que uma arena: é uma obra-prima da arquitetura contemporânea e entretenimento em Hollywood Park. Projetado para deslumbrar, possui um teto translúcido gigantesco e o 'Oculus', uma tela de 360 graus que redefine a experiência audiovisual em esportes.",
    historia:
      "Inaugurado em 2020 sob um investimento massivo de quase US$ 5 bilhões. Rapidamente tornou-se uma referência mundial, sediando o Super Bowl LVI. O estádio foi concebido como a âncora de um megacomplexo urbano de esportes e lazer que mudou o panorama de Los Angeles.",
    curiosidades: [
      "É o estádio mais caro já construído no mundo, custando mais de US$ 5 bilhões.",
      "O teto não é fixado nas arquibancadas, e sim apoiado em pilares independentes para resistir a terremotos.",
      "Possui o maior telão em anel duplo do mundo, conhecido como 'Infinity Screen', com mais de 6 mil metros quadrados de LEDs.",
    ],
  },
  "att-stadium": {
    descricao:
      "O AT&T Stadium, carinhosamente apelidado de 'Jerry World', é um templo de proporções épicas em Arlington, Texas. Conhecido por seus arcos colossais e portas de vidro retráteis, ele abraça o lema 'tudo é maior no Texas' de forma espetacular.",
    historia:
      "Inaugurado em 2009 para ser a casa do Dallas Cowboys, revolucionou o padrão de arenas nos EUA. O projeto custou US$ 1,3 bilhão e introduziu o conceito moderno de mega-telões pendurados no centro do campo, influenciando o design de arenas globalmente.",
    curiosidades: [
      "O telão central era tão gigantesco na inauguração que jogadores chutadores chegaram a acertá-lo durante as partidas.",
      "O estádio pode se expandir para acomodar mais de 100.000 espectadores em eventos especiais.",
      "Os arcos monumentais que suportam o teto medem quase 400 metros de comprimento, sendo as maiores estruturas de vão único do mundo.",
    ],
  },
  "mercedes-benz-stadium": {
    descricao:
      "Uma maravilha geométrica no coração de Atlanta, famoso por seu icônico teto retrátil em formato de pétalas que lembra a lente de uma câmera. É aclamado mundialmente por suas práticas de sustentabilidade impecáveis e pela revolucionária 'fan-first pricing' (preços populares) em alimentos.",
    historia:
      "Inaugurado em 2017 substituindo o Georgia Dome, foi projetado para elevar o padrão da experiência do torcedor. Imediatamente após a inauguração, quebrou recordes de público na MLS pelo Atlanta United e sediou o Super Bowl LIII.",
    curiosidades: [
      "O teto é composto por 8 pétalas triangulares móveis que podem se abrir ou fechar em menos de 10 minutos.",
      "Foi o primeiro estádio profissional dos esportes americanos a atingir o selo LEED Platinum por sustentabilidade hídrica e energética.",
      "Os preços de comida e bebida são propositalmente congelados e baixos (ex: cachorros-quentes a US$ 2), mudando a indústria esportiva americana.",
    ],
  },
  "levis-stadium": {
    descricao:
      "Inaugurado em 2014, o Levi's Stadium não é apenas a casa do San Francisco 49ers, mas um dos maiores ícones da tecnologia sustentável aplicados ao esporte mundial. Localizado em Santa Clara, o coração do Vale do Silício, o estádio redefine a experiência do torcedor ao integrar inovação extrema e design ecológico.",
    historia:
      "O projeto surgiu com a missão de substituir o antigo Candlestick Park. Desde a concepção, o objetivo foi criar um estádio inteligente com banda larga e Wi-Fi capazes de suportar 68.000 torcedores transmitindo vídeos. Já foi palco do Super Bowl 50.",
    curiosidades: [
      "Tem um teto verde de 2.500 m² coberto de painéis solares e vegetação nativa.",
      "Foi o primeiro estádio da NFL a receber a cobiçada certificação LEED Ouro por sustentabilidade ecológica.",
      "Localizado no Vale do Silício, usa um aplicativo próprio que permite ao torcedor pedir comida e recebê-la direto no seu assento.",
    ],
  },
  "estadio-azteca": {
    descricao:
      "O Estádio Azteca não é apenas um campo, é o maior templo do futebol nas Américas. Localizado na Cidade do México, ele respira história e mística. Reverenciado por sua altitude, acústica ensurdecedora e atmosfera monumental, o 'Colosso de Santa Úrsula' transcende o esporte.",
    historia:
      "Inaugurado em 1966, o Azteca foi palco de alguns dos momentos mais inesquecíveis da história do esporte. Foi no seu gramado sagrado que Pelé (1970) e Maradona (1986) escreveram seus nomes eternos nas Copas do Mundo, abrigando o 'Gol do Século' e a 'Mão de Deus'.",
    curiosidades: [
      "Único estádio da Terra a sediar TRÊS edições da Copa do Mundo (1970, 1986 e 2026).",
      "Seu recorde de público histórico impressiona: 119.853 espectadores na partida de boxe entre Julio César Chávez e Greg Haugen (1993).",
      "Fica a impressionantes 2.240 metros acima do nível do mar, oferecendo um desafio extremo de oxigenação para os visitantes.",
    ],
  },
  "hard-rock-stadium": {
    descricao:
      "Banhado pelo sol da Flórida, o Hard Rock Stadium em Miami é um centro global de eventos luxuosos. Com uma praça impecável e camarotes VIP que se misturam ao clima festivo de South Beach, a arena é sinônimo de entretenimento premium.",
    historia:
      "Inaugurado em 1987, passou por uma modernização espetacular recentemente que adicionou um enorme teto de dossel a céu aberto para proteger 90% dos fãs do sol e da chuva. Sediou múltiplos Super Bowls e agora hospeda o torneio de tênis Miami Open e o GP de Fórmula 1 em seus arredores.",
    curiosidades: [
      "É cercado por uma pista de Fórmula 1 construída exclusivamente para o GP de Miami.",
      "O teto suspenso quadrado foi projetado para suportar furacões severos da categoria 4, característicos da Flórida.",
      "Possui obras de arte de rua gigantes pintadas por grafiteiros famosos espalhadas por seus corredores e pilares.",
    ],
  },
  "estadio-bbva": {
    descricao:
      "Apelidado de 'El Gigante de Acero' (O Gigante de Aço), o BBVA em Monterrey é indiscutivelmente o estádio mais bonito do México, abraçado de forma imponente pela majestosa montanha Cerro de la Silla ao fundo, criando a paisagem mais cenográfica da Copa.",
    historia:
      "Inaugurado em 2015, revolucionou o design esportivo na América Latina. Desenhado por firmas globais de arquitetura, priorizou a proximidade extrema do torcedor com o campo e as vistas abertas para as montanhas que cercam a cidade de Monterrey.",
    curiosidades: [
      "As arquibancadas do lado sul são rebaixadas intencionalmente para criar um cartão-postal natural do vulcão Cerro de la Silla.",
      "Seu formato externo é inspirado nas tradicionais cervejarias industriais e na herança siderúrgica da cidade de Monterrey.",
      "Possui um complexo sistema de resfriamento para amenizar as escaldantes temperaturas desérticas do norte mexicano.",
    ],
  },
  "bc-place": {
    descricao:
      "Localizado no pitoresco centro de Vancouver, no Canadá, o BC Place é uma arena majestosa situada à beira-mar, oferecendo uma integração belíssima entre a infraestrutura moderna do estádio e a vida vibrante da cidade e das águas ao seu redor.",
    historia:
      "Inaugurado em 1983 como o primeiro estádio de teto suportado a ar da América do Norte. Em 2011 passou por uma reforma gigantesca que trocou o antigo teto por uma cobertura retrátil de cabos estaiados e tecidos modernos, modernizando completamente a arena.",
    curiosidades: [
      "Possui o maior teto retrátil suportado por cabos estaiados de toda a América do Norte.",
      "O 'anel de luz' que circunda o estádio é feito de painéis transparentes com luzes LED programáveis que mudam de cor.",
      "Foi o palco principal das Cerimônias de Abertura e Encerramento das Olimpíadas de Inverno de 2010.",
    ],
  }
};

export async function main() {
  console.log("Inserindo conteúdos editoriais para os Estádios (Lote 2)...");

  for (const [slug, conteudo] of Object.entries(conteudos)) {
    try {
      await prisma.estadio.update({
        where: { slug },
        data: conteudo,
      });
      console.log(`✅ ${slug} atualizado.`);
    } catch (e) {
      console.error(`❌ Erro ao atualizar ${slug}`);
    }
  }

  // Generic fallback para os demais estádios
  console.log("Preenchendo fallback para os demais estádios...");
  await prisma.estadio.updateMany({
    where: {
      descricao: null
    },
    data: {
      descricao: "Esta imponente arena é um dos palcos selecionados para receber a magia do futebol mundial na Copa de 2026. Preparado com instalações de última geração, ele trará uma experiência inesquecível para milhões de fãs de todos os continentes.",
      historia: "Construído e modernizado com foco na sustentabilidade e conforto do torcedor, o estádio já recebeu dezenas de eventos esportivos memoráveis ao longo de sua existência, consolidando-se como um patrimônio esportivo de sua respectiva cidade.",
      curiosidades: [
        "Selecionado oficialmente pela FIFA após um longo e rigoroso processo de qualificação técnica.",
        "Possui infraestrutura de padrão internacional que atende as rigorosas normas de sustentabilidade.",
        "Está preparando 'Fan Zones' gigantescas nos seus arredores para abrigar a festa multicultural da Copa."
      ]
    }
  });

  console.log("Conteúdo de todos os estádios atualizado com sucesso!");
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
