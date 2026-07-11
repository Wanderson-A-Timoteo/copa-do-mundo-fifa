import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verificarToken } from "@/lib/auth";

function getUsuarioId(request: Request): number | null {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  try {
    return verificarToken(auth.slice(7)).userId;
  } catch {
    return null;
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const usuarioId = getUsuarioId(request);
  if (!usuarioId) {
    return NextResponse.json({ erro: "Usuário não identificado" }, { status: 401 });
  }

  const { id } = await params;
  const trocaId = parseInt(id, 10);

  if (isNaN(trocaId)) {
    return NextResponse.json({ erro: "ID inválido" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { acao } = body;

    if (!acao || !["aceitar", "recusar"].includes(acao)) {
      return NextResponse.json({ erro: "Ação inválida. Use 'aceitar' ou 'recusar'" }, { status: 400 });
    }

    const troca = await prisma.troca.findUnique({
      where: { id: trocaId },
    });

    if (!troca) {
      return NextResponse.json({ erro: "Troca não encontrada" }, { status: 404 });
    }

    if (troca.destinatarioId !== usuarioId) {
      return NextResponse.json({ erro: "Apenas o destinatário pode aceitar ou recusar esta troca" }, { status: 403 });
    }

    if (troca.status !== "pendente") {
      return NextResponse.json({ erro: "Esta troca já foi " + troca.status }, { status: 400 });
    }

    if (acao === "recusar") {
      await prisma.troca.update({
        where: { id: trocaId },
        data: { status: "recusada" },
      });

      return NextResponse.json({ mensagem: "Troca recusada com sucesso" });
    }

    const [oferecidaRemetente, desejadaDestinatario] = await Promise.all([
      prisma.albumFigurinha.findUnique({
        where: { usuarioId_figurinhaId: { usuarioId: troca.remetenteId, figurinhaId: troca.figurinhaOferecidaId } },
      }),
      prisma.albumFigurinha.findUnique({
        where: { usuarioId_figurinhaId: { usuarioId: troca.destinatarioId, figurinhaId: troca.figurinhaDesejadaId } },
      }),
    ]);

    if (!oferecidaRemetente || oferecidaRemetente.quantidade < 2) {
      await prisma.troca.update({ where: { id: trocaId }, data: { status: "recusada" } });
      return NextResponse.json({ erro: "O remetente não tem mais esta figurinha repetida. Troca recusada automaticamente." }, { status: 400 });
    }

    if (!desejadaDestinatario || desejadaDestinatario.quantidade < 1) {
      await prisma.troca.update({ where: { id: trocaId }, data: { status: "recusada" } });
      return NextResponse.json({ erro: "Você não tem a figurinha desejada. Troca recusada automaticamente." }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.albumFigurinha.update({
        where: { usuarioId_figurinhaId: { usuarioId: troca.remetenteId, figurinhaId: troca.figurinhaOferecidaId } },
        data: { quantidade: { decrement: 1 } },
      }),
      prisma.albumFigurinha.upsert({
        where: { usuarioId_figurinhaId: { usuarioId: troca.remetenteId, figurinhaId: troca.figurinhaDesejadaId } },
        create: { usuarioId: troca.remetenteId, figurinhaId: troca.figurinhaDesejadaId, quantidade: 1 },
        update: { quantidade: { increment: 1 } },
      }),
      prisma.albumFigurinha.update({
        where: { usuarioId_figurinhaId: { usuarioId: troca.destinatarioId, figurinhaId: troca.figurinhaDesejadaId } },
        data: { quantidade: { decrement: 1 } },
      }),
      prisma.albumFigurinha.upsert({
        where: { usuarioId_figurinhaId: { usuarioId: troca.destinatarioId, figurinhaId: troca.figurinhaOferecidaId } },
        create: { usuarioId: troca.destinatarioId, figurinhaId: troca.figurinhaOferecidaId, quantidade: 1 },
        update: { quantidade: { increment: 1 } },
      }),
      prisma.troca.update({
        where: { id: trocaId },
        data: { status: "aceita" },
      }),
    ]);

    return NextResponse.json({ mensagem: "Troca aceita com sucesso!" });
  } catch {
    return NextResponse.json({ erro: "Erro ao processar solicitação" }, { status: 400 });
  }
}
