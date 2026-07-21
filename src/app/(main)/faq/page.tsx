"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQ {
  id: string;
  pergunta: string;
  icone: React.ReactNode;
  resposta: React.ReactNode;
}

const FAQ_DATA: FAQ[] = [
  {
    id: "bolao",
    pergunta: "Como funciona o Bolão da Copa?",
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
    resposta: (
      <p>
        O Bolão permite que você dê palpites para os resultados de todos os jogos da Copa do Mundo
        de 2026. Você ganha pontos por acertar o vencedor, o placar exato ou a diferença de gols. Ao
        final, quem tiver mais pontos no ranking global é o grande vencedor.
      </p>
    ),
  },
  {
    id: "figurinhas",
    pergunta: "Como consigo pacotes de figurinhas?",
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
    resposta: (
      <p>
        Você ganha &apos;Moedas&apos; ao acertar palpites no Bolão ou ao completar missões diárias.
        Com essas moedas, você pode acessar a seção &apos;Gacha&apos; (Álbum) e comprar pacotes de
        figurinhas para tentar completar sua coleção.
      </p>
    ),
  },
  {
    id: "trocas",
    pergunta: "Posso trocar figurinhas repetidas?",
    icone: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
        />
      </svg>
    ),
    resposta: (
      <p>
        <strong>Sim, o mercado está aberto!</strong> Você pode anunciar suas figurinhas repetidas
        (ou aquelas que não quer) na aba de Trocas e enviar/receber propostas de outros jogadores.
        Lembre-se que algumas figurinhas mais raras valem ouro no mercado!
      </p>
    ),
  },
  {
    id: "gratuito",
    pergunta: "O aplicativo é gratuito?",
    icone: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    resposta: (
      <p>
        Sim! O aplicativo é um projeto com fins acadêmicos e de entretenimento, sendo{" "}
        <strong>100% gratuito</strong>. Não há e nunca haverá compras com dinheiro real
        (microtransações) no sistema.
      </p>
    ),
  },
];

export default function FAQPage() {
  const [activeSection, setActiveSection] = useState<string>(FAQ_DATA[0].id);

  const toggleSection = (id: string) => {
    setActiveSection((prev) => (prev === id ? "" : id));
  };

  return (
    <main className="mx-auto max-w-2xl p-4 sm:p-6 md:p-8 space-y-8 min-h-screen">
      {/* Hero Header */}
      <div className="flex flex-col items-center justify-center text-center mt-6 mb-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 mb-4 shadow-sm ring-1 ring-purple-200 dark:ring-purple-800">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
          Perguntas Frequentes
        </h1>
        <p className="mt-3 text-sm text-zinc-500 max-w-md mx-auto">
          Tudo o que você precisa saber sobre como dominar o Bolão e completar seu Álbum da Copa.
        </p>
      </div>

      {/* Accordions */}
      <div className="space-y-4">
        {FAQ_DATA.map((faq) => {
          const isOpen = activeSection === faq.id;

          return (
            <div
              key={faq.id}
              className={`overflow-hidden rounded-2xl border transition-colors duration-300 ${
                isOpen
                  ? "bg-zinc-50 border-purple-200 shadow-md dark:bg-zinc-900/80 dark:border-purple-900/50"
                  : "bg-white border-zinc-200 shadow-sm hover:border-zinc-300 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-700"
              }`}
            >
              <button
                onClick={() => toggleSection(faq.id)}
                className="flex w-full items-center justify-between p-4 sm:p-5 text-left active:scale-[0.98] transition-transform duration-200 focus:outline-none"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl transition-colors ${isOpen ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"}`}
                  >
                    {faq.icone}
                  </div>
                  <h2
                    className={`font-bold sm:text-lg transition-colors ${isOpen ? "text-purple-700 dark:text-purple-400" : "text-zinc-800 dark:text-zinc-200"}`}
                  >
                    {faq.pergunta}
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
                      {faq.resposta}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </main>
  );
}
