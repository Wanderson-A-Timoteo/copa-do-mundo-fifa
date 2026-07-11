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
      remetente: { select: { id: true, nome: true } },
      destinatario: { select: { id: true, nome: true } },
      figurinhaOferecida: {
        include: {
          selecao: { select: { id: true, nome: true, codigoPais: true, corPrimaria: true } },
          jogador: { select: { nome: true, posicao: true, fotoUrl: true, numeroCamisa: true } },
        },
      },
      figurinhaDesejada: {
        include: {
          selecao: { select: { id: true, nome: true, codigoPais: true, corPrimaria: true } },
          jogador: { select: { nome: true, posicao: true, fotoUrl: true, numeroCamisa: true } },
        },
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
    const { figurinhaOferecidaId, figurinhaDesejadaId, destinatarioId } = body;

    if (!figurinhaOferecidaId || !figurinhaDesejadaId || !destinatarioId) {
      return NextResponse.json({ erro: "Campos obrigatórios: figurinhaOferecidaId, figurinhaDesejadaId, destinatarioId" }, { status: 400 });
    }

    if (destinatarioId === usuarioId) {
      return NextResponse.json({ erro: "Você não pode criar uma troca consigo mesmo" }, { status: 400 });
    }

    const [oferecidaAlbum, desejadaAlbum, destinatario] = await Promise.all([
      prisma.albumFigurinha.findUnique({
        where: { usuarioId_figurinhaId: { usuarioId, figurinhaId: figurinhaOferecidaId } },
      }),
      prisma.albumFigurinha.findUnique({
        where: { usuarioId_figurinhaId: { usuarioId, figurinhaId: figurinhaDesejadaId } },
      }),
      prisma.user.findUnique({ where: { id: destinatarioId } }),
    ]);

    if (!oferecidaAlbum || oferecidaAlbum.quantidade < 2) {
      return NextResponse.json({ erro: "Você não tem figurinhas repetidas desta para oferecer" }, { status: 400 });
    }

    if (desejadaAlbum) {
      return NextResponse.json({ erro: "Você já tem esta figurinha no álbum" }, { status: 400 });
    }

    if (!destinatario) {
      return NextResponse.json({ erro: "Destinatário não encontrado" }, { status: 404 });
    }

    const existente = await prisma.troca.findFirst({
      where: {
        remetenteId: usuarioId,
        figurinhaOferecidaId,
        figurinhaDesejadaId,
        status: "pendente",
      },
    });

    if (existente) {
      return NextResponse.json({ erro: "Já existe uma troca pendente com estas figurinhas" }, { status: 400 });
    }

    const troca = await prisma.troca.create({
      data: {
        remetenteId: usuarioId,
        destinatarioId,
        figurinhaOferecidaId,
        figurinhaDesejadaId,
        status: "pendente",
      },
      include: {
        remetente: { select: { id: true, nome: true } },
        destinatario: { select: { id: true, nome: true } },
        figurinhaOferecida: {
          include: {
            selecao: { select: { id: true, nome: true, codigoPais: true, corPrimaria: true } },
            jogador: { select: { nome: true, posicao: true, fotoUrl: true, numeroCamisa: true } },
          },
        },
        figurinhaDesejada: {
          include: {
            selecao: { select: { id: true, nome: true, codigoPais: true, corPrimaria: true } },
            jogador: { select: { nome: true, posicao: true, fotoUrl: true, numeroCamisa: true } },
          },
        },
      },
    });

    return NextResponse.json({ troca }, { status: 201 });
  } catch {
    return NextResponse.json({ erro: "Erro ao processar solicitação" }, { status: 400 });
  }
}
