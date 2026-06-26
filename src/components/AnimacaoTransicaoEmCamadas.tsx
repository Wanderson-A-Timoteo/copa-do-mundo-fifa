"use client";

import { motion, Variants } from "framer-motion";

const animacaoCamada: Variants = {
  initial: { x: "100%" },
  animate: {
    x: ["100%", "0%", "0%", "-100%"],
    transition: {
      duration: 1,
      ease: "easeInOut",
      times: [0, 0.35, 0.65, 1],
    },
  },
  exit: {
    x: "-100%",
    transition: { duration: 0.5, ease: "easeInOut" },
  },
};

const containerAnimacao: Variants = {
  animate: {
    transition: { staggerChildren: 0.1 },
  },
};

export default function AnimacaoTransicaoEmCamadas() {
  return (
    <motion.div
      variants={containerAnimacao}
      initial="initial"
      animate="animate"
      exit="exit"
      className="pointer-events-none"
    >
      <motion.div
        className="fixed inset-y-0 left-0 w-full bg-zinc-900 z-[100]"
        variants={animacaoCamada}
      />
      <motion.div
        className="fixed inset-y-0 left-0 w-full bg-zinc-800 z-[99]"
        variants={animacaoCamada}
      />
    </motion.div>
  );
}
