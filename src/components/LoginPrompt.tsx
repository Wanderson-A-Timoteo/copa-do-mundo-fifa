import React from "react";

interface LoginPromptProps {
  message?: string;
  buttonText?: string;
  onLogin?: () => void;
  href?: string;
  icon?: React.ReactNode;
}

export default function LoginPrompt({
  message = "Faça login para continuar",
  buttonText = "Fazer Login",
  onLogin,
  href = "/login",
  icon,
}: LoginPromptProps) {
  if (onLogin) {
    return (
      <div className="py-16 text-center">
        {icon && <div className="mb-2">{icon}</div>}
        <p className="text-lg text-zinc-500">{message}</p>
        <button
          onClick={onLogin}
          className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {buttonText}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-16 text-center text-zinc-400">
      {icon && <div className="mb-2">{icon}</div>}
      <p className="mt-4 text-lg font-medium">{message}</p>
      <a
        href={href}
        className="mt-2 inline-block text-sm text-zinc-500 underline hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        Entrar
      </a>
    </div>
  );
}
