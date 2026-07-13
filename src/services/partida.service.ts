import { prisma } from "@/lib/prisma";

export async function atualizarPartida(
  partidaId: number,
  golsMandante: number | null,
  golsVisitante: number | null,
) {
  const partida = await prisma.partida.findUnique({ where: { id: partidaId } });
  if (!partida) throw new Error("MATCH_NOT_FOUND");

  const isLimpar = golsMandante === null && golsVisitante === null;

  if (!isLimpar && (typeof golsMandante !== "number" || typeof golsVisitante !== "number")) {
    throw new Error("INVALID_GOALS");
  }

  let vencedorId: number | null = null;
  if (!isLimpar) {
    if (golsMandante! > golsVisitante!) vencedorId = partida.selecaoMandanteId;
    else if (golsVisitante! > golsMandante!) vencedorId = partida.selecaoVisitanteId;
  }

  return prisma.partida.update({
    where: { id: partidaId },
    data: {
      golsMandante: isLimpar ? null : golsMandante,
      golsVisitante: isLimpar ? null : golsVisitante,
      encerrada: !isLimpar,
      vencedorId,
    },
    include: { mandante: true, visitante: true, estadio: true },
  });
}
