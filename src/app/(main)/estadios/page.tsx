import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

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

      {paises.map((pais) => {
        const estadiosDoPais = estadios.filter((e) => e.pais === pais);
        if (estadiosDoPais.length === 0) return null;
        return (
          <section key={pais} className="mt-10">
            <h2 className="mb-4 text-xl font-bold">{pais}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {estadiosDoPais.map((e) => (
                <Link
                  key={e.id}
                  href={`/estadios/${e.slug}`}
                  className="block overflow-hidden rounded-xl border border-zinc-200 transition-shadow hover:shadow-md dark:border-zinc-800"
                >
                  {e.fotoUrl && (
                    <Image
                      src={e.fotoUrl}
                      alt={e.nome}
                      width={400}
                      height={192}
                      className="h-48 w-full object-cover"
                      unoptimized
                    />
                  )}
                  <div className="p-5">
                    <h3 className="text-lg font-semibold">{e.nome}</h3>
                    <p className="text-sm text-zinc-500">
                      {e.cidade}, {e.pais}
                    </p>
                    <p className="mt-2 text-sm">
                      <span className="font-bold">{e.capacidade.toLocaleString()}</span> lugares
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </main>
  );
}
