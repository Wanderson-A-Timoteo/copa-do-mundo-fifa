import * as fs from "node:fs";
import * as path from "node:path";

const DIR = "public/images/estadios";

interface Imagem {
  slug: string;
  ext: string;
  url: string;
}

const imagens: Imagem[] = [
  { slug: "metlife", ext: "jpg", url: "https://upload.wikimedia.org/wikipedia/commons/0/04/Metlife_stadium_(Aerial_view).jpg" },
  { slug: "sofi", ext: "jpg", url: "https://upload.wikimedia.org/wikipedia/commons/5/5a/SoFi_Stadium.jpg" },
  { slug: "att-stadium", ext: "jpeg", url: "https://upload.wikimedia.org/wikipedia/commons/3/37/AT%26T_Stadium%2C_Dallas%2C_US_ESA23242341.jpeg" },
  { slug: "nrg-stadium", ext: "jpg", url: "https://upload.wikimedia.org/wikipedia/commons/3/36/Reliant_Stadium_Aerial.JPG" },
  { slug: "mercedes-benz", ext: "jpg", url: "https://images.unsplash.com/photo-1526490025555-53f98769ce26?fm=jpg&q=80&w=1920" },
  { slug: "levis-stadium", ext: "jpg", url: "https://upload.wikimedia.org/wikipedia/commons/f/f0/Levi%27s_Stadium_from_parking_lot.jpg" },
  { slug: "lincoln-financial", ext: "jpg", url: "https://upload.wikimedia.org/wikipedia/commons/a/a1/Lincoln_Financial_Field_(Aerial_view).jpg" },
  { slug: "lumen-field", ext: "jpg", url: "https://upload.wikimedia.org/wikipedia/commons/e/ec/CenturyLink_Field_Seattle_WA.jpg" },
  { slug: "gillette-stadium", ext: "jpg", url: "https://images.unsplash.com/photo-1767584413129-2ad2941b7e46?fm=jpg&q=80&w=1920" },
  { slug: "arrowhead", ext: "jpg", url: "https://upload.wikimedia.org/wikipedia/commons/a/ac/Aerial_view_of_Arrowhead_Stadium_08-31-2013.jpg" },
  { slug: "hard-rock", ext: "jpg", url: "https://images.unsplash.com/photo-1751232576230-e065bfa42aaf?fm=jpg&q=80&w=1920" },
  { slug: "estadio-bbva", ext: "jpg", url: "https://upload.wikimedia.org/wikipedia/commons/f/f9/Estadio_BBVA.jpg" },
  { slug: "bmo-field", ext: "jpg", url: "https://upload.wikimedia.org/wikipedia/commons/9/93/BMO_Field%2C_Toronto%2C_Ontario_(29969149766).jpg" },
];

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function baixar(img: Imagem, tentativa = 1): Promise<boolean> {
  const dest = path.join(DIR, `${img.slug}.${img.ext}`);
  if (fs.existsSync(dest)) {
    console.log(`⏭ ${img.slug}.${img.ext} — já existe`);
    return true;
  }
  try {
    const resp = await fetch(img.url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Copa2026Download/2.0; +https://copa-do-mundo-fifa.vercel.app)",
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      },
    });
    if (!resp.ok) {
      const msg = `${img.slug}: HTTP ${resp.status} ${resp.statusText}`;
      if ((resp.status === 429 || resp.status >= 500) && tentativa < 3) {
        const espera = 4000 * tentativa;
        console.log(`⚠ ${msg} — tentativa ${tentativa}/3, esperando ${espera}ms...`);
        await delay(espera);
        return baixar(img, tentativa + 1);
      }
      throw new Error(msg);
    }
    const buffer = Buffer.from(await resp.arrayBuffer());
    fs.writeFileSync(dest, buffer);
    console.log(`✔ ${img.slug}.${img.ext} (${(buffer.length / 1024).toFixed(1)} KB)`);
    return true;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (tentativa < 3) {
      const espera = 4000 * tentativa;
      console.log(`⚠ ${img.slug}: ${msg} — tentativa ${tentativa}/3, esperando ${espera}ms...`);
      await delay(espera);
      return baixar(img, tentativa + 1);
    }
    console.error(`✘ ${img.slug}: ${msg}`);
    return false;
  }
}

async function main() {
  fs.mkdirSync(DIR, { recursive: true });
  for (const img of imagens) {
    await baixar(img);
    await delay(4000);
  }
  console.log("Concluído!");
}

main();
