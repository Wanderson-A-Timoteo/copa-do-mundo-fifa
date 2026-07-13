import * as fs from "node:fs";
import * as path from "node:path";

const DIR = "public/images/estadios";

interface Imagem {
  slug: string;
  url: string;
}

const imagens: Imagem[] = [
  {
    slug: "metlife",
    url: "https://upload.wikimedia.org/wikipedia/commons/f/fb/Metlife_stadium_(Aerial_view).jpg",
  },
  {
    slug: "sofi",
    url: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Aerial_view_of_SoFi_Stadium_(July_2022).jpg",
  },
  {
    slug: "att-stadium",
    url: "https://upload.wikimedia.org/wikipedia/commons/3/37/AT%26T_Stadium%2C_Dallas%2C_US_ESA23242341.jpeg",
  },
  { slug: "nrg-stadium", url: "https://cdn.loc.gov/service/pnp/highsm/27900/27977r.jpg" },
  { slug: "mercedes-benz", url: "https://cdn.loc.gov/service/pnp/highsm/46700/46731r.jpg" },
  {
    slug: "levis-stadium",
    url: "https://upload.wikimedia.org/wikipedia/commons/f/f0/Levi%27s_Stadium_from_parking_lot.jpg",
  },
  {
    slug: "lincoln-financial",
    url: "https://upload.wikimedia.org/wikipedia/commons/7/70/Lincoln_Financial_Field.jpg",
  },
  {
    slug: "lumen-field",
    url: "https://upload.wikimedia.org/wikipedia/commons/e/ec/CenturyLink_Field_Seattle_WA.jpg",
  },
  {
    slug: "gillette-stadium",
    url: "https://upload.wikimedia.org/wikipedia/commons/7/79/Gillette_Stadium_(Top_View).jpg",
  },
  {
    slug: "arrowhead",
    url: "https://upload.wikimedia.org/wikipedia/commons/a/ac/Aerial_view_of_Arrowhead_Stadium_08-31-2013.jpg",
  },
  {
    slug: "hard-rock",
    url: "https://upload.wikimedia.org/wikipedia/commons/9/94/Hard_Rock_Stadium.jpg",
  },
  {
    slug: "estadio-azteca",
    url: "https://upload.wikimedia.org/wikipedia/commons/6/65/Estadio_azteca.jpg",
  },
  {
    slug: "estadio-bbva",
    url: "https://upload.wikimedia.org/wikipedia/commons/f/f9/Estadio_BBVA.jpg",
  },
  {
    slug: "estadio-omnilife",
    url: "https://upload.wikimedia.org/wikipedia/commons/8/8b/Estadio_Omnilife_Chivas.jpg",
  },
  { slug: "bc-place", url: "https://images.pexels.com/photos/32864204/pexels-photo-32864204.jpeg" },
  {
    slug: "bmo-field",
    url: "https://upload.wikimedia.org/wikipedia/commons/9/93/BMO_Field%2C_Toronto%2C_Ontario_(29969149766).jpg",
  },
];

function ext(url: string): string {
  const clean = url.split("?")[0].split("#")[0];
  const match = clean.match(/\.(jpe?g|png|gif|webp)$/i);
  return match ? match[1].toLowerCase() : "jpg";
}

async function baixar(img: Imagem): Promise<void> {
  const extName = ext(img.url);
  const dest = path.join(DIR, `${img.slug}.${extName}`);
  if (fs.existsSync(dest)) {
    console.log(`⏭ ${img.slug} — já existe`);
    return;
  }
  const resp = await fetch(img.url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; DownloadScript/1.0)" },
  });
  if (!resp.ok) throw new Error(`${img.slug}: HTTP ${resp.status} — ${resp.statusText}`);
  const buffer = Buffer.from(await resp.arrayBuffer());
  fs.writeFileSync(dest, buffer);
  console.log(`✔ ${img.slug}.${extName} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

async function main() {
  fs.mkdirSync(DIR, { recursive: true });
  for (const img of imagens) {
    try {
      await baixar(img);
    } catch (e) {
      console.error(`✘ ${img.slug}: ${e instanceof Error ? e.message : e}`);
    }
  }
  console.log("Concluído!");
}

main();
