"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Politica {
  id: string;
  titulo: string;
  icone: React.ReactNode;
  conteudo: React.ReactNode;
}

const POLITICAS_DATA: Politica[] = [
  {
    id: "coleta",
    titulo: "1. Coleta de Dados",
    icone: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
        />
      </svg>
    ),
    conteudo: (
      <>
        <p className="mb-2">Coletamos as seguintes informações quando você cria uma conta:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Nome de usuário ou nome do perfil do Google.</li>
          <li>Endereço de e-mail (usado apenas para login e recuperação de senha).</li>
          <li>Suas interações (palpites no bolão, progresso no álbum de figurinhas).</li>
        </ul>
      </>
    ),
  },
  {
    id: "uso",
    titulo: "2. Uso das Informações",
    icone: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    conteudo: (
      <p>
        As informações coletadas são utilizadas exclusivamente para o funcionamento do aplicativo:
        gerenciar suas pontuações no bolão, salvar o progresso do seu álbum e fornecer uma
        experiência personalizada. Não vendemos, alugamos ou compartilhamos seus dados com terceiros
        para fins de marketing.
      </p>
    ),
  },
  {
    id: "cookies",
    titulo: "3. Cookies",
    icone: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
        />
      </svg>
    ),
    conteudo: (
      <p>
        Utilizamos cookies técnicos essenciais apenas para manter sua sessão ativa (login) e lembrar
        de suas preferências de tema (Light/Dark). Não utilizamos cookies de rastreamento (tracking)
        ou anúncios de terceiros.
      </p>
    ),
  },
  {
    id: "exclusao",
    titulo: "4. Exclusão de Conta",
    icone: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
      </svg>
    ),
    conteudo: (
      <p>
        Você tem o direito de solicitar a exclusão da sua conta e de todos os dados associados a
        qualquer momento. Para isso, acesse as configurações do seu perfil e clique em &quot;Excluir
        Conta&quot;. A remoção é imediata e irreversível.
      </p>
    ),
  },
  {
    id: "publico",
    titulo: "5. Uso Educacional e Público",
    icone: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
    conteudo: (
      <p>
        Este sistema foi desenvolvido para fins estritamente educacionais e de entretenimento. Como
        não envolvemos valores financeiros ou transações monetárias (apostas com dinheiro real), a
        plataforma é considerada segura e adequada para o uso por qualquer faixa etária, incluindo
        menores de idade em ambiente escolar.
      </p>
    ),
  },
];

export default function PoliticasPrivacidadePage() {
  const [activeSection, setActiveSection] = useState<string>(POLITICAS_DATA[0].id);

  const toggleSection = (id: string) => {
    setActiveSection((prev) => (prev === id ? "" : id));
  };

  return (
    <main className="mx-auto max-w-2xl p-4 sm:p-6 md:p-8 space-y-8 min-h-screen">
      {/* Hero Header */}
      <div className="flex flex-col items-center justify-center text-center mt-6 mb-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 mb-4 shadow-sm ring-1 ring-blue-200 dark:ring-blue-800">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
          Políticas de Privacidade
        </h1>
        <p className="mt-3 text-sm text-zinc-500 max-w-md mx-auto">
          A sua privacidade é fundamental para nós. Estamos comprometidos a proteger seus dados em
          conformidade com a LGPD.
        </p>
      </div>

      {/* Accordions */}
      <div className="space-y-4">
        {POLITICAS_DATA.map((politica) => {
          const isOpen = activeSection === politica.id;

          return (
            <div
              key={politica.id}
              className={`overflow-hidden rounded-2xl border transition-colors duration-300 ${
                isOpen
                  ? "bg-zinc-50 border-blue-200 shadow-md dark:bg-zinc-900/80 dark:border-blue-900/50"
                  : "bg-white border-zinc-200 shadow-sm hover:border-zinc-300 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-700"
              }`}
            >
              <button
                onClick={() => toggleSection(politica.id)}
                className="flex w-full items-center justify-between p-4 sm:p-5 text-left active:scale-[0.98] transition-transform duration-200 focus:outline-none"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl transition-colors ${isOpen ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"}`}
                  >
                    {politica.icone}
                  </div>
                  <h2
                    className={`font-bold sm:text-lg transition-colors ${isOpen ? "text-blue-700 dark:text-blue-400" : "text-zinc-800 dark:text-zinc-200"}`}
                  >
                    {politica.titulo}
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
                      {politica.conteudo}
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
