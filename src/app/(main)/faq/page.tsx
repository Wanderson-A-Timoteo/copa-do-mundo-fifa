"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    pergunta: "Como funciona o Bolão da Copa?",
    resposta:
      "O Bolão permite que você dê palpites para os resultados de todos os jogos da Copa do Mundo de 2026. Você ganha pontos por acertar o vencedor, o placar exato ou a diferença de gols. Ao final, quem tiver mais pontos no ranking global é o vencedor.",
  },
  {
    pergunta: "Como consigo pacotes de figurinhas?",
    resposta:
      "Você ganha 'Moedas' ao acertar palpites no Bolão ou ao completar missões diárias. Com essas moedas, você pode acessar a seção 'Gacha' (Álbum) e comprar pacotes de figurinhas para tentar completar sua coleção.",
  },
  {
    pergunta: "Posso trocar figurinhas repetidas?",
    resposta:
      "Em breve lançaremos o sistema de trocas! Você poderá colocar suas figurinhas repetidas no mercado e trocar com outros jogadores da plataforma para ajudar a completar o álbum.",
  },
  {
    pergunta: "O aplicativo é gratuito?",
    resposta:
      "Sim! O aplicativo é um projeto acadêmico e de entretenimento, sendo 100% gratuito. Não há compras com dinheiro real (microtransações) de nenhuma forma.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-12 md:py-20">
      <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:p-12">
        <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
          Perguntas Frequentes
        </h1>
        <p className="mb-8 text-zinc-500">Tudo o que você precisa saber sobre o Bolão e o Álbum.</p>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/50"
            >
              <button
                onClick={() => toggle(index)}
                className="flex w-full items-center justify-between p-5 text-left font-semibold text-zinc-900 transition-colors hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800/50"
              >
                {faq.pergunta}
                <ChevronDown
                  className={`h-5 w-5 text-zinc-500 transition-transform duration-300 ${openIndex === index ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="border-t border-zinc-200 p-5 text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
                      {faq.resposta}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
