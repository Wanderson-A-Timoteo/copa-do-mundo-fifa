export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateGoals(golsMandante: unknown, golsVisitante: unknown): ValidationResult {
  const limpar = golsMandante === null && golsVisitante === null;
  if (limpar) return { valid: true };

  if (typeof golsMandante !== "number" || typeof golsVisitante !== "number") {
    return { valid: false, error: "Gols devem ser números" };
  }

  if (!Number.isInteger(golsMandante) || !Number.isInteger(golsVisitante)) {
    return { valid: false, error: "Gols devem ser números inteiros" };
  }

  if (golsMandante < 0 || golsVisitante < 0) {
    return { valid: false, error: "Gols não podem ser negativos" };
  }

  return { valid: true };
}

export function isClearMode(golsMandante: unknown, golsVisitante: unknown): boolean {
  return golsMandante === null && golsVisitante === null;
}

export function validatePartidaId(partidaId: unknown): ValidationResult {
  if (partidaId === undefined || partidaId === null) {
    return { valid: false, error: "partidaId é obrigatório" };
  }

  if (typeof partidaId === "string" && !isNaN(Number(partidaId))) {
    return { valid: true };
  }

  if (typeof partidaId !== "number") {
    return { valid: false, error: "partidaId deve ser um número" };
  }

  return { valid: true };
}
