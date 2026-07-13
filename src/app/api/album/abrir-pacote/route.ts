import { NextResponse } from "next/server";
import { extractUserIdFromRequest } from "@/lib/auth";
import { abrirPacote } from "@/services/album.service";

export async function POST(request: Request) {
  const usuarioId = await extractUserIdFromRequest(request);
  if (!usuarioId) {
    return NextResponse.json({ erro: "Usuário não identificado" }, { status: 401 });
  }

  try {
    const result = await abrirPacote(usuarioId);
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof Error) {
      if (e.message === "USER_NOT_FOUND") {
        return NextResponse.json({ erro: "Usuário não encontrado" }, { status: 404 });
      }
      if (e.message === "DAILY_LIMIT_REACHED") {
        return NextResponse.json(
          { erro: "Limite diário de pacotes atingido", pacotesRestantesHoje: 0, limiteDiario: 10 },
          { status: 429 },
        );
      }
    }
    return NextResponse.json({ erro: "Erro ao processar pacote" }, { status: 500 });
  }
}
