"use client";

import { useEffect, useState } from "react";
import NavHeader from "@/components/NavHeader";

interface Estadio {
  id: number;
  nome: string;
  cidade: string;
  pais: string;
  capacidade: number;
}

export default function EstadiosPage() {
  const [estadios, setEstadios] = useState<Estadio[]>([]);

  useEffect(() => {
    fetch("/api/estadios")
      .then((r) => r.json())
      .then((d) => setEstadios(d.estadios));
  }, []);

  const paises = ["Estados Unidos", "México", "Canadá"];

  return (
    <div className="min-h-screen">
      <NavHeader />
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
                  <div
                    key={e.id}
                    className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800"
                  >
                    <h3 className="text-lg font-semibold">{e.nome}</h3>
                    <p className="text-sm text-zinc-500">
                      {e.cidade}, {e.pais}
                    </p>
                    <p className="mt-2 text-sm">
                      <span className="font-bold">
                        {e.capacidade.toLocaleString()}
                      </span>{" "}
                      lugares
                    </p>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}
