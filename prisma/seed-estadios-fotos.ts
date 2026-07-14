import { prisma } from "./lib";

const updates: Record<string, { capa: string; galeria: string[] }> = {
  "Estádio de Nova York/Nova Jersey": {
    capa: "/images/estadios/metlife.jpg",
    galeria: [
      "/images/estadios/metlife.jpg",
      "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?q=80&w=1920",
      "https://images.unsplash.com/photo-1518605368461-1e1e38ceee4b?q=80&w=1920",
    ],
  },
  "Estádio de Los Angeles": {
    capa: "/images/estadios/sofi.jpg",
    galeria: [
      "/images/estadios/sofi.jpg",
      "https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=1920",
      "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=1920",
    ],
  },
  "Estádio de Dallas": {
    capa: "/images/estadios/att-stadium.jpeg",
    galeria: [
      "/images/estadios/att-stadium.jpeg",
      "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?q=80&w=1920",
    ],
  },
  "Estádio de Houston": {
    capa: "/images/estadios/nrg-stadium.jpg",
    galeria: [
      "/images/estadios/nrg-stadium.jpg",
      "https://images.unsplash.com/photo-1518605368461-1e1e38ceee4b?q=80&w=1920",
    ],
  },
  "Estádio de Atlanta": {
    capa: "/images/estadios/mercedes-benz.jpg",
    galeria: [
      "/images/estadios/mercedes-benz.jpg",
      "https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=1920",
    ],
  },
  "Estádio da Baía de São Francisco": {
    capa: "/images/estadios/levis-stadium.jpg",
    galeria: [
      "/images/estadios/levis-stadium.jpg",
      "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=1920",
    ],
  },
  "Estádio de Filadélfia": {
    capa: "/images/estadios/lincoln-financial.jpg",
    galeria: [
      "/images/estadios/lincoln-financial.jpg",
      "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?q=80&w=1920",
    ],
  },
  "Estádio de Seattle": {
    capa: "/images/estadios/lumen-field.jpg",
    galeria: [
      "/images/estadios/lumen-field.jpg",
      "https://images.unsplash.com/photo-1518605368461-1e1e38ceee4b?q=80&w=1920",
    ],
  },
  "Estádio de Boston": {
    capa: "/images/estadios/gillette-stadium.jpg",
    galeria: [
      "/images/estadios/gillette-stadium.jpg",
      "https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=1920",
    ],
  },
  "Estádio de Kansas City": {
    capa: "/images/estadios/arrowhead.jpg",
    galeria: [
      "/images/estadios/arrowhead.jpg",
      "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=1920",
    ],
  },
  "Estádio de Miami": {
    capa: "/images/estadios/hard-rock.jpg",
    galeria: [
      "/images/estadios/hard-rock.jpg",
      "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?q=80&w=1920",
    ],
  },
  "Estádio da Cidade do México": {
    capa: "/images/estadios/estadio-azteca.jpg",
    galeria: [
      "/images/estadios/estadio-azteca.jpg",
      "https://images.unsplash.com/photo-1518605368461-1e1e38ceee4b?q=80&w=1920",
    ],
  },
  "Estádio de Monterrey": {
    capa: "/images/estadios/estadio-bbva.jpg",
    galeria: [
      "/images/estadios/estadio-bbva.jpg",
      "https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=1920",
    ],
  },
  "Estádio de Guadalajara": {
    capa: "/images/estadios/estadio-omnilife.jpg",
    galeria: [
      "/images/estadios/estadio-omnilife.jpg",
      "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=1920",
    ],
  },
  "BC Place de Vancouver": {
    capa: "/images/estadios/bc-place.jpeg",
    galeria: [
      "/images/estadios/bc-place.jpeg",
      "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?q=80&w=1920",
    ],
  },
  "Estádio de Toronto": {
    capa: "/images/estadios/bmo-field.jpg",
    galeria: [
      "/images/estadios/bmo-field.jpg",
      "https://images.unsplash.com/photo-1518605368461-1e1e38ceee4b?q=80&w=1920",
    ],
  },
};

export async function main() {
  console.log("=== Seed de Fotos dos Estádios ===");
  for (const [nome, dados] of Object.entries(updates)) {
    const estadio = await prisma.estadio.findFirst({ where: { nome } });
    if (!estadio) {
      console.log(`Não encontrado: ${nome}`);
      continue;
    }
    await prisma.estadio.update({
      where: { id: estadio.id },
      data: { fotoUrl: dados.capa, galeria: dados.galeria },
    });
    console.log(`✔ ${nome}`);
  }
  console.log("Concluído!");
}

// executed from seed.ts
