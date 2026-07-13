import { prisma } from "./lib";

const fotos: Record<string, string> = {
  "Estádio de Nova York/Nova Jersey":
    "https://upload.wikimedia.org/wikipedia/commons/f/fb/Metlife_stadium_%28Aerial_view%29.jpg",
  "Estádio de Los Angeles":
    "https://upload.wikimedia.org/wikipedia/commons/5/5e/Aerial_view_of_SoFi_Stadium_%28July_2022%29.jpg",
  "Estádio de Dallas":
    "https://upload.wikimedia.org/wikipedia/commons/3/37/AT%26T_Stadium%2C_Dallas%2C_US_ESA23242341.jpeg",
  "Estádio de Houston":
    "https://upload.wikimedia.org/wikipedia/commons/3/36/Reliant_Stadium_Aerial.JPG",
  "Estádio de Atlanta":
    "https://upload.wikimedia.org/wikipedia/commons/4/4f/Mercedes-Benz_Stadium_with_the_Georgia_Dome_remains_in_the_foreground_%2827663350329%29.jpg",
  "Estádio da Baía de São Francisco":
    "https://upload.wikimedia.org/wikipedia/commons/f/f0/Levi%27s_Stadium_from_parking_lot.jpg",
  "Estádio de Filadélfia":
    "https://upload.wikimedia.org/wikipedia/commons/7/70/Lincoln_Financial_Field.jpg",
  "Estádio de Seattle":
    "https://upload.wikimedia.org/wikipedia/commons/e/ec/CenturyLink_Field_Seattle_WA.jpg",
  "Estádio de Boston":
    "https://upload.wikimedia.org/wikipedia/commons/7/79/Gillette_Stadium_%28Top_View%29.jpg",
  "Estádio de Kansas City":
    "https://upload.wikimedia.org/wikipedia/commons/a/ac/Aerial_view_of_Arrowhead_Stadium_08-31-2013.jpg",
  "Estádio de Miami": "https://upload.wikimedia.org/wikipedia/commons/9/94/Hard_Rock_Stadium.jpg",
  "Estádio da Cidade do México":
    "https://upload.wikimedia.org/wikipedia/commons/6/65/Estadio_azteca.jpg",
  "Estádio de Monterrey": "https://upload.wikimedia.org/wikipedia/commons/f/f9/Estadio_BBVA.jpg",
  "Estádio de Guadalajara":
    "https://upload.wikimedia.org/wikipedia/commons/8/8b/Estadio_Omnilife_Chivas.jpg",
  "BC Place de Vancouver":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/BC_Place_aerial_view_2024.jpg/1280px-BC_Place_aerial_view_2024.jpg",
  "Estádio de Toronto":
    "https://upload.wikimedia.org/wikipedia/commons/9/93/BMO_Field%2C_Toronto%2C_Ontario_%2829969149766%29.jpg",
};

export async function main() {
  console.log("=== Seed de Fotos dos Estádios ===");

  for (const [nome, fotoUrl] of Object.entries(fotos)) {
    const estadio = await prisma.estadio.findFirst({ where: { nome } });
    if (!estadio) {
      console.log(`Estádio não encontrado: ${nome}`);
      continue;
    }
    await prisma.estadio.update({
      where: { id: estadio.id },
      data: { fotoUrl },
    });
    console.log(`  ✔ ${nome}`);
  }
  console.log("Seed de fotos concluído!");
}

// executed from seed.ts
