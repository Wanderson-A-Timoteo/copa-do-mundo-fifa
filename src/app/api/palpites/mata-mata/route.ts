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
  const usuarioId = getUserId(request);
  if (!usuarioId) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const partidaId = searchParams.get("partidaId");

  const where: Record<string, unknown> = { usuarioId };
  if (partidaId) where.partidaId = Number(partidaId);

  const palpites = await prisma.palpiteMataMata.findMany({ where });

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

  const isLimpar = golsMandante === null && golsVisitante === null;

  if (isLimpar) {
    await prisma.palpiteMataMata.deleteMany({ where: { usuarioId, partidaId } });
    return NextResponse.json({ sucesso: true, limpo: true });
  }

  if (typeof golsMandante !== "number" || typeof golsVisitante !== "number") {
    return NextResponse.json(
      { erro: "golsMandante e golsVisitante devem ser números" },
      { status: 400 }
    );
  }

  const palpite = await prisma.palpiteMataMata.upsert({
    where: { usuarioId_partidaId: { usuarioId, partidaId } },
    create: { usuarioId, partidaId, golsMandante, golsVisitante },
    update: { golsMandante, golsVisitante },
  });

  return NextResponse.json({ palpite });
}
