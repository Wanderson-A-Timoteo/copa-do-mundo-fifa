import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verificarToken, getTokenFromRequest } from "@/lib/auth";

function getUsuarioId(request: Request): number | null {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  try {
    return verificarToken(token).userId;
  } catch {
    return null;
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const usuarioId = getUsuarioId(request);
  if (!usuarioId) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: usuarioId } });
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const { golsMandante, golsVisitante } = await request.json();

  const partida = await prisma.partida.findUnique({
    where: { id: Number(id) },
  });

  if (!partida) {
    return NextResponse.json({ erro: "Partida não encontrada" }, { status: 404 });
  }

  const isLimpar = golsMandante === null && golsVisitante === null;

  if (!isLimpar && (typeof golsMandante !== "number" || typeof golsVisitante !== "number")) {
    return NextResponse.json(
      { erro: "golsMandante e golsVisitante devem ser números ou ambos null" },
      { status: 400 }
    );
  }

  let vencedorId: number | null = null;
  if (!isLimpar) {
    if (golsMandante > golsVisitante) vencedorId = partida.selecaoMandanteId;
    else if (golsVisitante > golsMandante) vencedorId = partida.selecaoVisitanteId;
  }

  const atualizada = await prisma.partida.update({
    where: { id: Number(id) },
    data: {
      golsMandante: isLimpar ? null : golsMandante,
      golsVisitante: isLimpar ? null : golsVisitante,
      encerrada: !isLimpar,
      vencedorId,
    },
    include: { mandante: true, visitante: true, estadio: true },
  });

  return NextResponse.json({ partida: atualizada });
}
