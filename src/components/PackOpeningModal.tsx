"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import StickerCard from "@/components/StickerCard";
import { IconStar } from "@/components/Icons";
import type { FigurinhaResumo } from "@/types";

interface Figurinha extends FigurinhaResumo {
  tipo: string;
}

interface PackOpeningModalProps {
  figurinhas: Figurinha[];
  onClose: () => void;
}

type Step = "idle" | "opening" | "revealing";

export default function PackOpeningModal({ figurinhas, onClose }: PackOpeningModalProps) {
  const [step, setStep] = useState<Step>("idle");
  const [flippedIndex, setFlippedIndex] = useState<number[]>([]);

  const handlePackClick = () => {
    if (step !== "idle") return;
    setStep("opening");

    // Após animação de rasgar, transiciona para a revelação das cartas
    setTimeout(() => {
      setStep("revealing");
    }, 1500);
  };

  const flipCard = (index: number) => {
    if (step !== "revealing" || flippedIndex.includes(index)) return;

    const newFlipped = [...flippedIndex, index];
    setFlippedIndex(newFlipped);

    // Se for rara, dispara um pequeno efeito dourado imediato
    if (figurinhas[index].raridade === "rara") {
      dispararConfettiDourado();
    }

    // Verifica se virou todas
    if (newFlipped.length === figurinhas.length) {
      setTimeout(() => {
        dispararConfetti();
      }, 300);
    }
  };

  const dispararConfettiDourado = () => {
    confetti({
      particleCount: 80,
      spread: 100,
      origin: { y: 0.6 },
      colors: ["#FBBF24", "#F59E0B", "#D97706", "#FFFBEB"],
      zIndex: 250,
    });
  };

  const dispararConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 250 };

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti(
        Object.assign({}, defaults, {
          particleCount,
          origin: { x: Math.random(), y: Math.random() - 0.2 },
        }),
      );
    }, 250);
  };

  return (
    <div
      className="fixed inset-0 z-[200] overflow-y-auto bg-zinc-900/95 backdrop-blur-xl p-4 sm:p-8"
      onClick={flippedIndex.length === figurinhas.length ? onClose : undefined}
    >
      <div className="min-h-full flex items-center justify-center">
        <div className="w-full max-w-5xl text-center py-8" onClick={(e) => e.stopPropagation()}>
          <AnimatePresence mode="wait">
            {step === "idle" || step === "opening" ? (
              <motion.div
                key="pack"
                initial={{ scale: 0.5, y: -200, opacity: 0 }}
                animate={
                  step === "idle"
                    ? { scale: 1, y: 0, opacity: 1, transition: { type: "spring", bounce: 0.5 } }
                    : {
                        scale: [1, 1.1, 1.1, 1.2, 0],
                        rotate: [0, -5, 5, -10, 10, -15, 15, 0],
                        opacity: [1, 1, 1, 1, 0],
                        filter: [
                          "brightness(1)",
                          "brightness(1)",
                          "brightness(1)",
                          "brightness(2)",
                          "brightness(3)",
                        ],
                        transition: { duration: 1.5, times: [0, 0.2, 0.4, 0.8, 1] },
                      }
                }
                exit={{ opacity: 0, scale: 0 }}
                className="mx-auto flex h-80 w-56 cursor-pointer flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-emerald-500 p-4 shadow-[0_0_40px_rgba(59,130,246,0.5)] border-4 border-indigo-400/50 hover:shadow-[0_0_60px_rgba(59,130,246,0.8)] transition-shadow duration-300 relative overflow-hidden"
                onClick={handlePackClick}
              >
                <div className="absolute inset-0 bg-white/10 opacity-30 mix-blend-overlay"></div>
                <IconStar className="mb-4 h-16 w-16 text-amber-300 drop-shadow-[0_0_15px_rgba(252,211,77,0.8)] z-10" />
                <h2 className="text-3xl font-black uppercase italic tracking-widest text-zinc-50 drop-shadow-md z-10">
                  FIFA
                </h2>
                <h3 className="text-xl font-bold uppercase text-amber-300 drop-shadow-md z-10">
                  World Cup
                </h3>

                {step === "idle" && (
                  <motion.div
                    className="mt-8 rounded-full bg-zinc-50/20 px-4 py-2 text-sm font-bold text-zinc-50 backdrop-blur-sm z-10"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    Toque para abrir
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="cards"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full"
              >
                <h2 className="mb-12 flex items-center justify-center gap-3 text-3xl font-extrabold text-zinc-50 drop-shadow-lg">
                  <IconStar className="h-8 w-8 text-amber-400 animate-pulse" />
                  Toque para revelar
                </h2>

                <div className="mx-auto flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8">
                  {figurinhas.map((fig, i) => {
                    const isFlipped = flippedIndex.includes(i);
                    const isRara = fig.raridade === "rara";

                    return (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, x: 0, y: 100 }}
                        animate={{ scale: 1, x: 0, y: 0 }}
                        transition={{ type: "spring", delay: i * 0.1, bounce: 0.4 }}
                        className="group perspective-1000 w-[160px] h-[280px] sm:w-[180px] sm:h-[320px] md:w-[220px] md:h-[360px] cursor-pointer"
                        onClick={() => flipCard(i)}
                      >
                        <motion.div
                          className="relative h-full w-full transform-style-3d transition-transform duration-700 ease-out"
                          animate={
                            isFlipped
                              ? isRara
                                ? {
                                    rotateY: 180,
                                    scale: [1, 1.15, 1],
                                    filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"],
                                  }
                                : { rotateY: 180, scale: [1, 1.05, 1] }
                              : { rotateY: 0, scale: 1 }
                          }
                          transition={{ duration: 0.8 }}
                        >
                          {/* Costas da Carta (Face Down) */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl border-4 border-indigo-300 bg-gradient-to-br from-indigo-800 to-blue-900 shadow-[0_0_20px_rgba(55,48,163,0.5)] backface-hidden group-hover:-translate-y-2 group-hover:shadow-[0_0_30px_rgba(55,48,163,0.8)] transition-all duration-300">
                            <IconStar className="h-10 w-10 text-indigo-300/50" />
                            <p className="mt-2 text-xs font-bold uppercase tracking-widest text-indigo-300/50">
                              FIFA
                            </p>
                          </div>

                          {/* Frente da Carta (A figurinha real - RotateY 180) */}
                          <div className="absolute inset-0 rotate-y-180 backface-hidden">
                            <div
                              className={`h-full w-full rounded-xl transition-all duration-500 flex flex-col ${isFlipped && isRara ? "shadow-[0_0_30px_rgba(251,191,36,0.6)]" : "shadow-xl"}`}
                            >
                              <StickerCard figurinha={fig} />
                            </div>
                          </div>
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </div>

                {flippedIndex.length === figurinhas.length && (
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    onClick={onClose}
                    className="mt-16 mb-8 rounded-xl bg-zinc-100 px-10 py-4 text-sm font-bold text-zinc-900 shadow-xl transition-all hover:scale-105 hover:bg-zinc-200"
                  >
                    Continuar Colecionando
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
