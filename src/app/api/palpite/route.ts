import { NextResponse } from "next/server";
import { extractUserIdFromRequest } from "@/lib/auth";
import { listarPalpites, salvarPalpite } from "@/services/palpite.service";

export async function GET(request: Request) {
  const usuarioId = await extractUserIdFromRequest(request);
  if (!usuarioId) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const partidaId = searchParams.get("partidaId");

  const palpites = await listarPalpites(usuarioId, partidaId ? Number(partidaId) : undefined);
  return NextResponse.json({ palpites });
}

export async function POST(request: Request) {
  const usuarioId = await extractUserIdFromRequest(request);
  if (!usuarioId) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  const { partidaId, golsMandante, golsVisitante } = await request.json();

  if (!partidaId || typeof partidaId !== "number") {
    return NextResponse.json({ erro: "partidaId é obrigatório" }, { status: 400 });
  }

  try {
    const result = await salvarPalpite(usuarioId, partidaId, golsMandante, golsVisitante);
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof Error && e.message === "MATCH_NOT_FOUND") {
      return NextResponse.json({ erro: "Partida não encontrada" }, { status: 404 });
    }
    return NextResponse.json(
      { erro: "golsMandante e golsVisitante devem ser números" },
      { status: 400 },
    );
  }
}
