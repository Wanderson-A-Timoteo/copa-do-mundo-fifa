"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const imagens = [
  { src: "/images/torcida-brasil.jpg", alt: "Torcida do Brasil" },
  { src: "/images/estadio-aereo.jpg", alt: "Estádio visto de cima" },
  { src: "/images/campo-futebol.jpg", alt: "Campo de futebol" },
  { src: "/images/jogada-acao.jpg", alt: "Jogada em ação" },
];

export default function HeroCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((a) => (a + 1) % imagens.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-0">
      {imagens.map((img, i) => (
        <div
          key={img.src}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === active ? 1 : 0 }}
        >
          <Image
            src={img.src}
            alt={img.alt}
            fill
            className="object-cover"
            sizes="100vw"
            priority={i === 0}
          />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/60" />
    </div>
  );
}
