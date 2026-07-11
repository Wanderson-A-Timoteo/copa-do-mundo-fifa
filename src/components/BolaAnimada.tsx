export default function BolaAnimada({ className = "h-32 w-32" }: { className?: string }) {
  return (
    <div className={className}>
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <defs>
          <radialGradient id="bola-grad" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#f4f4f5" />
            <stop offset="100%" stopColor="#d4d4d8" />
          </radialGradient>
          <radialGradient id="bola-grad-dark" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#52525b" />
            <stop offset="100%" stopColor="#27272a" />
          </radialGradient>
        </defs>
        <g className="bola-grupo">
          {/* Sombra */}
          <ellipse cx="50" cy="92" rx="28" ry="6" fill="black" opacity="0.12" className="bola-sombra" />
          {/* Circunferência */}
          <circle cx="50" cy="48" r="40" fill="url(#bola-grad)" stroke="#a1a1aa" strokeWidth="0.5" className="bola-cor" />
          {/* Pentágono central */}
          <polygon
            points="50,22 62,30 58,44 42,44 38,30"
            fill="#18181b"
            stroke="#18181b"
            strokeWidth="0.3"
            className="bola-pentagono"
          />
          {/* Linhas dos gomos */}
          <line x1="50" y1="22" x2="50" y2="10" stroke="#18181b" strokeWidth="0.6" className="bola-linha" />
          <line x1="62" y1="30" x2="78" y2="22" stroke="#18181b" strokeWidth="0.6" className="bola-linha" />
          <line x1="58" y1="44" x2="72" y2="54" stroke="#18181b" strokeWidth="0.6" className="bola-linha" />
          <line x1="42" y1="44" x2="28" y2="54" stroke="#18181b" strokeWidth="0.6" className="bola-linha" />
          <line x1="38" y1="30" x2="22" y2="22" stroke="#18181b" strokeWidth="0.6" className="bola-linha" />
          {/* Metades dos gomos */}
          <line x1="50" y1="10" x2="72" y2="54" stroke="#18181b" strokeWidth="0.3" className="bola-linha" opacity="0.4" />
          <line x1="78" y1="22" x2="28" y2="54" stroke="#18181b" strokeWidth="0.3" className="bola-linha" opacity="0.4" />
          <line x1="22" y1="22" x2="72" y2="54" stroke="#18181b" strokeWidth="0.3" className="bola-linha" opacity="0.4" />
          {/* Brilho */}
          <ellipse cx="38" cy="34" rx="10" ry="8" fill="white" opacity="0.25" />
        </g>
      </svg>
      <style>{`
        .bola-grupo {
          transform-origin: 50px 48px;
          animation: bounce 1.2s ease-in-out infinite;
        }
        .bola-sombra {
          animation: sombra 1.2s ease-in-out infinite;
          transform-origin: 50px 92px;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-18px) rotate(15deg); }
          50% { transform: translateY(0) rotate(0deg); }
          75% { transform: translateY(-9px) rotate(8deg); }
        }
        @keyframes sombra {
          0%, 100% { transform: scaleX(1); opacity: 0.12; }
          25% { transform: scaleX(0.6); opacity: 0.08; }
          50% { transform: scaleX(1); opacity: 0.12; }
          75% { transform: scaleX(0.8); opacity: 0.1; }
        }
      `}</style>
    </div>
  );
}
