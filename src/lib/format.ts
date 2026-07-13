export function formatarData(dataISO: string, opts?: Intl.DateTimeFormatOptions): string {
  const d = new Date(dataISO);
  return d.toLocaleDateString("pt-BR", {
    timeZone: "UTC",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...opts,
  });
}

export function formatarHora(dataISO: string): string {
  const d = new Date(dataISO);
  return d.toLocaleTimeString("pt-BR", { timeZone: "UTC", hour: "2-digit", minute: "2-digit" });
}

export function formatarDataLonga(dataISO: string): string {
  const d = new Date(dataISO);
  return d.toLocaleDateString("pt-BR", {
    timeZone: "UTC",
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}
