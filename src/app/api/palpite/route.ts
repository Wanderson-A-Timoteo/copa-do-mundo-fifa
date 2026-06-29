import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verificarToken } from "@/lib/auth";

function getUserId(request: Request): number | null {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  try {
    return verificarToken(auth.slice(7)).userId;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const queryUsuarioId = searchParams.get("usuarioId");
  const usuarioId = queryUsuarioId ? Number(queryUsuarioId) : getUserId(request);

  if (!usuarioId) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  const partidaId = searchParams.get("partidaId");

  const where: Record<string, unknown> = { usuarioId };
  if (partidaId) where.partidaId = Number(partidaId);

  const palpites = await prisma.palpite.findMany({
    where,
    include: {
      partida: {
        include: { mandante: true, visitante: true, estadio: true, grupo: true },
      },
    },
  });

  return NextResponse.json({ palpites });
}

export async function POST(request: Request) {
  const usuarioId = getUserId(request);
  if (!usuarioId) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  const { partidaId, golsMandante, golsVisitante } = await request.json();

  if (!partidaId || typeof partidaId !== "number") {
    return NextResponse.json({ erro: "partidaId é obrigatório" }, { status: 400 });
  }

  const partida = await prisma.partida.findUnique({ where: { id: partidaId } });
  if (!partida) {
    return NextResponse.json({ erro: "Partida não encontrada" }, { status: 404 });
  }

  const isLimpar = golsMandante === null && golsVisitante === null;

  if (isLimpar) {
    await prisma.palpite.deleteMany({ where: { usuarioId, partidaId } });
    return NextResponse.json({ sucesso: true, limpo: true });
  }

  if (typeof golsMandante !== "number" || typeof golsVisitante !== "number") {
    return NextResponse.json(
      { erro: "golsMandante e golsVisitante devem ser números" },
      { status: 400 }
    );
  }

  const palpite = await prisma.palpite.upsert({
    where: { usuarioId_partidaId: { usuarioId, partidaId } },
    create: { usuarioId, partidaId, golsMandante, golsVisitante },
    update: { golsMandante, golsVisitante },
  });

  return NextResponse.json({ palpite });
}
