import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verificarToken, getTokenFromRequest } from "@/lib/auth";

async function getUsuarioId(request: Request): Promise<number | null> {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  try {
    return (await verificarToken(token)).userId;
  } catch {
    return null;
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const usuarioId = await getUsuarioId(request);
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
      return NextResponse.json(
        { erro: "Ação inválida. Use 'aceitar' ou 'recusar'" },
        { status: 400 },
      );
    }

    const troca = await prisma.troca.findUnique({
      where: { id: trocaId },
      include: { figurinhasOferecidas: true },
    });

    if (!troca) {
      return NextResponse.json({ erro: "Troca não encontrada" }, { status: 404 });
    }

    if (troca.destinatarioId !== usuarioId) {
      return NextResponse.json(
        { erro: "Apenas o destinatário pode aceitar ou recusar esta troca" },
        { status: 403 },
      );
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

    const oferecidasIds = troca.figurinhasOferecidas.map((o) => o.figurinhaId);

    const [oferecidasRemetente, desejadaDestinatario] = await Promise.all([
      prisma.albumFigurinha.findMany({
        where: { usuarioId: troca.remetenteId, figurinhaId: { in: oferecidasIds } },
      }),
      prisma.albumFigurinha.findUnique({
        where: {
          usuarioId_figurinhaId: {
            usuarioId: troca.destinatarioId,
            figurinhaId: troca.figurinhaDesejadaId,
          },
        },
      }),
    ]);

    for (const id of oferecidasIds) {
      const item = oferecidasRemetente.find((i) => i.figurinhaId === id);
      if (!item || item.quantidade < 2) {
        await prisma.troca.update({ where: { id: trocaId }, data: { status: "recusada" } });
        return NextResponse.json(
          {
            erro: "O remetente não tem mais todas as figurinhas repetidas. Troca recusada automaticamente.",
          },
          { status: 400 },
        );
      }
    }

    if (!desejadaDestinatario || desejadaDestinatario.quantidade < 1) {
      await prisma.troca.update({ where: { id: trocaId }, data: { status: "recusada" } });
      return NextResponse.json(
        { erro: "Você não tem a figurinha desejada. Troca recusada automaticamente." },
        { status: 400 },
      );
    }

    const operacoes: any[] = [
      prisma.troca.update({ where: { id: trocaId }, data: { status: "aceita" } }),
    ];

    for (const id of oferecidasIds) {
      operacoes.push(
        prisma.albumFigurinha.update({
          where: { usuarioId_figurinhaId: { usuarioId: troca.remetenteId, figurinhaId: id } },
          data: { quantidade: { decrement: 1 } },
        }),
        prisma.albumFigurinha.upsert({
          where: { usuarioId_figurinhaId: { usuarioId: troca.destinatarioId, figurinhaId: id } },
          create: { usuarioId: troca.destinatarioId, figurinhaId: id, quantidade: 1 },
          update: { quantidade: { increment: 1 } },
        }),
      );
    }

    operacoes.push(
      prisma.albumFigurinha.update({
        where: {
          usuarioId_figurinhaId: {
            usuarioId: troca.destinatarioId,
            figurinhaId: troca.figurinhaDesejadaId,
          },
        },
        data: { quantidade: { decrement: 1 } },
      }),
      prisma.albumFigurinha.upsert({
        where: {
          usuarioId_figurinhaId: {
            usuarioId: troca.remetenteId,
            figurinhaId: troca.figurinhaDesejadaId,
          },
        },
        create: {
          usuarioId: troca.remetenteId,
          figurinhaId: troca.figurinhaDesejadaId,
          quantidade: 1,
        },
        update: { quantidade: { increment: 1 } },
      }),
    );

    await prisma.$transaction(operacoes);

    return NextResponse.json({ mensagem: "Troca aceita com sucesso!" });
  } catch {
    return NextResponse.json({ erro: "Erro ao processar solicitação" }, { status: 400 });
  }
}
