import { NextResponse } from "next/server";
import { calcularClassificacao } from "@/services/palpite.service";
import { calcularClassificacaoSimulacao } from "@/services/simulacao.service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const usuarioId = searchParams.get("usuarioId");

  if (usuarioId) {
    const grupos = await calcularClassificacaoSimulacao(Number(usuarioId));
    return NextResponse.json({ grupos });
  }

  const grupos = await calcularClassificacao();
  return NextResponse.json({ grupos });
}
