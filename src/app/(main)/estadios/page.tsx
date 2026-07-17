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
    <main className="mx-auto max-w-7xl overflow-x-clip px-6 py-8">
      <h1 className="mt-2 text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-300">
        Estádios
      </h1>
      <p className="mt-1 text-zinc-500">As 16 sedes da Copa do Mundo 2026</p>

      <div className="mt-6 flex flex-wrap gap-1.5 rounded-2xl bg-zinc-200/50 p-1.5 dark:bg-zinc-800/50 w-fit">
        {paises.map((pais) => (
          <a
            key={pais}
            href={`#${pais.toLowerCase().replace(/ /g, "-")}`}
            className="rounded-xl px-4 py-1.5 text-sm font-medium transition-all duration-300 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100/50 dark:hover:bg-zinc-700/50"
          >
            {pais}
          </a>
        ))}
      </div>

      <EstadiosGrid paises={paises} estadios={estadios} />
    </main>
  );
}
