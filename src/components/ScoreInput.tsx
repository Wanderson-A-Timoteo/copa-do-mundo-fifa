import { ChangeEvent } from "react";

interface ScoreInputProps {
  value: string | number;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  isMobile?: boolean;
  salvando?: boolean;
  showOverlay?: boolean;
  onOverlayClick?: () => void;
}

export default function ScoreInput({
  value,
  onChange,
  onBlur,
  disabled = false,
  isMobile = false,
  salvando = false,
  showOverlay = false,
  onOverlayClick,
}: ScoreInputProps) {
  const baseClasses =
    "rounded-lg border border-zinc-300 text-center focus:border-zinc-500 focus:outline-none disabled:cursor-not-allowed dark:border-zinc-700 dark:bg-zinc-800";

  const sizeClasses = isMobile
    ? "w-12 px-2 py-1 text-sm"
    : "w-14 px-2 py-1.5 text-sm sm:w-16 sm:text-lg";

  const opacityClasses = disabled || salvando ? "opacity-50" : "";

  const inputElement = (
    <input
      type="number"
      min="0"
      max="99"
      disabled={disabled || salvando || showOverlay}
      value={value}
      onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      onBlur={onBlur}
      className={`${baseClasses} ${sizeClasses} ${opacityClasses}`.trim()}
    />
  );

  if (showOverlay) {
    return (
      <div className="relative">
        <div className="absolute inset-0 z-10 cursor-pointer" onClick={onOverlayClick} />
        {inputElement}
      </div>
    );
  }

  return inputElement;
}
