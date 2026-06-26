"use client";

import { motion } from "framer-motion";
import AnimacaoTransicaoEmCamadas from "./AnimacaoTransicaoEmCamadas";

export default function PaginaAnimada({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <AnimacaoTransicaoEmCamadas />
      <motion.div
        className="flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
