export default function BolaAnimada({ className = "h-32 w-32" }: { className?: string }) {
  return (
    <div className={className}>
      <svg viewBox="0 0 100 130" className="h-full w-full">
        <defs>
          <radialGradient id="bola-grad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#f4f4f5" />
            <stop offset="100%" stopColor="#c4c4c7" />
          </radialGradient>
        </defs>
        <g className="bola-grupo">
          {/* Sombra */}
          <ellipse cx="50" cy="118" rx="28" ry="6" fill="black" className="bola-sombra" />
          {/* Circunferência */}
          <circle cx="50" cy="48" r="40" fill="url(#bola-grad)" stroke="#a1a1aa" strokeWidth="0.5" />
          {/* Pentágono central */}
          <polygon
            points="50,32 61.4,41.3 56.9,54.7 43.1,54.7 38.6,41.3"
            fill="#18181b"
            stroke="#18181b"
            strokeWidth="0.5"
          />
          {/* 5 pentágonos periféricos */}
          <polygon
            points="0,-5 4.8,-1.5 2.9,4.0 -2.9,4.0 -4.8,-1.5"
            fill="#18181b"
            stroke="#18181b"
            strokeWidth="0.5"
            transform="translate(65.3,27.0) rotate(127)"
          />
          <polygon
            points="0,-5 4.8,-1.5 2.9,4.0 -2.9,4.0 -4.8,-1.5"
            fill="#18181b"
            stroke="#18181b"
            strokeWidth="0.5"
            transform="translate(74.7,56.0) rotate(198)"
          />
          <polygon
            points="0,-5 4.8,-1.5 2.9,4.0 -2.9,4.0 -4.8,-1.5"
            fill="#18181b"
            stroke="#18181b"
            strokeWidth="0.5"
            transform="translate(50.0,74.0) rotate(270)"
          />
          <polygon
            points="0,-5 4.8,-1.5 2.9,4.0 -2.9,4.0 -4.8,-1.5"
            fill="#18181b"
            stroke="#18181b"
            strokeWidth="0.5"
            transform="translate(25.3,56.0) rotate(342)"
          />
          <polygon
            points="0,-5 4.8,-1.5 2.9,4.0 -2.9,4.0 -4.8,-1.5"
            fill="#18181b"
            stroke="#18181b"
            strokeWidth="0.5"
            transform="translate(34.7,27.0) rotate(306)"
          />
          {/* Linhas radiais */}
          <line x1="50" y1="48" x2="50" y2="8" stroke="#18181b" strokeWidth="0.6" opacity="0.6" />
          <line x1="50" y1="48" x2="88" y2="35.6" stroke="#18181b" strokeWidth="0.6" opacity="0.6" />
          <line x1="50" y1="48" x2="73.5" y2="80.4" stroke="#18181b" strokeWidth="0.6" opacity="0.6" />
          <line x1="50" y1="48" x2="26.5" y2="80.4" stroke="#18181b" strokeWidth="0.6" opacity="0.6" />
          <line x1="50" y1="48" x2="12" y2="35.6" stroke="#18181b" strokeWidth="0.6" opacity="0.6" />
          {/* Brilho */}
          <ellipse cx="38" cy="34" rx="10" ry="8" fill="white" opacity="0.35" />
        </g>
      </svg>
      <style>{`
        .bola-grupo {
          transform-origin: 50px 48px;
          animation: bounce 1.2s ease-in-out infinite;
        }
        .bola-sombra {
          animation: sombra 1.2s ease-in-out infinite;
          transform-origin: 50px 118px;
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
