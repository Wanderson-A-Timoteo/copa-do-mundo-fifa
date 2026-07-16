import { prisma } from "@/lib/prisma";
import EstadiosGrid from "@/components/estadios/EstadiosGrid";

export const dynamic = "force-dynamic";

export default async function EstadiosPage() {
  const estadios = await prisma.estadio.findMany({
    orderBy: { nome: "asc" },
    select: {
      id: true,
      slug: true,
      nome: true,
      cidade: true,
      pais: true,
      capacidade: true,
      fotoUrl: true,
    },
  });

  const paises = ["Estados Unidos", "México", "Canadá"];

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <h1 className="text-3xl font-bold">Estádios</h1>
      <p className="mt-1 text-zinc-500">As 16 sedes da Copa do Mundo 2026</p>

      <EstadiosGrid paises={paises} estadios={estadios} />
    </main>
  );
}
