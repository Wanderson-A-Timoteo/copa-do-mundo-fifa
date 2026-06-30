import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verificarToken } from "@/lib/auth";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = _request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }
  let payload;
  try {
    payload = verificarToken(auth.slice(7));
  } catch {
    return NextResponse.json({ erro: "Token inválido" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 403 });
  }

  const { golsMandante, golsVisitante } = await _request.json();

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
