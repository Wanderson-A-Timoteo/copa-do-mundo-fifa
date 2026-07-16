import { ChangeEvent } from "react";

interface ScoreInputProps {
  value: string | number;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  isMobile?: boolean;

  showOverlay?: boolean;
  onOverlayClick?: () => void;
  dataHora?: string;
}

export default function ScoreInput({
  value,
  onChange,
  onBlur,
  disabled = false,
  isMobile = false,

  showOverlay = false,
  onOverlayClick,
  dataHora,
}: ScoreInputProps) {
  const jogoIniciado = dataHora ? new Date() >= new Date(dataHora) : false;
  const baseClasses =
    "rounded-lg border border-zinc-300 text-center focus:border-zinc-500 focus:outline-none disabled:cursor-not-allowed dark:border-zinc-700 dark:bg-zinc-800";

  const sizeClasses = isMobile
    ? "w-12 px-2 py-1 text-sm"
    : "w-14 px-2 py-1.5 text-sm sm:w-16 sm:text-lg";

  const opacityClasses = disabled || jogoIniciado ? "opacity-50" : "";
  const cursorClass = jogoIniciado ? "cursor-not-allowed bg-zinc-200 dark:bg-zinc-700" : "";

  const inputElement = (
    <input
      type="number"
      min="0"
      max="99"
      disabled={disabled || showOverlay || jogoIniciado}
      value={value}
      onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      onBlur={onBlur}
      className={`${baseClasses} ${sizeClasses} ${opacityClasses} ${cursorClass}`.trim()}
    />
  );

  const encerradoBadge = jogoIniciado && !isMobile && (
    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded bg-red-500 px-1 py-0.5 text-[8px] font-bold text-zinc-50 shadow-sm">
      Encerrado
    </span>
  );

  if (showOverlay) {
    return (
      <div className="relative">
        <div className="absolute inset-0 z-10 cursor-pointer" onClick={onOverlayClick} />
        {encerradoBadge}
        {inputElement}
      </div>
    );
  }

  return (
    <div className="relative">
      {encerradoBadge}
      {inputElement}
    </div>
  );
}
