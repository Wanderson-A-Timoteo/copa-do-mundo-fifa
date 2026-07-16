"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import ListaPartidas from "@/components/estadios/ListaPartidas";
import type { PartidaResumida } from "@/components/estadios/PartidaResumidaCard";
import { SkeletonCard } from "@/components/Skeleton";
import { IconMapPin, IconStar } from "@/components/Icons";

interface EstadioDetalhado {
  id: number;
  slug: string;
  nome: string;
  cidade: string;
  pais: string;
  capacidade: number;
  fotoUrl: string | null;
  descricao: string | null;
  historia: string | null;
  latitude: number | null;
  longitude: number | null;
  partidas: PartidaResumida[];
  galeria: string[];
}

function capacidadeBadge(capacidade: number): { label: string; cor: string } | null {
  if (capacidade >= 87000)
    return {
      label: "Maior estádio do torneio",
      cor: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    };
  if (capacidade >= 80000)
    return {
      label: "Top 3 maior",
      cor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
    };
  if (capacidade >= 70000)
    return {
      label: "Capacidade gigante",
      cor: "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200",
    };
  return null;
}

export default function EstadioDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [estadio, setEstadio] = useState<EstadioDetalhado | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/estadios/${slug}`)
      .then((r) => (r.ok ? r.json() : Promise.reject("Not found")))
      .then((d) => setEstadio(d.estadio))
      .catch(() => setError("Estádio não encontrado"))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-8">
        <SkeletonCard />
      </main>
    );
  }

  if (error || !estadio) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-8">
        <nav className="mb-6 text-sm text-zinc-400">
          <Link href="/estadios" className="hover:text-zinc-800 dark:hover:text-zinc-200">
            Estádios
          </Link>
          <span className="mx-2">&rsaquo;</span>
          <span className="text-zinc-500">Não encontrado</span>
        </nav>
        <p className="mt-8 text-zinc-500">{error ?? "Estádio não encontrado"}</p>
        <Link
          href="/estadios"
          className="mt-4 inline-block text-sm text-zinc-500 underline hover:text-zinc-800 dark:hover:text-zinc-200"
        >
          &larr; Voltar para estádios
        </Link>
      </main>
    );
  }

  const agora = new Date();
  const partidasFuturas = estadio.partidas.filter((p) => new Date(p.dataHora) > agora);
  const partidasPassadas = estadio.partidas.filter((p) => new Date(p.dataHora) <= agora);
  const badge = capacidadeBadge(estadio.capacidade);

  return (
    <main className="pb-12 overflow-x-clip">
      {/* Hero Section */}
      <section className="relative flex min-h-[60vh] w-full flex-col justify-end overflow-hidden">
        {estadio.fotoUrl ? (
          <motion.div
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <Image src={estadio.fotoUrl} alt={estadio.nome} fill className="object-cover" priority unoptimized />
          </motion.div>
        ) : (
          <div className="absolute inset-0 bg-zinc-200 dark:bg-zinc-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative z-10 mx-auto w-full max-w-5xl px-6 pb-12 pt-32"
        >
          <nav className="mb-4 text-sm text-zinc-300">
            <Link href="/estadios" className="hover:text-white transition-colors">
              Estádios
            </Link>
            <span className="mx-2">&rsaquo;</span>
            <span className="text-zinc-400">{estadio.nome}</span>
          </nav>

          <div className="flex flex-wrap items-end gap-4">
            <h1 className="text-4xl font-extrabold text-white sm:text-6xl drop-shadow-lg break-words max-w-full">
              {estadio.nome}
            </h1>
            {badge && (
              <span
                className={`mb-2 rounded-full px-3 py-1 text-sm font-semibold shadow-lg ${badge.cor}`}
              >
                <IconStar className="mr-1 inline h-4 w-4" />
                {badge.label}
              </span>
            )}
          </div>
        </motion.div>
      </section>

      <div className="mx-auto max-w-5xl px-6">
        {/* Grid de Info */}
        <motion.section 
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.4 } }
          }}
          className="relative z-20 -mt-8 mb-12 grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="group rounded-2xl border border-zinc-200/50 bg-white/80 p-6 shadow-xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:border-zinc-800/50 dark:bg-zinc-950/80 dark:hover:border-zinc-500/50 dark:hover:bg-zinc-900/90 dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]">
            <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Localização</h3>
            <p className="mt-2 flex items-center gap-1.5 text-lg font-semibold group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              <IconMapPin className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              {estadio.cidade}, {estadio.pais}
            </p>
          </motion.div>
          
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="group rounded-2xl border border-zinc-200/50 bg-white/80 p-6 shadow-xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:border-zinc-800/50 dark:bg-zinc-950/80 dark:hover:border-zinc-500/50 dark:hover:bg-zinc-900/90 dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]">
            <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Capacidade</h3>
            <p className="mt-2 text-lg font-semibold group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {estadio.capacidade.toLocaleString("pt-BR")} lugares
            </p>
          </motion.div>
          
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="group rounded-2xl border border-zinc-200/50 bg-white/80 p-6 shadow-xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:border-zinc-800/50 dark:bg-zinc-950/80 dark:hover:border-zinc-500/50 dark:hover:bg-zinc-900/90 dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]">
            <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Jogos Programados
            </h3>
            <p className="mt-2 text-lg font-semibold group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{estadio.partidas.length} partidas</p>
          </motion.div>
        </motion.section>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="space-y-12 lg:col-span-2">
            {estadio.descricao && (
              <section>
                <h2 className="text-2xl font-bold">Sobre o estádio</h2>
                <p className="mt-4 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {estadio.descricao}
                </p>
              </section>
            )}

            {estadio.historia && (
              <section>
                <h2 className="text-2xl font-bold">História</h2>
                <p className="mt-4 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {estadio.historia}
                </p>
              </section>
            )}

            {estadio.galeria && estadio.galeria.length > 0 && (
              <section>
                <h2 className="mb-6 text-2xl font-bold">Galeria de Fotos</h2>
                <motion.div
                  className="columns-1 gap-4 space-y-4 md:columns-2 lg:columns-3"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  {estadio.galeria.map((url, i) => (
                    <div 
                      key={i} 
                      className="break-inside-avoid overflow-hidden rounded-xl cursor-pointer group relative"
                      onClick={() => setSelectedImageIndex(i)}
                    >
                      <Image
                        src={url}
                        alt={`${estadio.nome} - Foto ${i + 1}`}
                        width={600}
                        height={400}
                        className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20 flex items-center justify-center">
                        <span className="opacity-0 transition-opacity duration-300 group-hover:opacity-100 text-white drop-shadow-md font-medium text-sm">
                          Ampliar
                        </span>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </section>
            )}

            <section>
              <h2 className="mb-6 text-2xl font-bold">Jogos neste estádio</h2>
              {estadio.partidas.length === 0 ? (
                <p className="text-zinc-500">Nenhuma partida programada neste estádio.</p>
              ) : (
                <div className="space-y-8">
                  <ListaPartidas
                    titulo="Próximas Partidas"
                    partidas={partidasFuturas}
                    vazia="Nenhuma partida futura."
                  />
                  <ListaPartidas
                    titulo="Partidas Realizadas"
                    partidas={partidasPassadas}
                    vazia="Nenhuma partida realizada."
                  />
                </div>
              )}
            </section>
          </div>

          <div className="lg:col-span-1">
            {estadio.latitude && estadio.longitude && (
              <div className="sticky top-24">
                <h2 className="mb-4 text-xl font-bold">Localização</h2>
                <div className="overflow-hidden rounded-2xl border border-zinc-200 shadow-md dark:border-zinc-800">
                  <iframe
                    title={`Mapa do ${estadio.nome}`}
                    width="100%"
                    height="300"
                    frameBorder="0"
                    scrolling="no"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${estadio.longitude - 0.02}%2C${estadio.latitude - 0.02}%2C${estadio.longitude + 0.02}%2C${estadio.latitude + 0.02}&layer=mapnik&marker=${estadio.latitude}%2C${estadio.longitude}`}
                  />
                </div>
                <a
                  href={`https://www.google.com/maps?q=${estadio.latitude},${estadio.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-100 p-3 text-sm font-medium text-zinc-700 transition-all duration-300 hover:scale-[1.02] hover:bg-zinc-200 hover:shadow-lg dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] active:scale-95"
                >
                  <IconMapPin className="h-5 w-5" />
                  Abrir no Google Maps
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImageIndex !== null && estadio.galeria && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <button 
            className="absolute top-6 right-6 z-50 text-white/70 hover:text-white transition-colors bg-black/50 p-2 rounded-full"
            onClick={() => setSelectedImageIndex(null)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          
          <button 
            className="absolute left-4 z-50 text-white/70 hover:text-white transition-colors bg-black/50 p-3 rounded-full hover:bg-black/80 disabled:opacity-30"
            disabled={selectedImageIndex === 0}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImageIndex(prev => (prev !== null && prev > 0 ? prev - 1 : prev));
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>

          <motion.div 
            key={selectedImageIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-5xl h-full max-h-[80vh] flex items-center justify-center"
            onClick={() => setSelectedImageIndex(null)}
          >
            <Image
              src={estadio.galeria[selectedImageIndex]}
              alt={`${estadio.nome} - Foto ${selectedImageIndex + 1}`}
              fill
              className="object-contain"
              unoptimized
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-4 py-1.5 rounded-full text-white text-sm backdrop-blur-md">
              {selectedImageIndex + 1} / {estadio.galeria.length}
            </div>
          </motion.div>

          <button 
            className="absolute right-4 z-50 text-white/70 hover:text-white transition-colors bg-black/50 p-3 rounded-full hover:bg-black/80 disabled:opacity-30"
            disabled={selectedImageIndex === estadio.galeria.length - 1}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImageIndex(prev => (prev !== null && prev < estadio.galeria!.length - 1 ? prev + 1 : prev));
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      )}
    </main>
  );
}
