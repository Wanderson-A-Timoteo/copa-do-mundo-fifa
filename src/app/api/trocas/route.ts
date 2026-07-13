import { NextResponse } from "next/server";
import { extractUserIdFromRequest } from "@/lib/auth";
import { listarTrocas, criarTroca } from "@/services/troca.service";

export async function GET(request: Request) {
  const usuarioId = await extractUserIdFromRequest(request);
  if (!usuarioId) {
    return NextResponse.json({ erro: "Usuário não identificado" }, { status: 401 });
  }

  const url = new URL(request.url);
  const tipo = url.searchParams.get("tipo") || "recebidas";
  const trocas = await listarTrocas(usuarioId, tipo);

  return NextResponse.json({ trocas });
}

export async function POST(request: Request) {
  const usuarioId = await extractUserIdFromRequest(request);
  if (!usuarioId) {
    return NextResponse.json({ erro: "Usuário não identificado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const troca = await criarTroca(usuarioId, body);
    return NextResponse.json({ troca }, { status: 201 });
  } catch (e) {
    if (e instanceof Error) {
      const msg = e.message;
      if (msg === "MISSING_FIELDS") {
        return NextResponse.json(
          {
            erro: "Campos obrigatorios: figurinhasOferecidasIds, figurinhaDesejadaId, destinatarioId",
          },
          { status: 400 },
        );
      }
      if (msg === "SELF_TRADE") {
        return NextResponse.json(
          { erro: "Voce nao pode criar uma troca consigo mesmo" },
          { status: 400 },
        );
      }
      if (msg.startsWith("NO_DUPLICATE_")) {
        const id = msg.split("_").pop();
        return NextResponse.json(
          { erro: `Voce nao tem a figurinha ${id} repetida para oferecer` },
          { status: 400 },
        );
      }
      if (msg === "ALREADY_HAVE_DESIRED") {
        return NextResponse.json({ erro: "Voce ja tem esta figurinha no album" }, { status: 400 });
      }
      if (msg === "RECIPIENT_NOT_FOUND") {
        return NextResponse.json({ erro: "Destinatario nao encontrado" }, { status: 404 });
      }
    }
    return NextResponse.json({ erro: "Erro ao processar solicitacao" }, { status: 400 });
  }
}
