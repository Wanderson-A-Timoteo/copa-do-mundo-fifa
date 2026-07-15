import { NextResponse } from "next/server";
import { apurarPartida } from "@/services/apurador.service";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    await requireAdmin(request);
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }
    return NextResponse.json({ erro: "Acesso restrito" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { partidaId } = body;

    if (!partidaId || typeof partidaId !== "number") {
      return NextResponse.json({ erro: "partidaId inválido" }, { status: 400 });
    }

    const resultado = await apurarPartida(partidaId);
    return NextResponse.json(resultado);
  } catch (error: any) {
    console.error("Erro na apuração:", error);
    return NextResponse.json({ erro: error.message || "Erro interno" }, { status: 500 });
  }
}
