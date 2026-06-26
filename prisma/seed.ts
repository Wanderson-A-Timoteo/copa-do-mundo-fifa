import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

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
    { nome: "MetLife Stadium", cidade: "East Rutherford", pais: "Estados Unidos", capacidade: 82500, latitude: 40.8135, longitude: -74.0745 },
    { nome: "SoFi Stadium", cidade: "Inglewood", pais: "Estados Unidos", capacidade: 70240, latitude: 33.9535, longitude: -118.3390 },
    { nome: "AT&T Stadium", cidade: "Arlington", pais: "Estados Unidos", capacidade: 80000, latitude: 32.7474, longitude: -97.0925 },
    { nome: "NRG Stadium", cidade: "Houston", pais: "Estados Unidos", capacidade: 72220, latitude: 29.6847, longitude: -95.4106 },
    { nome: "Mercedes-Benz Stadium", cidade: "Atlanta", pais: "Estados Unidos", capacidade: 71000, latitude: 33.7555, longitude: -84.4010 },
    { nome: "Levi's Stadium", cidade: "Santa Clara", pais: "Estados Unidos", capacidade: 68500, latitude: 37.4031, longitude: -121.9700 },
    { nome: "Lincoln Financial Field", cidade: "Filadélfia", pais: "Estados Unidos", capacidade: 67594, latitude: 39.9008, longitude: -75.1675 },
    { nome: "Lumen Field", cidade: "Seattle", pais: "Estados Unidos", capacidade: 68740, latitude: 47.5951, longitude: -122.3316 },
    { nome: "Gillette Stadium", cidade: "Foxborough", pais: "Estados Unidos", capacidade: 65878, latitude: 42.0909, longitude: -71.2643 },
    { nome: "Arrowhead Stadium", cidade: "Kansas City", pais: "Estados Unidos", capacidade: 76416, latitude: 39.0489, longitude: -94.4839 },
    { nome: "Hard Rock Stadium", cidade: "Miami Gardens", pais: "Estados Unidos", capacidade: 65326, latitude: 25.9580, longitude: -80.2389 },
    { nome: "Estádio Azteca", cidade: "Cidade do México", pais: "México", capacidade: 87523, latitude: 19.3029, longitude: -99.1504 },
    { nome: "Estádio BBVA", cidade: "Monterrey", pais: "México", capacidade: 53500, latitude: 25.6700, longitude: -100.2444 },
    { nome: "Estádio Akron", cidade: "Guadalajara", pais: "México", capacidade: 49850, latitude: 20.6808, longitude: -103.4613 },
    { nome: "BC Place", cidade: "Vancouver", pais: "Canadá", capacidade: 54500, latitude: 49.2765, longitude: -123.1118 },
    { nome: "BMO Field", cidade: "Toronto", pais: "Canadá", capacidade: 30991, latitude: 43.6327, longitude: -79.4185 },
  ];

  const estadios = await Promise.all(
    estadiosData.map((e) => prisma.estadio.create({ data: e }))
  );

  console.log("Criando seleções...");
  const selecoesData = [
    { nome: "Brasil", grupoId: "A", continente: "CONMEBOL", rankingFifa: 5, titulos: 5, corPrimaria: "#FFDF00", corSecundaria: "#009739" },
    { nome: "Alemanha", grupoId: "A", continente: "UEFA", rankingFifa: 3, titulos: 4, corPrimaria: "#FFFFFF", corSecundaria: "#000000" },
    { nome: "Camarões", grupoId: "A", continente: "CAF", rankingFifa: 38, titulos: 0, corPrimaria: "#007A5E", corSecundaria: "#CE1126" },
    { nome: "Arábia Saudita", grupoId: "A", continente: "AFC", rankingFifa: 52, titulos: 0, corPrimaria: "#006C35", corSecundaria: "#FFFFFF" },
    { nome: "Argentina", grupoId: "B", continente: "CONMEBOL", rankingFifa: 1, titulos: 3, corPrimaria: "#75AADB", corSecundaria: "#FFFFFF" },
    { nome: "França", grupoId: "B", continente: "UEFA", rankingFifa: 2, titulos: 2, corPrimaria: "#002395", corSecundaria: "#FFFFFF" },
    { nome: "Marrocos", grupoId: "B", continente: "CAF", rankingFifa: 12, titulos: 0, corPrimaria: "#C1272D", corSecundaria: "#006233" },
    { nome: "Austrália", grupoId: "B", continente: "AFC", rankingFifa: 40, titulos: 0, corPrimaria: "#FFD700", corSecundaria: "#00843D" },
    { nome: "Inglaterra", grupoId: "C", continente: "UEFA", rankingFifa: 4, titulos: 1, corPrimaria: "#FFFFFF", corSecundaria: "#CE1124" },
    { nome: "Espanha", grupoId: "C", continente: "UEFA", rankingFifa: 8, titulos: 1, corPrimaria: "#C60B1E", corSecundaria: "#FFC400" },
    { nome: "Senegal", grupoId: "C", continente: "CAF", rankingFifa: 18, titulos: 0, corPrimaria: "#FFFFFF", corSecundaria: "#00853F" },
    { nome: "Coreia do Sul", grupoId: "C", continente: "AFC", rankingFifa: 27, titulos: 0, corPrimaria: "#C60C30", corSecundaria: "#003478" },
    { nome: "Portugal", grupoId: "D", continente: "UEFA", rankingFifa: 6, titulos: 0, corPrimaria: "#006600", corSecundaria: "#FF0000" },
    { nome: "Uruguai", grupoId: "D", continente: "CONMEBOL", rankingFifa: 11, titulos: 2, corPrimaria: "#003DA5", corSecundaria: "#FFFFFF" },
    { nome: "Nigéria", grupoId: "D", continente: "CAF", rankingFifa: 42, titulos: 0, corPrimaria: "#008751", corSecundaria: "#FFFFFF" },
    { nome: "Japão", grupoId: "D", continente: "AFC", rankingFifa: 17, titulos: 0, corPrimaria: "#000080", corSecundaria: "#FFFFFF" },
    { nome: "Países Baixos", grupoId: "E", continente: "UEFA", rankingFifa: 7, titulos: 0, corPrimaria: "#FF6600", corSecundaria: "#FFFFFF" },
    { nome: "Croácia", grupoId: "E", continente: "UEFA", rankingFifa: 9, titulos: 0, corPrimaria: "#FFFFFF", corSecundaria: "#C8102E" },
    { nome: "Egito", grupoId: "E", continente: "CAF", rankingFifa: 35, titulos: 0, corPrimaria: "#C8102E", corSecundaria: "#000000" },
    { nome: "Irã", grupoId: "E", continente: "AFC", rankingFifa: 21, titulos: 0, corPrimaria: "#239F40", corSecundaria: "#FFFFFF" },
    { nome: "Bélgica", grupoId: "F", continente: "UEFA", rankingFifa: 10, titulos: 0, corPrimaria: "#E31837", corSecundaria: "#FFD700" },
    { nome: "Colômbia", grupoId: "F", continente: "CONMEBOL", rankingFifa: 14, titulos: 0, corPrimaria: "#FFD700", corSecundaria: "#003893" },
    { nome: "África do Sul", grupoId: "F", continente: "CAF", rankingFifa: 66, titulos: 0, corPrimaria: "#007A4D", corSecundaria: "#FFB612" },
    { nome: "Iraque", grupoId: "F", continente: "AFC", rankingFifa: 68, titulos: 0, corPrimaria: "#007A33", corSecundaria: "#CE1126" },
    { nome: "Itália", grupoId: "G", continente: "UEFA", rankingFifa: 13, titulos: 4, corPrimaria: "#008FD7", corSecundaria: "#FFFFFF" },
    { nome: "Equador", grupoId: "G", continente: "CONMEBOL", rankingFifa: 30, titulos: 0, corPrimaria: "#FFD100", corSecundaria: "#003893" },
    { nome: "Gana", grupoId: "G", continente: "CAF", rankingFifa: 59, titulos: 0, corPrimaria: "#CE1126", corSecundaria: "#006B3F" },
    { nome: "Uzbequistão", grupoId: "G", continente: "AFC", rankingFifa: 74, titulos: 0, corPrimaria: "#0066B4", corSecundaria: "#FFFFFF" },
    { nome: "Dinamarca", grupoId: "H", continente: "UEFA", rankingFifa: 15, titulos: 0, corPrimaria: "#C8102E", corSecundaria: "#FFFFFF" },
    { nome: "Chile", grupoId: "H", continente: "CONMEBOL", rankingFifa: 43, titulos: 0, corPrimaria: "#0039A6", corSecundaria: "#FFFFFF" },
    { nome: "Costa do Marfim", grupoId: "H", continente: "CAF", rankingFifa: 45, titulos: 0, corPrimaria: "#FF6B00", corSecundaria: "#009E60" },
    { nome: "Catar", grupoId: "H", continente: "AFC", rankingFifa: 55, titulos: 0, corPrimaria: "#8C1B40", corSecundaria: "#FFFFFF" },
    { nome: "Suíça", grupoId: "I", continente: "UEFA", rankingFifa: 16, titulos: 0, corPrimaria: "#FF0000", corSecundaria: "#FFFFFF" },
    { nome: "Peru", grupoId: "I", continente: "CONMEBOL", rankingFifa: 31, titulos: 0, corPrimaria: "#E10000", corSecundaria: "#FFFFFF" },
    { nome: "Tunísia", grupoId: "I", continente: "CAF", rankingFifa: 34, titulos: 0, corPrimaria: "#E70013", corSecundaria: "#FFFFFF" },
    { nome: "Emirados Árabes", grupoId: "I", continente: "AFC", rankingFifa: 70, titulos: 0, corPrimaria: "#00732F", corSecundaria: "#FFFFFF" },
    { nome: "Polônia", grupoId: "J", continente: "UEFA", rankingFifa: 25, titulos: 0, corPrimaria: "#DC143C", corSecundaria: "#FFFFFF" },
    { nome: "Paraguai", grupoId: "J", continente: "CONMEBOL", rankingFifa: 53, titulos: 0, corPrimaria: "#E00000", corSecundaria: "#FFFFFF" },
    { nome: "Argélia", grupoId: "J", continente: "CAF", rankingFifa: 32, titulos: 0, corPrimaria: "#006633", corSecundaria: "#FFFFFF" },
    { nome: "Jordânia", grupoId: "J", continente: "AFC", rankingFifa: 71, titulos: 0, corPrimaria: "#CE1126", corSecundaria: "#FFFFFF" },
    { nome: "Sérvia", grupoId: "K", continente: "UEFA", rankingFifa: 28, titulos: 0, corPrimaria: "#003893", corSecundaria: "#CE1126" },
    { nome: "Canadá", grupoId: "K", continente: "CONCACAF", rankingFifa: 48, titulos: 0, corPrimaria: "#FF0000", corSecundaria: "#FFFFFF" },
    { nome: "RD Congo", grupoId: "K", continente: "CAF", rankingFifa: 63, titulos: 0, corPrimaria: "#007FFF", corSecundaria: "#FFD700" },
    { nome: "Coreia do Norte", grupoId: "K", continente: "AFC", rankingFifa: 115, titulos: 0, corPrimaria: "#E31B23", corSecundaria: "#FFFFFF" },
    { nome: "México", grupoId: "L", continente: "CONCACAF", rankingFifa: 22, titulos: 0, corPrimaria: "#006847", corSecundaria: "#CE1126" },
    { nome: "Estados Unidos", grupoId: "L", continente: "CONCACAF", rankingFifa: 19, titulos: 0, corPrimaria: "#3C3B6E", corSecundaria: "#FFFFFF" },
    { nome: "Costa Rica", grupoId: "L", continente: "CONCACAF", rankingFifa: 50, titulos: 0, corPrimaria: "#002B7F", corSecundaria: "#CE1126" },
    { nome: "Panamá", grupoId: "L", continente: "CONCACAF", rankingFifa: 58, titulos: 0, corPrimaria: "#00529C", corSecundaria: "#CE1126" },
  ];

  for (const s of selecoesData) {
    await prisma.selecao.create({
      data: {
        ...s,
        tecnico: "A definir",
        bandeiraUrl: `https://flagcdn.com/w320/${s.nome.toLowerCase().replace(/[^a-z]/g, "")}.png`,
      },
    });
  }

  const todasSelecoes = await prisma.selecao.findMany({ orderBy: { id: "asc" } });

  const jogadoresData: { selecaoId: number; nome: string; posicao: string }[] = [
    { selecaoId: todasSelecoes[0].id, nome: "Vinícius Júnior", posicao: "Atacante" },
    { selecaoId: todasSelecoes[0].id, nome: "Rodrygo", posicao: "Atacante" },
    { selecaoId: todasSelecoes[0].id, nome: "Raphinha", posicao: "Atacante" },
    { selecaoId: todasSelecoes[0].id, nome: "Bruno Guimarães", posicao: "Meia" },
    { selecaoId: todasSelecoes[0].id, nome: "João Gomes", posicao: "Meia" },
    { selecaoId: todasSelecoes[0].id, nome: "Alisson", posicao: "Goleiro" },
    { selecaoId: todasSelecoes[1].id, nome: "Florian Wirtz", posicao: "Meia" },
    { selecaoId: todasSelecoes[1].id, nome: "Jamal Musiala", posicao: "Meia" },
    { selecaoId: todasSelecoes[1].id, nome: "Kai Havertz", posicao: "Atacante" },
    { selecaoId: todasSelecoes[1].id, nome: "Antonio Rüdiger", posicao: "Defensor" },
    { selecaoId: todasSelecoes[1].id, nome: "Marc-André ter Stegen", posicao: "Goleiro" },
    { selecaoId: todasSelecoes[2].id, nome: "André Onana", posicao: "Goleiro" },
    { selecaoId: todasSelecoes[2].id, nome: "Vincent Aboubakar", posicao: "Atacante" },
    { selecaoId: todasSelecoes[3].id, nome: "Salem Al-Dawsari", posicao: "Atacante" },
    { selecaoId: todasSelecoes[3].id, nome: "Firas Al-Buraikan", posicao: "Atacante" },
    { selecaoId: todasSelecoes[4].id, nome: "Lionel Messi", posicao: "Atacante" },
    { selecaoId: todasSelecoes[4].id, nome: "Enzo Fernández", posicao: "Meia" },
    { selecaoId: todasSelecoes[4].id, nome: "Julián Álvarez", posicao: "Atacante" },
    { selecaoId: todasSelecoes[4].id, nome: "Emiliano Martínez", posicao: "Goleiro" },
    { selecaoId: todasSelecoes[4].id, nome: "Nicolás Otamendi", posicao: "Defensor" },
    { selecaoId: todasSelecoes[5].id, nome: "Kylian Mbappé", posicao: "Atacante" },
    { selecaoId: todasSelecoes[5].id, nome: "Eduardo Camavinga", posicao: "Meia" },
    { selecaoId: todasSelecoes[5].id, nome: "Dayot Upamecano", posicao: "Defensor" },
    { selecaoId: todasSelecoes[5].id, nome: "Mike Maignan", posicao: "Goleiro" },
    { selecaoId: todasSelecoes[5].id, nome: "William Saliba", posicao: "Defensor" },
    { selecaoId: todasSelecoes[6].id, nome: "Achraf Hakimi", posicao: "Defensor" },
    { selecaoId: todasSelecoes[6].id, nome: "Youssef En-Nesyri", posicao: "Atacante" },
    { selecaoId: todasSelecoes[6].id, nome: "Sofyan Amrabat", posicao: "Meia" },
    { selecaoId: todasSelecoes[7].id, nome: "Mathew Ryan", posicao: "Goleiro" },
    { selecaoId: todasSelecoes[7].id, nome: "Mitchell Duke", posicao: "Atacante" },
    { selecaoId: todasSelecoes[8].id, nome: "Harry Kane", posicao: "Atacante" },
    { selecaoId: todasSelecoes[8].id, nome: "Jude Bellingham", posicao: "Meia" },
    { selecaoId: todasSelecoes[8].id, nome: "Declan Rice", posicao: "Meia" },
    { selecaoId: todasSelecoes[8].id, nome: "Bukayo Saka", posicao: "Atacante" },
    { selecaoId: todasSelecoes[8].id, nome: "Jordan Pickford", posicao: "Goleiro" },
    { selecaoId: todasSelecoes[9].id, nome: "Lamine Yamal", posicao: "Atacante" },
    { selecaoId: todasSelecoes[9].id, nome: "Pedri", posicao: "Meia" },
    { selecaoId: todasSelecoes[9].id, nome: "Rodri", posicao: "Meia" },
    { selecaoId: todasSelecoes[9].id, nome: "Unai Simón", posicao: "Goleiro" },
    { selecaoId: todasSelecoes[9].id, nome: "Dani Carvajal", posicao: "Defensor" },
    { selecaoId: todasSelecoes[10].id, nome: "Sadio Mané", posicao: "Atacante" },
    { selecaoId: todasSelecoes[10].id, nome: "Kalidou Koulibaly", posicao: "Defensor" },
    { selecaoId: todasSelecoes[11].id, nome: "Son Heung-min", posicao: "Atacante" },
    { selecaoId: todasSelecoes[11].id, nome: "Kim Min-jae", posicao: "Defensor" },
    { selecaoId: todasSelecoes[12].id, nome: "Cristiano Ronaldo", posicao: "Atacante" },
    { selecaoId: todasSelecoes[12].id, nome: "Bruno Fernandes", posicao: "Meia" },
    { selecaoId: todasSelecoes[12].id, nome: "Bernardo Silva", posicao: "Meia" },
    { selecaoId: todasSelecoes[12].id, nome: "Rúben Dias", posicao: "Defensor" },
    { selecaoId: todasSelecoes[12].id, nome: "Diogo Costa", posicao: "Goleiro" },
    { selecaoId: todasSelecoes[13].id, nome: "Federico Valverde", posicao: "Meia" },
    { selecaoId: todasSelecoes[13].id, nome: "Darwin Núñez", posicao: "Atacante" },
    { selecaoId: todasSelecoes[13].id, nome: "Ronald Araújo", posicao: "Defensor" },
    { selecaoId: todasSelecoes[14].id, nome: "Victor Osimhen", posicao: "Atacante" },
    { selecaoId: todasSelecoes[14].id, nome: "Wilfred Ndidi", posicao: "Meia" },
    { selecaoId: todasSelecoes[15].id, nome: "Takefusa Kubo", posicao: "Atacante" },
    { selecaoId: todasSelecoes[15].id, nome: "Wataru Endo", posicao: "Meia" },
    { selecaoId: todasSelecoes[16].id, nome: "Virgil van Dijk", posicao: "Defensor" },
    { selecaoId: todasSelecoes[16].id, nome: "Frenkie de Jong", posicao: "Meia" },
    { selecaoId: todasSelecoes[16].id, nome: "Memphis Depay", posicao: "Atacante" },
    { selecaoId: todasSelecoes[17].id, nome: "Luka Modrić", posicao: "Meia" },
    { selecaoId: todasSelecoes[17].id, nome: "Joško Gvardiol", posicao: "Defensor" },
    { selecaoId: todasSelecoes[17].id, nome: "Andrej Kramarić", posicao: "Atacante" },
    { selecaoId: todasSelecoes[18].id, nome: "Mohamed Salah", posicao: "Atacante" },
    { selecaoId: todasSelecoes[18].id, nome: "Mahmoud Trezeguet", posicao: "Meia" },
    { selecaoId: todasSelecoes[19].id, nome: "Mehdi Taremi", posicao: "Atacante" },
    { selecaoId: todasSelecoes[19].id, nome: "Sardar Azmoun", posicao: "Atacante" },
    { selecaoId: todasSelecoes[20].id, nome: "Kevin De Bruyne", posicao: "Meia" },
    { selecaoId: todasSelecoes[20].id, nome: "Romelu Lukaku", posicao: "Atacante" },
    { selecaoId: todasSelecoes[20].id, nome: "Thibaut Courtois", posicao: "Goleiro" },
    { selecaoId: todasSelecoes[21].id, nome: "Luis Díaz", posicao: "Atacante" },
    { selecaoId: todasSelecoes[21].id, nome: "James Rodríguez", posicao: "Meia" },
    { selecaoId: todasSelecoes[21].id, nome: "Rafael Santos Borré", posicao: "Atacante" },
    { selecaoId: todasSelecoes[22].id, nome: "Percy Tau", posicao: "Atacante" },
    { selecaoId: todasSelecoes[22].id, nome: "Ronwen Williams", posicao: "Goleiro" },
    { selecaoId: todasSelecoes[23].id, nome: "Ali Adnan", posicao: "Defensor" },
    { selecaoId: todasSelecoes[23].id, nome: "Aymen Hussein", posicao: "Atacante" },
    { selecaoId: todasSelecoes[24].id, nome: "Federico Chiesa", posicao: "Atacante" },
    { selecaoId: todasSelecoes[24].id, nome: "Gianluigi Donnarumma", posicao: "Goleiro" },
    { selecaoId: todasSelecoes[24].id, nome: "Nicolò Barella", posicao: "Meia" },
    { selecaoId: todasSelecoes[25].id, nome: "Enner Valencia", posicao: "Atacante" },
    { selecaoId: todasSelecoes[25].id, nome: "Pervis Estupiñán", posicao: "Defensor" },
    { selecaoId: todasSelecoes[26].id, nome: "Mohammed Kudus", posicao: "Meia" },
    { selecaoId: todasSelecoes[26].id, nome: "Thomas Partey", posicao: "Meia" },
    { selecaoId: todasSelecoes[27].id, nome: "Odiljon Hamrobekov", posicao: "Meia" },
    { selecaoId: todasSelecoes[27].id, nome: "Eldor Shomurodov", posicao: "Atacante" },
    { selecaoId: todasSelecoes[28].id, nome: "Christian Eriksen", posicao: "Meia" },
    { selecaoId: todasSelecoes[28].id, nome: "Rasmus Højlund", posicao: "Atacante" },
    { selecaoId: todasSelecoes[29].id, nome: "Alexis Sánchez", posicao: "Atacante" },
    { selecaoId: todasSelecoes[29].id, nome: "Eduardo Vargas", posicao: "Atacante" },
    { selecaoId: todasSelecoes[30].id, nome: "Sébastien Haller", posicao: "Atacante" },
    { selecaoId: todasSelecoes[30].id, nome: "Franck Kessié", posicao: "Meia" },
    { selecaoId: todasSelecoes[31].id, nome: "Akram Afif", posicao: "Atacante" },
    { selecaoId: todasSelecoes[31].id, nome: "Almoez Ali", posicao: "Atacante" },
    { selecaoId: todasSelecoes[32].id, nome: "Granit Xhaka", posicao: "Meia" },
    { selecaoId: todasSelecoes[32].id, nome: "Breel Embolo", posicao: "Atacante" },
    { selecaoId: todasSelecoes[33].id, nome: "Gianluca Lapadula", posicao: "Atacante" },
    { selecaoId: todasSelecoes[33].id, nome: "Renato Tapia", posicao: "Meia" },
    { selecaoId: todasSelecoes[34].id, nome: "Ellyes Skhiri", posicao: "Meia" },
    { selecaoId: todasSelecoes[34].id, nome: "Wahbi Khazri", posicao: "Atacante" },
    { selecaoId: todasSelecoes[35].id, nome: "Ali Mabkhout", posicao: "Atacante" },
    { selecaoId: todasSelecoes[35].id, nome: "Caio Canedo", posicao: "Atacante" },
    { selecaoId: todasSelecoes[36].id, nome: "Robert Lewandowski", posicao: "Atacante" },
    { selecaoId: todasSelecoes[36].id, nome: "Piotr Zieliński", posicao: "Meia" },
    { selecaoId: todasSelecoes[37].id, nome: "Miguel Almirón", posicao: "Meia" },
    { selecaoId: todasSelecoes[37].id, nome: "Antony Silva", posicao: "Goleiro" },
    { selecaoId: todasSelecoes[38].id, nome: "Riyad Mahrez", posicao: "Atacante" },
    { selecaoId: todasSelecoes[38].id, nome: "Islam Slimani", posicao: "Atacante" },
    { selecaoId: todasSelecoes[39].id, nome: "Mousa Al-Tamari", posicao: "Atacante" },
    { selecaoId: todasSelecoes[39].id, nome: "Yazan Al-Naimat", posicao: "Atacante" },
    { selecaoId: todasSelecoes[40].id, nome: "Dušan Vlahović", posicao: "Atacante" },
    { selecaoId: todasSelecoes[40].id, nome: "Sergej Milinković-Savić", posicao: "Meia" },
    { selecaoId: todasSelecoes[41].id, nome: "Alphonso Davies", posicao: "Defensor" },
    { selecaoId: todasSelecoes[41].id, nome: "Jonathan David", posicao: "Atacante" },
    { selecaoId: todasSelecoes[42].id, nome: "Yoane Wissa", posicao: "Atacante" },
    { selecaoId: todasSelecoes[42].id, nome: "Chancel Mbemba", posicao: "Defensor" },
    { selecaoId: todasSelecoes[43].id, nome: "Han Kwang-song", posicao: "Atacante" },
    { selecaoId: todasSelecoes[43].id, nome: "Ri Yong-jik", posicao: "Meia" },
    { selecaoId: todasSelecoes[44].id, nome: "Raúl Jiménez", posicao: "Atacante" },
    { selecaoId: todasSelecoes[44].id, nome: "Guillermo Ochoa", posicao: "Goleiro" },
    { selecaoId: todasSelecoes[44].id, nome: "Edson Álvarez", posicao: "Meia" },
    { selecaoId: todasSelecoes[45].id, nome: "Christian Pulisic", posicao: "Meia" },
    { selecaoId: todasSelecoes[45].id, nome: "Weston McKennie", posicao: "Meia" },
    { selecaoId: todasSelecoes[45].id, nome: "Gio Reyna", posicao: "Meia" },
    { selecaoId: todasSelecoes[45].id, nome: "Matt Turner", posicao: "Goleiro" },
    { selecaoId: todasSelecoes[45].id, nome: "Tyler Adams", posicao: "Meia" },
    { selecaoId: todasSelecoes[46].id, nome: "Keylor Navas", posicao: "Goleiro" },
    { selecaoId: todasSelecoes[46].id, nome: "Joel Campbell", posicao: "Atacante" },
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
  const fases = ["GRUPOS", "OITAVAS", "QUARTAS", "SEMI", "TERCEIRO", "FINAL"];
  const datasBase = new Date("2026-06-11");

  let partidaIndex = 0;
  for (const grupo of grupos) {
    const selecoesDoGrupo = todasSelecoes.filter((s) => s.grupoId === grupo.id);
    if (selecoesDoGrupo.length < 4) continue;

    for (let i = 0; i < 4; i++) {
      for (let j = i + 1; j < 4; j++) {
        const data = new Date(datasBase);
        data.setDate(data.getDate() + Math.floor(partidaIndex / 3));
        const estadio = estadios[partidaIndex % estadios.length];

        await prisma.partida.create({
          data: {
            fase: "GRUPOS",
            grupoId: grupo.id,
            selecaoMandanteId: selecoesDoGrupo[i].id,
            selecaoVisitanteId: selecoesDoGrupo[j].id,
            dataHora: data,
            estadioId: estadio.id,
            encerrada: false,
          },
        });
        partidaIndex++;
      }
    }
  }

  console.log("Criando partidas eliminatórias...");
  const semiFinalDate = new Date("2026-07-08");
  const terceiroDate = new Date("2026-07-11");
  const finalDate = new Date("2026-07-12");

  if (todasSelecoes.length >= 4) {
    await prisma.partida.create({
      data: { fase: "SEMI", selecaoMandanteId: todasSelecoes[0].id, selecaoVisitanteId: todasSelecoes[1].id, dataHora: semiFinalDate, estadioId: estadios[0].id, encerrada: false },
    });
    await prisma.partida.create({
      data: { fase: "SEMI", selecaoMandanteId: todasSelecoes[2].id, selecaoVisitanteId: todasSelecoes[3].id, dataHora: semiFinalDate, estadioId: estadios[1].id, encerrada: false },
    });
    await prisma.partida.create({
      data: { fase: "TERCEIRO", selecaoMandanteId: todasSelecoes[0].id, selecaoVisitanteId: todasSelecoes[2].id, dataHora: terceiroDate, estadioId: estadios[2].id, encerrada: false },
    });
    await prisma.partida.create({
      data: { fase: "FINAL", selecaoMandanteId: todasSelecoes[1].id, selecaoVisitanteId: todasSelecoes[3].id, dataHora: finalDate, estadioId: estadios[0].id, encerrada: false },
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
