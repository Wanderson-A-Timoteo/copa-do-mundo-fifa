import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { atualizarPartida } from "@/services/partida.service";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  let usuarioId: number;
  try {
    usuarioId = await requireAdmin(request);
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }
    return NextResponse.json({ erro: "Não autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const { golsMandante, golsVisitante } = await request.json();

  try {
    const partida = await atualizarPartida(Number(id), golsMandante, golsVisitante);
    return NextResponse.json({ partida });
  } catch (e) {
    if (e instanceof Error && e.message === "MATCH_NOT_FOUND") {
      return NextResponse.json({ erro: "Partida não encontrada" }, { status: 404 });
    }
    return NextResponse.json(
      { erro: "golsMandante e golsVisitante devem ser números ou ambos null" },
      { status: 400 },
    );
  }
}
