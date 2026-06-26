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
    { nome: "Estádio de Nova York/Nova Jersey", cidade: "Nova Jersey", pais: "Estados Unidos", capacidade: 82500, latitude: 40.8135, longitude: -74.0745 },
    { nome: "Estádio de Los Angeles", cidade: "Los Angeles", pais: "Estados Unidos", capacidade: 70240, latitude: 33.9535, longitude: -118.3390 },
    { nome: "Estádio de Dallas", cidade: "Dallas", pais: "Estados Unidos", capacidade: 80000, latitude: 32.7474, longitude: -97.0925 },
    { nome: "Estádio de Houston", cidade: "Houston", pais: "Estados Unidos", capacidade: 72220, latitude: 29.6847, longitude: -95.4106 },
    { nome: "Estádio de Atlanta", cidade: "Atlanta", pais: "Estados Unidos", capacidade: 71000, latitude: 33.7555, longitude: -84.4010 },
    { nome: "Estádio da Baía de São Francisco", cidade: "Área da baía de São Francisco", pais: "Estados Unidos", capacidade: 68500, latitude: 37.4031, longitude: -121.9700 },
    { nome: "Estádio de Filadélfia", cidade: "Filadélfia", pais: "Estados Unidos", capacidade: 67594, latitude: 39.9008, longitude: -75.1675 },
    { nome: "Estádio de Seattle", cidade: "Seattle", pais: "Estados Unidos", capacidade: 68740, latitude: 47.5951, longitude: -122.3316 },
    { nome: "Estádio de Boston", cidade: "Boston", pais: "Estados Unidos", capacidade: 65878, latitude: 42.0909, longitude: -71.2643 },
    { nome: "Estádio de Kansas City", cidade: "Kansas City", pais: "Estados Unidos", capacidade: 76416, latitude: 39.0489, longitude: -94.4839 },
    { nome: "Estádio de Miami", cidade: "Miami", pais: "Estados Unidos", capacidade: 65326, latitude: 25.9580, longitude: -80.2389 },
    { nome: "Estádio da Cidade do México", cidade: "Cidade do México", pais: "México", capacidade: 87523, latitude: 19.3029, longitude: -99.1504 },
    { nome: "Estádio de Monterrey", cidade: "Monterrey", pais: "México", capacidade: 53500, latitude: 25.6700, longitude: -100.2444 },
    { nome: "Estádio de Guadalajara", cidade: "Guadalajara", pais: "México", capacidade: 49850, latitude: 20.6808, longitude: -103.4613 },
    { nome: "BC Place de Vancouver", cidade: "Vancouver", pais: "Canadá", capacidade: 54500, latitude: 49.2765, longitude: -123.1118 },
    { nome: "Estádio de Toronto", cidade: "Toronto", pais: "Canadá", capacidade: 30991, latitude: 43.6327, longitude: -79.4185 },
  ];

  const estadios = await Promise.all(
    estadiosData.map((e) => prisma.estadio.create({ data: e }))
  );

  console.log("Criando seleções...");
  const selecoesData = [
    { nome: "México", grupoId: "A", continente: "CONCACAF", rankingFifa: 22, titulos: 0, corPrimaria: "#006847", corSecundaria: "#CE1126" },
    { nome: "África do Sul", grupoId: "A", continente: "CAF", rankingFifa: 66, titulos: 0, corPrimaria: "#007A4D", corSecundaria: "#FFB612" },
    { nome: "República da Coreia", grupoId: "A", continente: "AFC", rankingFifa: 27, titulos: 0, corPrimaria: "#C60C30", corSecundaria: "#003478" },
    { nome: "Tchéquia", grupoId: "A", continente: "UEFA", rankingFifa: 36, titulos: 0, corPrimaria: "#D7141A", corSecundaria: "#FFFFFF" },
    { nome: "Suíça", grupoId: "B", continente: "UEFA", rankingFifa: 16, titulos: 0, corPrimaria: "#FF0000", corSecundaria: "#FFFFFF" },
    { nome: "Canadá", grupoId: "B", continente: "CONCACAF", rankingFifa: 48, titulos: 0, corPrimaria: "#FF0000", corSecundaria: "#FFFFFF" },
    { nome: "Bósnia e Herzegovina", grupoId: "B", continente: "UEFA", rankingFifa: 57, titulos: 0, corPrimaria: "#002395", corSecundaria: "#FFD700" },
    { nome: "Catar", grupoId: "B", continente: "AFC", rankingFifa: 55, titulos: 0, corPrimaria: "#8C1B40", corSecundaria: "#FFFFFF" },
    { nome: "Brasil", grupoId: "C", continente: "CONMEBOL", rankingFifa: 5, titulos: 5, corPrimaria: "#FFDF00", corSecundaria: "#009739" },
    { nome: "Marrocos", grupoId: "C", continente: "CAF", rankingFifa: 12, titulos: 0, corPrimaria: "#C1272D", corSecundaria: "#006233" },
    { nome: "Escócia", grupoId: "C", continente: "UEFA", rankingFifa: 39, titulos: 0, corPrimaria: "#003876", corSecundaria: "#FFFFFF" },
    { nome: "Haiti", grupoId: "C", continente: "CONCACAF", rankingFifa: 86, titulos: 0, corPrimaria: "#00209F", corSecundaria: "#D21034" },
    { nome: "EUA", grupoId: "D", continente: "CONCACAF", rankingFifa: 19, titulos: 0, corPrimaria: "#3C3B6E", corSecundaria: "#FFFFFF" },
    { nome: "Austrália", grupoId: "D", continente: "AFC", rankingFifa: 40, titulos: 0, corPrimaria: "#FFD700", corSecundaria: "#00843D" },
    { nome: "Paraguai", grupoId: "D", continente: "CONMEBOL", rankingFifa: 53, titulos: 0, corPrimaria: "#E00000", corSecundaria: "#FFFFFF" },
    { nome: "Turquia", grupoId: "D", continente: "UEFA", rankingFifa: 29, titulos: 0, corPrimaria: "#E30A17", corSecundaria: "#FFFFFF" },
    { nome: "Alemanha", grupoId: "E", continente: "UEFA", rankingFifa: 3, titulos: 4, corPrimaria: "#FFFFFF", corSecundaria: "#000000" },
    { nome: "Costa do Marfim", grupoId: "E", continente: "CAF", rankingFifa: 45, titulos: 0, corPrimaria: "#FF6B00", corSecundaria: "#009E60" },
    { nome: "Equador", grupoId: "E", continente: "CONMEBOL", rankingFifa: 30, titulos: 0, corPrimaria: "#FFD100", corSecundaria: "#003893" },
    { nome: "Curaçau", grupoId: "E", continente: "CONCACAF", rankingFifa: 90, titulos: 0, corPrimaria: "#003DA5", corSecundaria: "#FFFFFF" },
    { nome: "Holanda", grupoId: "F", continente: "UEFA", rankingFifa: 7, titulos: 0, corPrimaria: "#FF6600", corSecundaria: "#FFFFFF" },
    { nome: "Japão", grupoId: "F", continente: "AFC", rankingFifa: 17, titulos: 0, corPrimaria: "#000080", corSecundaria: "#FFFFFF" },
    { nome: "Suécia", grupoId: "F", continente: "UEFA", rankingFifa: 23, titulos: 0, corPrimaria: "#FFDA00", corSecundaria: "#005BAA" },
    { nome: "Tunísia", grupoId: "F", continente: "CAF", rankingFifa: 34, titulos: 0, corPrimaria: "#E70013", corSecundaria: "#FFFFFF" },
    { nome: "Egito", grupoId: "G", continente: "CAF", rankingFifa: 35, titulos: 0, corPrimaria: "#C8102E", corSecundaria: "#000000" },
    { nome: "RI do Irã", grupoId: "G", continente: "AFC", rankingFifa: 21, titulos: 0, corPrimaria: "#239F40", corSecundaria: "#FFFFFF" },
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
