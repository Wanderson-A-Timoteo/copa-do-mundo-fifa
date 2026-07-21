"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Termo {
  id: string;
  titulo: string;
  icone: React.ReactNode;
  conteudo: React.ReactNode;
}

const TERMOS_DATA: Termo[] = [
  {
    id: "uso",
    titulo: "1. Uso do Aplicativo",
    icone: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    conteudo: (
      <p>
        O aplicativo é destinado ao entretenimento esportivo (futebol). É proibido utilizá-lo para
        apostas financeiras reais, atividades ilícitas ou qualquer fim que viole a legislação
        brasileira.
      </p>
    ),
  },
  {
    id: "contas",
    titulo: "2. Contas de Usuário",
    icone: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    conteudo: (
      <p>
        Ao criar uma conta (via Google ou credenciais locais), você é responsável por manter a
        confidencialidade de sua senha e por todas as atividades que ocorrerem sob sua conta.
        Reservamo-nos o direito de encerrar contas que apresentem comportamento abusivo.
      </p>
    ),
  },
  {
    id: "propriedade",
    titulo: "3. Propriedade Intelectual",
    icone: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
    ),
    conteudo: (
      <p>
        Todos os direitos sobre a marca, design, logotipos e conteúdo original deste aplicativo
        pertencem aos seus desenvolvedores. Os nomes &quot;FIFA&quot;, &quot;Copa do Mundo&quot; e
        escudos de seleções são propriedades de suas respectivas entidades e são usados aqui em
        caráter meramente informativo e de entretenimento (fair use).
      </p>
    ),
  },
  {
    id: "modificacoes",
    titulo: "4. Modificações dos Termos",
    icone: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
    ),
    conteudo: (
      <p>
        Podemos revisar estes termos a qualquer momento, sem aviso prévio. Ao continuar usando o
        aplicativo, você concorda em se submeter à versão mais recente destes Termos de Uso.
      </p>
    ),
  },
];

export default function TermosDeUsoPage() {
  const [activeSection, setActiveSection] = useState<string>(TERMOS_DATA[0].id);

  const toggleSection = (id: string) => {
    setActiveSection((prev) => (prev === id ? "" : id));
  };

  return (
    <main className="mx-auto max-w-2xl p-4 sm:p-6 md:p-8 space-y-8 min-h-screen">
      {/* Hero Header */}
      <div className="flex flex-col items-center justify-center text-center mt-6 mb-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 mb-4 shadow-sm ring-1 ring-emerald-200 dark:ring-emerald-800">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
          Termos de Uso
        </h1>
        <p className="mt-3 text-sm text-zinc-500 max-w-md mx-auto">
          Bem-vindo ao <strong>Bolão da Copa FIFA 2026</strong>. Para manter uma convivência limpa e
          justa, pedimos que leia nossas diretrizes.
        </p>
      </div>

      {/* Accordions */}
      <div className="space-y-4">
        {TERMOS_DATA.map((termo) => {
          const isOpen = activeSection === termo.id;

          return (
            <div
              key={termo.id}
              className={`overflow-hidden rounded-2xl border transition-colors duration-300 ${
                isOpen
                  ? "bg-zinc-50 border-emerald-200 shadow-md dark:bg-zinc-900/80 dark:border-emerald-900/50"
                  : "bg-white border-zinc-200 shadow-sm hover:border-zinc-300 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-700"
              }`}
            >
              <button
                onClick={() => toggleSection(termo.id)}
                className="flex w-full items-center justify-between p-4 sm:p-5 text-left active:scale-[0.98] transition-transform duration-200 focus:outline-none"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl transition-colors ${isOpen ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"}`}
                  >
                    {termo.icone}
                  </div>
                  <h2
                    className={`font-bold sm:text-lg transition-colors ${isOpen ? "text-emerald-700 dark:text-emerald-400" : "text-zinc-800 dark:text-zinc-200"}`}
                  >
                    {termo.titulo}
                  </h2>
                </div>
                <div className="ml-4 shrink-0">
                  <motion.div
                    initial={false}
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <svg
                      className="w-5 h-5 text-zinc-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </motion.div>
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial="collapsed"
                    animate="open"
                    exit="collapsed"
                    variants={{
                      open: { opacity: 1, height: "auto" },
                      collapsed: { opacity: 0, height: 0 },
                    }}
                    transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                  >
                    <div className="px-5 pb-5 pt-1 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed pl-16">
                      {termo.conteudo}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="text-center pt-8 pb-4">
        <span className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-1.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          Última atualização: Julho de 2026
        </span>
      </div>
    </main>
  );
}
