import { NextResponse } from "next/server";
import { extractUserIdFromRequest } from "@/lib/auth";
import { responderTroca } from "@/services/troca.service";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const usuarioId = await extractUserIdFromRequest(request);
  if (!usuarioId) {
    return NextResponse.json({ erro: "Usuário não identificado" }, { status: 401 });
  }

  const { id } = await params;
  const trocaId = parseInt(id, 10);

  if (isNaN(trocaId)) {
    return NextResponse.json({ erro: "ID inválido" }, { status: 400 });
  }

  try {
    const { acao } = await request.json();

    if (!acao || !["aceitar", "recusar"].includes(acao)) {
      return NextResponse.json(
        { erro: "Ação inválida. Use 'aceitar' ou 'recusar'" },
        { status: 400 },
      );
    }

    await responderTroca(usuarioId, trocaId, acao);
    return NextResponse.json({
      mensagem: acao === "aceitar" ? "Troca aceita com sucesso!" : "Troca recusada com sucesso",
    });
  } catch (e) {
    if (e instanceof Error) {
      const msg = e.message;
      if (msg === "TRADE_NOT_FOUND") {
        return NextResponse.json({ erro: "Troca não encontrada" }, { status: 404 });
      }
      if (msg === "NOT_RECIPIENT") {
        return NextResponse.json(
          { erro: "Apenas o destinatário pode aceitar ou recusar esta troca" },
          { status: 403 },
        );
      }
      if (msg === "TRADE_NOT_PENDING") {
        return NextResponse.json({ erro: "Esta troca já foi processada" }, { status: 400 });
      }
      if (msg === "SENDER_NO_DUPLICATES") {
        return NextResponse.json(
          {
            erro: "O remetente não tem mais todas as figurinhas repetidas. Troca recusada automaticamente.",
          },
          { status: 400 },
        );
      }
      if (msg === "RECIPIENT_NO_DESIRED") {
        return NextResponse.json(
          { erro: "Você não tem a figurinha desejada. Troca recusada automaticamente." },
          { status: 400 },
        );
      }
    }
    return NextResponse.json({ erro: "Erro ao processar solicitação" }, { status: 400 });
  }
}
