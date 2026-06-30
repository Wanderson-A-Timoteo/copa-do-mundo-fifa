import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { PAISES_ISO } from "../src/data/paises";

const url = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString: url });
const prisma = new PrismaClient({ adapter });

function toSlug(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

async function main() {
  console.log("Limpando banco...");
  await prisma.palpite.deleteMany();
  await prisma.troca.deleteMany();
  await prisma.albumFigurinha.deleteMany();
  await prisma.figurinha.deleteMany();
  await prisma.partida.deleteMany();
  await prisma.jogador.deleteMany();
  await prisma.estadio.deleteMany();
  await prisma.selecao.deleteMany();
  await prisma.grupo.deleteMany();

  console.log("Criando grupos...");
  const grupos = [];
  for (const letra of "ABCDEFGHIJKL") {
    const grupo = await prisma.grupo.create({
      data: { id: letra, nome: `Grupo ${letra}` },
    });
    grupos.push(grupo);
  }

  console.log("Criando estádios...");
  const estadiosData = [
    { slug: "metlife-stadium", nome: "Estádio de Nova York/Nova Jersey", cidade: "Nova Jersey", pais: "Estados Unidos", capacidade: 82500, latitude: 40.8135, longitude: -74.0745, descricao: "O MetLife Stadium é um dos maiores estádios dos Estados Unidos, localizado em East Rutherford, Nova Jersey. É a casa dos times New York Giants e New York Jets da NFL.", historia: "Inaugurado em 2010 com um custo de US$ 1,6 bilhão, o MetLife Stadium foi projetado para ser o centro de entretenimento esportivo da região metropolitana de Nova York. Recebeu a Super Bowl XLVIII em 2014, a primeira realizada em um estádio ao ar livre no norte dos EUA. Para a Copa do Mundo de 2026, será palco de partidas da fase de grupos e fases eliminatórias, incluindo uma semifinal. Sua arquitetura moderna e capacidade colossal o tornam um dos locais mais emblemáticos do torneio." },
    { slug: "sofi-stadium", nome: "Estádio de Los Angeles", cidade: "Los Angeles", pais: "Estados Unidos", capacidade: 70240, latitude: 33.9535, longitude: -118.3390, descricao: "O SoFi Stadium é um estádio ultramoderno localizado em Inglewood, Califórnia, conhecido por seu design inovador e telão de LED gigante suspenso.", historia: "Inaugurado em 2020 com um investimento de US$ 5 bilhões, o SoFi Stadium é a casa do Los Angeles Rams e Los Angeles Chargers da NFL. Seu telão anular de 360 graus, chamado 'Oculus', é o maior do mundo, pesando 1.100 toneladas e cobrindo todo o campo. Foi sede do Super Bowl LVI em 2022 e do College Football Playoff National Championship. Para 2026, será um dos principais palcos da Copa do Mundo." },
    { slug: "att-stadium", nome: "Estádio de Dallas", cidade: "Dallas", pais: "Estados Unidos", capacidade: 80000, latitude: 32.7474, longitude: -97.0925, descricao: "O AT&T Stadium, também conhecido como 'Jerry World', é um megacomplexo esportivo em Arlington, Texas, famoso por seu teto retrátil e telão gigante.", historia: "Inaugurado em 2009 como casa do Dallas Cowboys da NFL, o AT&T Stadium foi construído por US$ 1,3 bilhão. Seu telão central de 60 metros de comprimento é um dos maiores do mundo. O estádio já sediou a Super Bowl XLV, o WWE WrestleMania 32 e inúmeros concertos. A capacidade pode ser expandida para até 105.000 lugares, tornando-o um dos maiores estádios da NFL." },
    { slug: "nrg-stadium", nome: "Estádio de Houston", cidade: "Houston", pais: "Estados Unidos", capacidade: 72220, latitude: 29.6847, longitude: -95.4106, descricao: "O NRG Stadium é um estádio moderno com teto retrátil localizado em Houston, Texas, lar do Houston Texans da NFL.", historia: "Inaugurado em 2002 como Reliant Stadium, foi o primeiro estádio da NFL com teto retrátil. Em 2014 passou a se chamar NRG Stadium. Foi palco do Super Bowl LI em 2017, onde o New England Patriots fez a maior virada da história, além da WrestleMania 25 e 37. Sua infraestrutura de ponta e localização no Texas Medical Center o tornam um local icônico para grandes eventos." },
    { slug: "mercedes-benz-stadium", nome: "Estádio de Atlanta", cidade: "Atlanta", pais: "Estados Unidos", capacidade: 71000, latitude: 33.7555, longitude: -84.4010, descricao: "O Mercedes-Benz Stadium é um dos estádios mais inovadores do mundo, com um teto retrátil em forma de pétala e um design sustentável.", historia: "Inaugurado em 2017 para substituir o Georgia Dome, o Mercedes-Benz Stadium custou US$ 1,6 bilhão. Seu teto retrátil de oito painéis se abre como uma flor em apenas 12 minutos. Foi sede do Super Bowl LIII em 2019, da final da MLS Cup 2018 e da final da CONCACAF Gold Cup 2019. É conhecido por seus preços acessíveis de alimentação, inovação no mundo dos esportes." },
    { slug: "levis-stadium", nome: "Estádio da Baía de São Francisco", cidade: "Área da baía de São Francisco", pais: "Estados Unidos", capacidade: 68500, latitude: 37.4031, longitude: -121.9700, descricao: "O Levi's Stadium está localizado em Santa Clara, Califórnia, no coração do Vale do Silício, e é a casa do San Francisco 49ers.", historia: "Inaugurado em 2014 para substituir o Candlestick Park, o Levi's Stadium foi construído com tecnologia de ponta, incluindo Wi-Fi de alta capacidade em todo o estádio. Sediou o Super Bowl 50 em 2016, a final da Copa América Centenário em 2016 e inúmeros jogos de futebol internacional. Sua localização estratégica no Vale do Silício o conecta ao mundo da tecnologia e inovação." },
    { slug: "lincoln-financial-field", nome: "Estádio de Filadélfia", cidade: "Filadélfia", pais: "Estados Unidos", capacidade: 67594, latitude: 39.9008, longitude: -75.1675, descricao: "O Lincoln Financial Field é um estádio moderno localizado no sul da Filadélfia, lar do Philadelphia Eagles da NFL.", historia: "Inaugurado em 2003 no complexo esportivo South Philadelphia, substituindo o Veterans Stadium. Foi sede de jogos da Copa do Mundo Feminina de 2015 e da Copa América Centenário de 2016. O estádio é conhecido por sua atmosfera intensa e pela paixão da torcida dos Eagles, considerada uma das mais barulhentas da NFL. Foi reformado para receber partidas da Copa do Mundo de 2026." },
    { slug: "lumen-field", nome: "Estádio de Seattle", cidade: "Seattle", pais: "Estados Unidos", capacidade: 68740, latitude: 47.5951, longitude: -122.3316, descricao: "O Lumen Field é um estádio ao ar livre em Seattle, Washington, famoso por seu telhado ondulado e por ser o estádio mais barulhento do mundo.", historia: "Inaugurado em 2002 como Seahawks Stadium, o Lumen Field detém o Recorde Mundial do Guinness para o nível de ruído mais alto em um estádio ao ar livre (137,6 dB), registrado em 2013. É a casa do Seattle Seahawks (NFL) e do Seattle Sounders (MLS). O estádio foi palco da final da MLS Cup 2019 e da vitória dos Sounders na CONCACAF Champions League 2022." },
    { slug: "gillette-stadium", nome: "Estádio de Boston", cidade: "Boston", pais: "Estados Unidos", capacidade: 65878, latitude: 42.0909, longitude: -71.2643, descricao: "O Gillette Stadium está localizado em Foxborough, Massachusetts, e é a casa do New England Patriots da NFL e do New England Revolution da MLS.", historia: "Inaugurado em 2002 para substituir o Foxboro Stadium, o Gillette Stadium foi expandido em 2023 com uma torre de observação e um centro de entretenimento. Sediou múltiplos jogos da Copa do Mundo Feminina, incluindo as quartas de final em 2015. Sua localização próxima a Boston o torna um polo esportivo importante na Nova Inglaterra." },
    { slug: "arrowhead-stadium", nome: "Estádio de Kansas City", cidade: "Kansas City", pais: "Estados Unidos", capacidade: 76416, latitude: 39.0489, longitude: -94.4839, descricao: "O Arrowhead Stadium é um lendário estádio em Kansas City, Missouri, conhecido por sua atmosfera ensurdecedora e pela torcida apaixonada do Kansas City Chiefs.", historia: "Inaugurado em 1972, o Arrowhead Stadium passou por uma grande reforma de US$ 375 milhões em 2010. É famoso por deter o recorde de estádio mais barulhento do mundo (142,2 dB). Foi palco de jogos da Copa do Mundo de 1994 e da Copa do Mundo Feminina de 1999 e 2015. Para 2026, sediará partidas da Copa do Mundo, retornando ao cenário mundial." },
    { slug: "hard-rock-stadium", nome: "Estádio de Miami", cidade: "Miami", pais: "Estados Unidos", capacidade: 65326, latitude: 25.9580, longitude: -80.2389, descricao: "O Hard Rock Stadium está localizado em Miami Gardens, Flórida, e é a casa do Miami Dolphins da NFL, com uma atmosfera tropical única.", historia: "Inaugurado em 1987 como Joe Robbie Stadium, passou por múltiplas renovações, incluindo uma grande reforma de US$ 500 milhões entre 2015 e 2017. Sediou o Super Bowl XLIV, XLVIII, LIV e será sede do Super Bowl LX em 2026. Também recebeu a final da Copa América Centenário e o Miami Open de tênis. Seu design aberto e clima de Miami criam uma experiência única." },
    { slug: "estadio-azteca", nome: "Estádio da Cidade do México", cidade: "Cidade do México", pais: "México", capacidade: 87523, latitude: 19.3029, longitude: -99.1504, descricao: "O Estádio Azteca é um dos estádios mais icônicos do mundo, palco de duas finais de Copa do Mundo (1970 e 1986) e do lendário 'Gol do Século' de Maradona.", historia: "Inaugurado em 29 de maio de 1966, o Estádio Azteca é o terceiro maior estádio do mundo e o único a sediar duas finais de Copa do Mundo. Foi palco do 'Gol do Século' de Diego Maradona em 1986, além do 'Gol de Ouro' de Pelé em 1970. Também sediou os Jogos Olímpicos de 1968 e a Copa do Mundo Feminina de 1971. Para a Copa de 2026, será o estádio com mais jogos de Copa do Mundo na história." },
    { slug: "estadio-bbva", nome: "Estádio de Monterrey", cidade: "Monterrey", pais: "México", capacidade: 53500, latitude: 25.6700, longitude: -100.2444, descricao: "O Estádio BBVA, também conhecido como 'El Gigante de Acero', é um estádio moderno em Monterrey, lar do CF Monterrey.", historia: "Inaugurado em 2015, o Estádio BBVA foi construído com um investimento de US$ 200 milhões. Seu design moderno inclui um teto que cobre todas as arquibancadas. Foi sede da final da CONCACAF Champions League em 2017 e 2019, e da Copa Ouro da CONCACAF. É considerado um dos estádios mais tecnológicos da América Latina." },
    { slug: "estadio-akron", nome: "Estádio de Guadalajara", cidade: "Guadalajara", pais: "México", capacidade: 49850, latitude: 20.6808, longitude: -103.4613, descricao: "O Estádio Akron é um estádio moderno localizado em Zapopan, na região metropolitana de Guadalajara, casa do Club Deportivo Guadalajara (Chivas).", historia: "Inaugurado em 2010, o Estádio Akron (originalmente Estádio Omnilife) tem um design inspirado em um vulcão, refletindo a paisagem vulcânica da região. Foi palco dos Jogos Pan-Americanos de 2011 e da final da Copa Libertadores de 2010 (primeira vez que uma final foi disputada no México). Sua atmosfera vibrante e torcida apaixonada das Chivas criam um ambiente único no futebol mexicano." },
    { slug: "bc-place", nome: "BC Place de Vancouver", cidade: "Vancouver", pais: "Canadá", capacidade: 54500, latitude: 49.2765, longitude: -123.1118, descricao: "O BC Place é um estádio icônico no centro de Vancouver, com seu teto retrátil de teflon que é o maior do mundo em seu tipo.", historia: "Inaugurado em 1983, o BC Place passou por uma renovação de US$ 563 milhões em 2011, que instalou o maior teto retrátil de teflon do mundo. Foi palco da cerimônia de abertura dos Jogos Olímpicos de Inverno de 2010 e da final do MLS Cup 2011, 2012 e 2015. É a casa do BC Lions (CFL) e do Vancouver Whitecaps (MLS)." },
    { slug: "bmo-field", nome: "Estádio de Toronto", cidade: "Toronto", pais: "Canadá", capacidade: 30991, latitude: 43.6327, longitude: -79.4185, descricao: "O BMO Field é um estádio à beira do lago Ontário, em Toronto, lar do Toronto FC e da seleção canadense de futebol.", historia: "Inaugurado em 2007 como parte dos Jogos Pan-Americanos de 2015, o BMO Field passou por expansões em 2014 e 2016 para aumentar sua capacidade. Foi sede do MLS Cup 2016 e 2017, onde o Toronto FC conquistou títulos históricos. Também recebeu jogos da Copa do Mundo Feminina de 2015, incluindo as semifinais. Para 2026, sediará partidas da Copa do Mundo." },
  ];

  const estadios = await Promise.all(
    estadiosData.map((e) => prisma.estadio.create({ data: e }))
  );

  console.log("Criando seleções...");
  const selecoesData = [
    { nome: "México", grupoId: "A", continente: "CONCACAF", rankingFifa: 22, titulos: 0, corPrimaria: "#006847", corSecundaria: "#CE1126" },
    { nome: "África do Sul", grupoId: "A", continente: "CAF", rankingFifa: 66, titulos: 0, corPrimaria: "#007A4D", corSecundaria: "#FFB612" },
    { nome: "Coreia do Sul", grupoId: "A", continente: "AFC", rankingFifa: 27, titulos: 0, corPrimaria: "#C60C30", corSecundaria: "#003478" },
    { nome: "República Tcheca", grupoId: "A", continente: "UEFA", rankingFifa: 36, titulos: 0, corPrimaria: "#D7141A", corSecundaria: "#FFFFFF" },
    { nome: "Suíça", grupoId: "B", continente: "UEFA", rankingFifa: 16, titulos: 0, corPrimaria: "#FF0000", corSecundaria: "#FFFFFF" },
    { nome: "Canadá", grupoId: "B", continente: "CONCACAF", rankingFifa: 48, titulos: 0, corPrimaria: "#FF0000", corSecundaria: "#FFFFFF" },
    { nome: "Bósnia e Herzegovina", grupoId: "B", continente: "UEFA", rankingFifa: 57, titulos: 0, corPrimaria: "#002395", corSecundaria: "#FFD700" },
    { nome: "Catar", grupoId: "B", continente: "AFC", rankingFifa: 55, titulos: 0, corPrimaria: "#8C1B40", corSecundaria: "#FFFFFF" },
    { nome: "Brasil", grupoId: "C", continente: "CONMEBOL", rankingFifa: 5, titulos: 5, corPrimaria: "#FFDF00", corSecundaria: "#009739" },
    { nome: "Marrocos", grupoId: "C", continente: "CAF", rankingFifa: 12, titulos: 0, corPrimaria: "#C1272D", corSecundaria: "#006233" },
    { nome: "Escócia", grupoId: "C", continente: "UEFA", rankingFifa: 39, titulos: 0, corPrimaria: "#003876", corSecundaria: "#FFFFFF" },
    { nome: "Haiti", grupoId: "C", continente: "CONCACAF", rankingFifa: 86, titulos: 0, corPrimaria: "#00209F", corSecundaria: "#D21034" },
    { nome: "Estados Unidos", grupoId: "D", continente: "CONCACAF", rankingFifa: 19, titulos: 0, corPrimaria: "#3C3B6E", corSecundaria: "#FFFFFF" },
    { nome: "Austrália", grupoId: "D", continente: "AFC", rankingFifa: 40, titulos: 0, corPrimaria: "#FFD700", corSecundaria: "#00843D" },
    { nome: "Paraguai", grupoId: "D", continente: "CONMEBOL", rankingFifa: 53, titulos: 0, corPrimaria: "#E00000", corSecundaria: "#FFFFFF" },
    { nome: "Turquia", grupoId: "D", continente: "UEFA", rankingFifa: 29, titulos: 0, corPrimaria: "#E30A17", corSecundaria: "#FFFFFF" },
    { nome: "Alemanha", grupoId: "E", continente: "UEFA", rankingFifa: 3, titulos: 4, corPrimaria: "#FFFFFF", corSecundaria: "#000000" },
    { nome: "Costa do Marfim", grupoId: "E", continente: "CAF", rankingFifa: 45, titulos: 0, corPrimaria: "#FF6B00", corSecundaria: "#009E60" },
    { nome: "Equador", grupoId: "E", continente: "CONMEBOL", rankingFifa: 30, titulos: 0, corPrimaria: "#FFD100", corSecundaria: "#003893" },
    { nome: "Curaçao", grupoId: "E", continente: "CONCACAF", rankingFifa: 90, titulos: 0, corPrimaria: "#003DA5", corSecundaria: "#FFFFFF" },
    { nome: "Holanda", grupoId: "F", continente: "UEFA", rankingFifa: 7, titulos: 0, corPrimaria: "#FF6600", corSecundaria: "#FFFFFF" },
    { nome: "Japão", grupoId: "F", continente: "AFC", rankingFifa: 17, titulos: 0, corPrimaria: "#000080", corSecundaria: "#FFFFFF" },
    { nome: "Suécia", grupoId: "F", continente: "UEFA", rankingFifa: 23, titulos: 0, corPrimaria: "#FFDA00", corSecundaria: "#005BAA" },
    { nome: "Tunísia", grupoId: "F", continente: "CAF", rankingFifa: 34, titulos: 0, corPrimaria: "#E70013", corSecundaria: "#FFFFFF" },
    { nome: "Egito", grupoId: "G", continente: "CAF", rankingFifa: 35, titulos: 0, corPrimaria: "#C8102E", corSecundaria: "#000000" },
    { nome: "Irã", grupoId: "G", continente: "AFC", rankingFifa: 21, titulos: 0, corPrimaria: "#239F40", corSecundaria: "#FFFFFF" },
    { nome: "Bélgica", grupoId: "G", continente: "UEFA", rankingFifa: 10, titulos: 0, corPrimaria: "#E31837", corSecundaria: "#FFD700" },
    { nome: "Nova Zelândia", grupoId: "G", continente: "OFC", rankingFifa: 104, titulos: 0, corPrimaria: "#000000", corSecundaria: "#FFFFFF" },
    { nome: "Espanha", grupoId: "H", continente: "UEFA", rankingFifa: 8, titulos: 1, corPrimaria: "#C60B1E", corSecundaria: "#FFC400" },
    { nome: "Uruguai", grupoId: "H", continente: "CONMEBOL", rankingFifa: 11, titulos: 2, corPrimaria: "#003DA5", corSecundaria: "#FFFFFF" },
    { nome: "Cabo Verde", grupoId: "H", continente: "CAF", rankingFifa: 64, titulos: 0, corPrimaria: "#003DA5", corSecundaria: "#FFFFFF" },
    { nome: "Arábia Saudita", grupoId: "H", continente: "AFC", rankingFifa: 52, titulos: 0, corPrimaria: "#006C35", corSecundaria: "#FFFFFF" },
    { nome: "França", grupoId: "I", continente: "UEFA", rankingFifa: 2, titulos: 2, corPrimaria: "#002395", corSecundaria: "#FFFFFF" },
    { nome: "Noruega", grupoId: "I", continente: "UEFA", rankingFifa: 44, titulos: 0, corPrimaria: "#C8102E", corSecundaria: "#FFFFFF" },
    { nome: "Senegal", grupoId: "I", continente: "CAF", rankingFifa: 18, titulos: 0, corPrimaria: "#FFFFFF", corSecundaria: "#00853F" },
    { nome: "Iraque", grupoId: "I", continente: "AFC", rankingFifa: 68, titulos: 0, corPrimaria: "#007A33", corSecundaria: "#CE1126" },
    { nome: "Argentina", grupoId: "J", continente: "CONMEBOL", rankingFifa: 1, titulos: 3, corPrimaria: "#75AADB", corSecundaria: "#FFFFFF" },
    { nome: "Áustria", grupoId: "J", continente: "UEFA", rankingFifa: 24, titulos: 0, corPrimaria: "#ED2939", corSecundaria: "#FFFFFF" },
    { nome: "Argélia", grupoId: "J", continente: "CAF", rankingFifa: 32, titulos: 0, corPrimaria: "#006633", corSecundaria: "#FFFFFF" },
    { nome: "Jordânia", grupoId: "J", continente: "AFC", rankingFifa: 71, titulos: 0, corPrimaria: "#CE1126", corSecundaria: "#FFFFFF" },
    { nome: "Colômbia", grupoId: "K", continente: "CONMEBOL", rankingFifa: 14, titulos: 0, corPrimaria: "#FFD700", corSecundaria: "#003893" },
    { nome: "Portugal", grupoId: "K", continente: "UEFA", rankingFifa: 6, titulos: 0, corPrimaria: "#006600", corSecundaria: "#FF0000" },
    { nome: "RD Congo", grupoId: "K", continente: "CAF", rankingFifa: 63, titulos: 0, corPrimaria: "#007FFF", corSecundaria: "#FFD700" },
    { nome: "Uzbequistão", grupoId: "K", continente: "AFC", rankingFifa: 74, titulos: 0, corPrimaria: "#0066B4", corSecundaria: "#FFFFFF" },
    { nome: "Inglaterra", grupoId: "L", continente: "UEFA", rankingFifa: 4, titulos: 1, corPrimaria: "#FFFFFF", corSecundaria: "#CE1124" },
    { nome: "Gana", grupoId: "L", continente: "CAF", rankingFifa: 59, titulos: 0, corPrimaria: "#CE1126", corSecundaria: "#006B3F" },
    { nome: "Croácia", grupoId: "L", continente: "UEFA", rankingFifa: 9, titulos: 0, corPrimaria: "#FFFFFF", corSecundaria: "#C8102E" },
    { nome: "Panamá", grupoId: "L", continente: "CONCACAF", rankingFifa: 58, titulos: 0, corPrimaria: "#00529C", corSecundaria: "#CE1126" },
  ];

  for (const s of selecoesData) {
    const codigo = PAISES_ISO[s.nome];
    await prisma.selecao.create({
      data: {
        ...s,
        tecnico: "A definir",
        slug: toSlug(s.nome),
        codigoPais: codigo,
        bandeiraUrl: codigo
          ? `https://flagcdn.com/w320/${codigo.replace("-", "/")}.png`
          : undefined,
      },
    });
  }

  const todasSelecoes = await prisma.selecao.findMany({ orderBy: { id: "asc" } });

  const jogadoresData: { selecaoId: number; nome: string; posicao: string }[] = [
    { selecaoId: todasSelecoes[0].id, nome: "Raúl Jiménez", posicao: "Atacante" },
    { selecaoId: todasSelecoes[0].id, nome: "Guillermo Ochoa", posicao: "Goleiro" },
    { selecaoId: todasSelecoes[0].id, nome: "Edson Álvarez", posicao: "Meia" },
    { selecaoId: todasSelecoes[1].id, nome: "Percy Tau", posicao: "Atacante" },
    { selecaoId: todasSelecoes[1].id, nome: "Ronwen Williams", posicao: "Goleiro" },
    { selecaoId: todasSelecoes[2].id, nome: "Son Heung-min", posicao: "Atacante" },
    { selecaoId: todasSelecoes[2].id, nome: "Kim Min-jae", posicao: "Defensor" },
    { selecaoId: todasSelecoes[3].id, nome: "Patrik Schick", posicao: "Atacante" },
    { selecaoId: todasSelecoes[3].id, nome: "Tomáš Souček", posicao: "Meia" },
    { selecaoId: todasSelecoes[4].id, nome: "Granit Xhaka", posicao: "Meia" },
    { selecaoId: todasSelecoes[4].id, nome: "Breel Embolo", posicao: "Atacante" },
    { selecaoId: todasSelecoes[5].id, nome: "Alphonso Davies", posicao: "Defensor" },
    { selecaoId: todasSelecoes[5].id, nome: "Jonathan David", posicao: "Atacante" },
    { selecaoId: todasSelecoes[6].id, nome: "Edin Džeko", posicao: "Atacante" },
    { selecaoId: todasSelecoes[6].id, nome: "Miralem Pjanić", posicao: "Meia" },
    { selecaoId: todasSelecoes[7].id, nome: "Akram Afif", posicao: "Atacante" },
    { selecaoId: todasSelecoes[7].id, nome: "Almoez Ali", posicao: "Atacante" },
    { selecaoId: todasSelecoes[8].id, nome: "Vinícius Júnior", posicao: "Atacante" },
    { selecaoId: todasSelecoes[8].id, nome: "Rodrygo", posicao: "Atacante" },
    { selecaoId: todasSelecoes[8].id, nome: "Raphinha", posicao: "Atacante" },
    { selecaoId: todasSelecoes[8].id, nome: "Bruno Guimarães", posicao: "Meia" },
    { selecaoId: todasSelecoes[8].id, nome: "João Gomes", posicao: "Meia" },
    { selecaoId: todasSelecoes[8].id, nome: "Alisson", posicao: "Goleiro" },
    { selecaoId: todasSelecoes[9].id, nome: "Achraf Hakimi", posicao: "Defensor" },
    { selecaoId: todasSelecoes[9].id, nome: "Youssef En-Nesyri", posicao: "Atacante" },
    { selecaoId: todasSelecoes[9].id, nome: "Sofyan Amrabat", posicao: "Meia" },
    { selecaoId: todasSelecoes[10].id, nome: "Scott McTominay", posicao: "Meia" },
    { selecaoId: todasSelecoes[10].id, nome: "Andrew Robertson", posicao: "Defensor" },
    { selecaoId: todasSelecoes[11].id, nome: "Duckens Nazon", posicao: "Atacante" },
    { selecaoId: todasSelecoes[11].id, nome: "Frantzdy Pierrot", posicao: "Atacante" },
    { selecaoId: todasSelecoes[12].id, nome: "Christian Pulisic", posicao: "Meia" },
    { selecaoId: todasSelecoes[12].id, nome: "Weston McKennie", posicao: "Meia" },
    { selecaoId: todasSelecoes[12].id, nome: "Gio Reyna", posicao: "Meia" },
    { selecaoId: todasSelecoes[12].id, nome: "Matt Turner", posicao: "Goleiro" },
    { selecaoId: todasSelecoes[12].id, nome: "Tyler Adams", posicao: "Meia" },
    { selecaoId: todasSelecoes[13].id, nome: "Mathew Ryan", posicao: "Goleiro" },
    { selecaoId: todasSelecoes[13].id, nome: "Mitchell Duke", posicao: "Atacante" },
    { selecaoId: todasSelecoes[14].id, nome: "Miguel Almirón", posicao: "Meia" },
    { selecaoId: todasSelecoes[14].id, nome: "Antony Silva", posicao: "Goleiro" },
    { selecaoId: todasSelecoes[15].id, nome: "Hakan Çalhanoğlu", posicao: "Meia" },
    { selecaoId: todasSelecoes[15].id, nome: "Kerem Aktürkoğlu", posicao: "Atacante" },
    { selecaoId: todasSelecoes[16].id, nome: "Florian Wirtz", posicao: "Meia" },
    { selecaoId: todasSelecoes[16].id, nome: "Jamal Musiala", posicao: "Meia" },
    { selecaoId: todasSelecoes[16].id, nome: "Kai Havertz", posicao: "Atacante" },
    { selecaoId: todasSelecoes[16].id, nome: "Antonio Rüdiger", posicao: "Defensor" },
    { selecaoId: todasSelecoes[16].id, nome: "Marc-André ter Stegen", posicao: "Goleiro" },
    { selecaoId: todasSelecoes[17].id, nome: "Sébastien Haller", posicao: "Atacante" },
    { selecaoId: todasSelecoes[17].id, nome: "Franck Kessié", posicao: "Meia" },
    { selecaoId: todasSelecoes[18].id, nome: "Enner Valencia", posicao: "Atacante" },
    { selecaoId: todasSelecoes[18].id, nome: "Pervis Estupiñán", posicao: "Defensor" },
    { selecaoId: todasSelecoes[19].id, nome: "Leandro Bacuna", posicao: "Meia" },
    { selecaoId: todasSelecoes[19].id, nome: "Rangelo Janga", posicao: "Atacante" },
    { selecaoId: todasSelecoes[20].id, nome: "Virgil van Dijk", posicao: "Defensor" },
    { selecaoId: todasSelecoes[20].id, nome: "Frenkie de Jong", posicao: "Meia" },
    { selecaoId: todasSelecoes[20].id, nome: "Memphis Depay", posicao: "Atacante" },
    { selecaoId: todasSelecoes[21].id, nome: "Takefusa Kubo", posicao: "Atacante" },
    { selecaoId: todasSelecoes[21].id, nome: "Wataru Endo", posicao: "Meia" },
    { selecaoId: todasSelecoes[22].id, nome: "Alexander Isak", posicao: "Atacante" },
    { selecaoId: todasSelecoes[22].id, nome: "Victor Lindelöf", posicao: "Defensor" },
    { selecaoId: todasSelecoes[23].id, nome: "Ellyes Skhiri", posicao: "Meia" },
    { selecaoId: todasSelecoes[23].id, nome: "Wahbi Khazri", posicao: "Atacante" },
    { selecaoId: todasSelecoes[24].id, nome: "Mohamed Salah", posicao: "Atacante" },
    { selecaoId: todasSelecoes[24].id, nome: "Mahmoud Trezeguet", posicao: "Meia" },
    { selecaoId: todasSelecoes[25].id, nome: "Mehdi Taremi", posicao: "Atacante" },
    { selecaoId: todasSelecoes[25].id, nome: "Sardar Azmoun", posicao: "Atacante" },
    { selecaoId: todasSelecoes[26].id, nome: "Kevin De Bruyne", posicao: "Meia" },
    { selecaoId: todasSelecoes[26].id, nome: "Romelu Lukaku", posicao: "Atacante" },
    { selecaoId: todasSelecoes[26].id, nome: "Thibaut Courtois", posicao: "Goleiro" },
    { selecaoId: todasSelecoes[27].id, nome: "Chris Wood", posicao: "Atacante" },
    { selecaoId: todasSelecoes[27].id, nome: "Winston Reid", posicao: "Defensor" },
    { selecaoId: todasSelecoes[28].id, nome: "Lamine Yamal", posicao: "Atacante" },
    { selecaoId: todasSelecoes[28].id, nome: "Pedri", posicao: "Meia" },
    { selecaoId: todasSelecoes[28].id, nome: "Rodri", posicao: "Meia" },
    { selecaoId: todasSelecoes[28].id, nome: "Unai Simón", posicao: "Goleiro" },
    { selecaoId: todasSelecoes[28].id, nome: "Dani Carvajal", posicao: "Defensor" },
    { selecaoId: todasSelecoes[29].id, nome: "Federico Valverde", posicao: "Meia" },
    { selecaoId: todasSelecoes[29].id, nome: "Darwin Núñez", posicao: "Atacante" },
    { selecaoId: todasSelecoes[29].id, nome: "Ronald Araújo", posicao: "Defensor" },
    { selecaoId: todasSelecoes[30].id, nome: "Ryan Mendes", posicao: "Atacante" },
    { selecaoId: todasSelecoes[30].id, nome: "Jamiro Monteiro", posicao: "Meia" },
    { selecaoId: todasSelecoes[31].id, nome: "Salem Al-Dawsari", posicao: "Atacante" },
    { selecaoId: todasSelecoes[31].id, nome: "Firas Al-Buraikan", posicao: "Atacante" },
    { selecaoId: todasSelecoes[32].id, nome: "Kylian Mbappé", posicao: "Atacante" },
    { selecaoId: todasSelecoes[32].id, nome: "Eduardo Camavinga", posicao: "Meia" },
    { selecaoId: todasSelecoes[32].id, nome: "Dayot Upamecano", posicao: "Defensor" },
    { selecaoId: todasSelecoes[32].id, nome: "Mike Maignan", posicao: "Goleiro" },
    { selecaoId: todasSelecoes[32].id, nome: "William Saliba", posicao: "Defensor" },
    { selecaoId: todasSelecoes[33].id, nome: "Erling Haaland", posicao: "Atacante" },
    { selecaoId: todasSelecoes[33].id, nome: "Martin Ødegaard", posicao: "Meia" },
    { selecaoId: todasSelecoes[34].id, nome: "Sadio Mané", posicao: "Atacante" },
    { selecaoId: todasSelecoes[34].id, nome: "Kalidou Koulibaly", posicao: "Defensor" },
    { selecaoId: todasSelecoes[35].id, nome: "Ali Adnan", posicao: "Defensor" },
    { selecaoId: todasSelecoes[35].id, nome: "Aymen Hussein", posicao: "Atacante" },
    { selecaoId: todasSelecoes[36].id, nome: "Lionel Messi", posicao: "Atacante" },
    { selecaoId: todasSelecoes[36].id, nome: "Enzo Fernández", posicao: "Meia" },
    { selecaoId: todasSelecoes[36].id, nome: "Julián Álvarez", posicao: "Atacante" },
    { selecaoId: todasSelecoes[36].id, nome: "Emiliano Martínez", posicao: "Goleiro" },
    { selecaoId: todasSelecoes[36].id, nome: "Nicolás Otamendi", posicao: "Defensor" },
    { selecaoId: todasSelecoes[37].id, nome: "David Alaba", posicao: "Defensor" },
    { selecaoId: todasSelecoes[37].id, nome: "Marcel Sabitzer", posicao: "Meia" },
    { selecaoId: todasSelecoes[38].id, nome: "Riyad Mahrez", posicao: "Atacante" },
    { selecaoId: todasSelecoes[38].id, nome: "Islam Slimani", posicao: "Atacante" },
    { selecaoId: todasSelecoes[39].id, nome: "Mousa Al-Tamari", posicao: "Atacante" },
    { selecaoId: todasSelecoes[39].id, nome: "Yazan Al-Naimat", posicao: "Atacante" },
    { selecaoId: todasSelecoes[40].id, nome: "Luis Díaz", posicao: "Atacante" },
    { selecaoId: todasSelecoes[40].id, nome: "James Rodríguez", posicao: "Meia" },
    { selecaoId: todasSelecoes[40].id, nome: "Rafael Santos Borré", posicao: "Atacante" },
    { selecaoId: todasSelecoes[41].id, nome: "Cristiano Ronaldo", posicao: "Atacante" },
    { selecaoId: todasSelecoes[41].id, nome: "Bruno Fernandes", posicao: "Meia" },
    { selecaoId: todasSelecoes[41].id, nome: "Bernardo Silva", posicao: "Meia" },
    { selecaoId: todasSelecoes[41].id, nome: "Rúben Dias", posicao: "Defensor" },
    { selecaoId: todasSelecoes[41].id, nome: "Diogo Costa", posicao: "Goleiro" },
    { selecaoId: todasSelecoes[42].id, nome: "Yoane Wissa", posicao: "Atacante" },
    { selecaoId: todasSelecoes[42].id, nome: "Chancel Mbemba", posicao: "Defensor" },
    { selecaoId: todasSelecoes[43].id, nome: "Odiljon Hamrobekov", posicao: "Meia" },
    { selecaoId: todasSelecoes[43].id, nome: "Eldor Shomurodov", posicao: "Atacante" },
    { selecaoId: todasSelecoes[44].id, nome: "Harry Kane", posicao: "Atacante" },
    { selecaoId: todasSelecoes[44].id, nome: "Jude Bellingham", posicao: "Meia" },
    { selecaoId: todasSelecoes[44].id, nome: "Declan Rice", posicao: "Meia" },
    { selecaoId: todasSelecoes[44].id, nome: "Bukayo Saka", posicao: "Atacante" },
    { selecaoId: todasSelecoes[44].id, nome: "Jordan Pickford", posicao: "Goleiro" },
    { selecaoId: todasSelecoes[45].id, nome: "Mohammed Kudus", posicao: "Meia" },
    { selecaoId: todasSelecoes[45].id, nome: "Thomas Partey", posicao: "Meia" },
    { selecaoId: todasSelecoes[46].id, nome: "Luka Modrić", posicao: "Meia" },
    { selecaoId: todasSelecoes[46].id, nome: "Joško Gvardiol", posicao: "Defensor" },
    { selecaoId: todasSelecoes[46].id, nome: "Andrej Kramarić", posicao: "Atacante" },
    { selecaoId: todasSelecoes[47].id, nome: "Aníbal Godoy", posicao: "Meia" },
    { selecaoId: todasSelecoes[47].id, nome: "Ismael Díaz", posicao: "Atacante" },
  ];

  console.log("Criando jogadores...");
  let numFigurinha = 1;
  for (const j of jogadoresData) {
    const jogador = await prisma.jogador.create({
      data: {
        selecaoId: j.selecaoId,
        nome: j.nome,
        posicao: j.posicao,
        numeroCamisa: Math.floor(Math.random() * 30) + 1,
      },
    });

    await prisma.figurinha.create({
      data: {
        numero: numFigurinha++,
        selecaoId: j.selecaoId,
        jogadorId: jogador.id,
        tipo: "jogador",
        raridade: Math.random() < 0.1 ? "rara" : "comum",
      },
    });
  }

  console.log("Criando partidas da fase de grupos...");

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

  for (const j of jogos) {
    await prisma.partida.create({
      data: {
        fase: "GRUPOS",
        grupoId: todasSelecoes[j.mand].grupoId,
        selecaoMandanteId: todasSelecoes[j.mand].id,
        selecaoVisitanteId: todasSelecoes[j.vis].id,
        dataHora: new Date(2026, j.mes - 1, j.dia, j.hora, j.min),
        estadioId: estadios[j.est].id,
        encerrada: false,
      },
    });
  }

  console.log("Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
