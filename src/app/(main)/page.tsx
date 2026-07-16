"use client";

import Link from "next/link";
import { FlagIcon } from "@/components/FlagIcon";
import { motion } from "framer-motion";
import { Globe, Calendar, MapPin, Trophy, BookOpen } from "lucide-react";

const copasAnteriores = [
  { ano: 2022, sede: "Catar", campeao: "Argentina", siglaCampeao: "ar", siglaSede: "qa" },
  { ano: 2018, sede: "Rússia", campeao: "França", siglaCampeao: "fr", siglaSede: "ru" },
  { ano: 2014, sede: "Brasil", campeao: "Alemanha", siglaCampeao: "de", siglaSede: "br" },
  { ano: 2010, sede: "África do Sul", campeao: "Espanha", siglaCampeao: "es", siglaSede: "za" },
  { ano: 2006, sede: "Alemanha", campeao: "Itália", siglaCampeao: "it", siglaSede: "de" },
  { ano: 2002, sede: "Coreia/Japão", campeao: "Brasil", siglaCampeao: "br", siglaSede: "kr" },
  { ano: 1998, sede: "França", campeao: "França", siglaCampeao: "fr", siglaSede: "fr" },
  { ano: 1994, sede: "EUA", campeao: "Brasil", siglaCampeao: "br", siglaSede: "us" },
  { ano: 1990, sede: "Itália", campeao: "Alemanha", siglaCampeao: "de", siglaSede: "it" },
  { ano: 1986, sede: "México", campeao: "Argentina", siglaCampeao: "ar", siglaSede: "mx" },
  { ano: 1982, sede: "Espanha", campeao: "Itália", siglaCampeao: "it", siglaSede: "es" },
  { ano: 1978, sede: "Argentina", campeao: "Argentina", siglaCampeao: "ar", siglaSede: "ar" },
  { ano: 1974, sede: "Alemanha", campeao: "Alemanha", siglaCampeao: "de", siglaSede: "de" },
  { ano: 1970, sede: "México", campeao: "Brasil", siglaCampeao: "br", siglaSede: "mx" },
  {
    ano: 1966,
    sede: "Inglaterra",
    campeao: "Inglaterra",
    siglaCampeao: "gb-eng",
    siglaSede: "gb-eng",
  },
  { ano: 1962, sede: "Chile", campeao: "Brasil", siglaCampeao: "br", siglaSede: "cl" },
  { ano: 1958, sede: "Suécia", campeao: "Brasil", siglaCampeao: "br", siglaSede: "se" },
  { ano: 1954, sede: "Suíça", campeao: "Alemanha", siglaCampeao: "de", siglaSede: "ch" },
  { ano: 1950, sede: "Brasil", campeao: "Uruguai", siglaCampeao: "uy", siglaSede: "br" },
  { ano: 1938, sede: "França", campeao: "Itália", siglaCampeao: "it", siglaSede: "fr" },
  { ano: 1934, sede: "Itália", campeao: "Itália", siglaCampeao: "it", siglaSede: "it" },
  { ano: 1930, sede: "Uruguai", campeao: "Uruguai", siglaCampeao: "uy", siglaSede: "uy" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { stiffness: 300, damping: 24 } },
};

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center overflow-x-clip px-6 py-12 md:py-20">
      {/* Hero Section */}
      <section className="relative flex w-full max-w-5xl flex-col items-center justify-center text-center">
        {/* Efeito de brilho no fundo */}
        <div className="absolute top-0 -z-10 h-64 w-64 rounded-full bg-emerald-500/20 blur-[100px] dark:bg-emerald-500/10" />

        <motion.div
          initial="hidden"
          animate="show"
          variants={containerVariants}
          className="z-10 flex flex-col items-center"
        >
          <motion.div
            variants={itemVariants}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-400"
          >
            <Trophy className="h-4 w-4" /> A Maior Copa da História
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="max-w-4xl text-5xl font-extrabold leading-tight tracking-tighter sm:text-7xl"
          >
            Copa do Mundo <br />
            <span className="bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">
              FIFA 2026
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-6 flex flex-wrap items-center justify-center gap-3 text-lg font-medium text-zinc-500 dark:text-zinc-400"
          >
            <span className="flex items-center gap-1.5 rounded-full bg-zinc-100 px-4 py-2 shadow-sm dark:bg-zinc-800 dark:shadow-[0_0_15px_rgba(255,255,255,0.02)]">
              Canadá <FlagIcon codigo="ca" className="h-5 w-auto rounded-sm drop-shadow-sm" />
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-zinc-100 px-4 py-2 shadow-sm dark:bg-zinc-800 dark:shadow-[0_0_15px_rgba(255,255,255,0.02)]">
              EUA <FlagIcon codigo="us" className="h-5 w-auto rounded-sm drop-shadow-sm" />
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-zinc-100 px-4 py-2 shadow-sm dark:bg-zinc-800 dark:shadow-[0_0_15px_rgba(255,255,255,0.02)]">
              México <FlagIcon codigo="mx" className="h-5 w-auto rounded-sm drop-shadow-sm" />
            </span>
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row w-full sm:w-auto"
          >
            <Link
              href="/album"
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-8 py-4 text-base font-bold text-zinc-50 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-emerald-500/25 active:scale-95 sm:w-auto"
            >
              <BookOpen className="h-5 w-5" /> Abrir Álbum
            </Link>
            <Link
              href="/tabela/grupos"
              className="group flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-100 px-8 py-4 text-base font-bold text-zinc-800 shadow-sm transition-all duration-300 hover:scale-105 hover:border-zinc-300 hover:shadow-md active:scale-95 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:border-zinc-500 sm:w-auto"
            >
              <Calendar className="h-5 w-5 text-emerald-500" /> Ver Tabela
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="mt-24 w-full max-w-5xl">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
          className="grid gap-4 sm:grid-cols-3"
        >
          <motion.div
            variants={itemVariants}
            className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800"
          >
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-emerald-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <Globe className="mb-4 h-8 w-8 text-emerald-500" />
            <div className="text-4xl font-black text-zinc-900 dark:text-zinc-100">48</div>
            <div className="mt-1 font-medium text-zinc-500">Seleções Nacionais</div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800"
          >
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-teal-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <Calendar className="mb-4 h-8 w-8 text-teal-500" />
            <div className="text-4xl font-black text-zinc-900 dark:text-zinc-100">104</div>
            <div className="mt-1 font-medium text-zinc-500">Partidas Épicas</div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800"
          >
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-blue-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <MapPin className="mb-4 h-8 w-8 text-blue-500" />
            <div className="text-4xl font-black text-zinc-900 dark:text-zinc-100">16</div>
            <div className="mt-1 font-medium text-zinc-500">Cidades Sedes</div>
          </motion.div>
        </motion.div>
      </section>

      {/* Timeline Histórica */}
      <section className="mt-32 w-full max-w-3xl pb-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
            Galeria de Campeões
          </h2>
          <p className="mt-3 text-zinc-500">Relembre a glória das Copas passadas</p>
        </div>

        <div className="relative">
          {/* Linha Central */}
          <div className="absolute bottom-0 left-12 top-0 w-0.5 bg-zinc-200 dark:bg-zinc-800 sm:left-1/2 sm:-translate-x-1/2" />

          <div className="space-y-12">
            {copasAnteriores.map((copa, index) => {
              const isEven = index % 2 === 0;
              return (
                <motion.div
                  key={copa.ano}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, type: "spring" }}
                  className={`relative flex items-center ${isEven ? "sm:flex-row-reverse" : ""}`}
                >
                  {/* Ponto Central */}
                  <div className="absolute left-12 h-4 w-4 -translate-x-1/2 rounded-full border-4 border-zinc-100 bg-emerald-500 shadow-sm dark:border-zinc-900 sm:left-1/2" />

                  {/* Card do Campeão */}
                  <div
                    className={`ml-20 flex w-full flex-col sm:ml-0 sm:w-1/2 ${isEven ? "sm:pl-10" : "sm:pr-10 sm:text-right"}`}
                  >
                    <div className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-lg dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-500">
                      {/* Selo do Ano e Sede */}
                      <div
                        className={`mb-4 flex items-center gap-2 ${isEven ? "justify-start" : "sm:justify-end"}`}
                      >
                        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-600 dark:bg-zinc-700/50 dark:text-zinc-300">
                          {copa.ano}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
                          Sede: {copa.sede}
                          <FlagIcon
                            codigo={copa.siglaSede}
                            className="h-3 w-auto rounded-sm opacity-80"
                          />
                        </span>
                      </div>

                      {/* Informação do Campeão */}
                      <div
                        className={`flex items-center gap-4 ${isEven ? "justify-start" : "sm:flex-row-reverse"}`}
                      >
                        <div className="relative shrink-0">
                          <div className="absolute -inset-1 animate-pulse rounded-md bg-emerald-500/20 blur-sm" />
                          <FlagIcon
                            codigo={copa.siglaCampeao}
                            className="relative h-12 w-auto rounded-md shadow-sm"
                          />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                            Campeão
                          </p>
                          <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100">
                            {copa.campeao}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
