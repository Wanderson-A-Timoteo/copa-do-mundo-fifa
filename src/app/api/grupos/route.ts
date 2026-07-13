import { NextResponse } from "next/server";
import { calcularClassificacao } from "@/services/palpite.service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const usuarioId = searchParams.get("usuarioId");

  const grupos = await calcularClassificacao(usuarioId ? Number(usuarioId) : undefined);
  return NextResponse.json({ grupos });
}
