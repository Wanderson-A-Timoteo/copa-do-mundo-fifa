"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { IconMapPin, IconUser } from "@/components/Icons";

interface EstadioCard {
  id: number;
  slug: string;
  nome: string;
  cidade: string;
  pais: string;
  capacidade: number;
  fotoUrl: string | null;
}

interface EstadiosGridProps {
  paises: string[];
  estadios: EstadioCard[];
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { stiffness: 300, damping: 24 } },
};

export default function EstadiosGrid({ paises, estadios }: EstadiosGridProps) {
  return (
    <>
      {paises.map((pais) => {
        const estadiosDoPais = estadios.filter((e) => e.pais === pais);
        if (estadiosDoPais.length === 0) return null;
        return (
          <section key={pais} className="mt-10">
            <h2 className="mb-4 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {pais}
            </h2>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {estadiosDoPais.map((e) => (
                <motion.div key={e.id} variants={itemVariants}>
                  <Link
                    href={`/estadios/${e.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-500 dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                  >
                    <div className="relative h-48 w-full overflow-hidden">
                      {e.fotoUrl ? (
                        <Image
                          src={e.fotoUrl}
                          alt={e.nome}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          unoptimized
                          priority
                        />
                      ) : (
                        <div className="absolute inset-0 bg-zinc-100 dark:bg-zinc-800" />
                      )}

                      {/* Gradient Overlay for modern look */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                      <div className="absolute right-3 top-3 rounded-full bg-zinc-900/60 px-3 py-1 text-xs font-semibold text-zinc-50 backdrop-blur-md">
                        {e.capacidade.toLocaleString("pt-BR")}
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col justify-between p-5">
                      <div>
                        <h3 className="text-lg font-bold text-zinc-800 transition-colors group-hover:text-emerald-600 dark:text-zinc-100 dark:group-hover:text-emerald-400">
                          {e.nome}
                        </h3>
                        <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                          <IconMapPin className="h-4 w-4 shrink-0" />
                          <span className="truncate">
                            {e.cidade}, {e.pais}
                          </span>
                        </p>
                      </div>

                      <div className="mt-4 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-zinc-400">
                        <IconUser className="h-4 w-4" />
                        <span>Ver detalhes &rarr;</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </section>
        );
      })}
    </>
  );
}
