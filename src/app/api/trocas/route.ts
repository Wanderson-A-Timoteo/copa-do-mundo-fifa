import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verificarToken, getTokenFromRequest } from "@/lib/auth";

function getUsuarioId(request: Request): number | null {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  try {
    return verificarToken(token).userId;
  } catch {
    return null;
  }
}

const figurinhaInclude = {
  selecao: { select: { id: true, nome: true, codigoPais: true, corPrimaria: true } },
  jogador: { select: { nome: true, posicao: true, fotoUrl: true, numeroCamisa: true, dataNascimento: true, altura: true, peso: true, figurinha: { select: { raridade: true } } } },
};

export async function GET(request: Request) {
  const usuarioId = getUsuarioId(request);
  if (!usuarioId) {
    return NextResponse.json({ erro: "Usuário não identificado" }, { status: 401 });
  }

  const url = new URL(request.url);
  const tipo = url.searchParams.get("tipo") || "recebidas";

  const where = tipo === "enviadas"
    ? { remetenteId: usuarioId }
    : { destinatarioId: usuarioId };

  const trocas = await prisma.troca.findMany({
    where,
    include: {
      remetente: { select: { id: true, nome: true, slug: true } },
      destinatario: { select: { id: true, nome: true, slug: true } },
      figurinhaDesejada: { include: figurinhaInclude },
      figurinhasOferecidas: {
        include: { figurinha: { include: figurinhaInclude } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ trocas });
}

export async function POST(request: Request) {
  const usuarioId = getUsuarioId(request);
  if (!usuarioId) {
    return NextResponse.json({ erro: "Usuário não identificado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { figurinhasOferecidasIds, figurinhaDesejadaId, destinatarioId } = body;

    if (!figurinhasOferecidasIds?.length || !figurinhaDesejadaId || !destinatarioId) {
      return NextResponse.json({ erro: "Campos obrigatorios: figurinhasOferecidasIds (array), figurinhaDesejadaId, destinatarioId" }, { status: 400 });
    }

    if (destinatarioId === usuarioId) {
      return NextResponse.json({ erro: "Voce nao pode criar uma troca consigo mesmo" }, { status: 400 });
    }

    const [itensAlbum, desejadaAlbum, destinatario] = await Promise.all([
      prisma.albumFigurinha.findMany({
        where: { usuarioId, figurinhaId: { in: figurinhasOferecidasIds } },
      }),
      prisma.albumFigurinha.findUnique({
        where: { usuarioId_figurinhaId: { usuarioId, figurinhaId: figurinhaDesejadaId } },
      }),
      prisma.user.findUnique({ where: { id: destinatarioId } }),
    ]);

    for (const id of figurinhasOferecidasIds) {
      const item = itensAlbum.find(i => i.figurinhaId === id);
      if (!item || item.quantidade < 2) {
        return NextResponse.json({ erro: `Voce nao tem a figurinha ${id} repetida para oferecer` }, { status: 400 });
      }
    }

    if (desejadaAlbum) {
      return NextResponse.json({ erro: "Voce ja tem esta figurinha no album" }, { status: 400 });
    }

    if (!destinatario) {
      return NextResponse.json({ erro: "Destinatario nao encontrado" }, { status: 404 });
    }

    const troca = await prisma.troca.create({
      data: {
        remetenteId: usuarioId,
        destinatarioId,
        figurinhaDesejadaId,
        figurinhasOferecidas: {
          create: figurinhasOferecidasIds.map((id: number) => ({ figurinhaId: id })),
        },
      },
      include: {
        remetente: { select: { id: true, nome: true } },
        destinatario: { select: { id: true, nome: true } },
        figurinhaDesejada: { include: figurinhaInclude },
        figurinhasOferecidas: {
          include: { figurinha: { include: figurinhaInclude } },
        },
      },
    });

    return NextResponse.json({ troca }, { status: 201 });
  } catch {
    return NextResponse.json({ erro: "Erro ao processar solicitacao" }, { status: 400 });
  }
}
