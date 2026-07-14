import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.resolve(__dirname, "..", ".env") });

function toSlug(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

const url = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString: url });
const prisma = new PrismaClient({ adapter });

async function main() {
  const rows: { id: number; nome: string; fotoUrl: string | null }[] = await prisma.$queryRawUnsafe(
    `SELECT id, nome, "fotoUrl" FROM estadios ORDER BY id`,
  );

  console.log(
    "id  | nome                                  | slug (computado)                  | tipo    | fotoUrl",
  );
  console.log("-".repeat(160));

  for (const row of rows) {
    const slug = toSlug(row.nome);
    const tipo =
      row.fotoUrl && row.fotoUrl.startsWith("/images/")
        ? "LOCAL"
        : row.fotoUrl && row.fotoUrl.startsWith("http")
          ? "EXTERNA"
          : "NENHUMA";
    const fotoExib = row.fotoUrl ?? "(null)";
    console.log(
      `${String(row.id).padEnd(3)}| ${row.nome.padEnd(40)}| ${slug.padEnd(35)}| ${tipo.padEnd(7)} | ${fotoExib}`,
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
