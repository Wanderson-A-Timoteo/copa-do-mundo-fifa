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

const LIMITE_DIARIO = 10;
const QTD_PACOTE = 7;

export async function POST(request: Request) {
  const usuarioId = getUsuarioId(request);
  if (!usuarioId) {
    return NextResponse.json({ erro: "Usuário não identificado" }, { status: 401 });
  }

  const usuario = await prisma.user.findUnique({ where: { id: usuarioId } });
  if (!usuario) {
    return NextResponse.json({ erro: "Usuário não encontrado" }, { status: 404 });
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  let pacotesHoje = usuario.pacotesAbertosHoje;
  if (!usuario.ultimoDiaAbertura || new Date(usuario.ultimoDiaAbertura) < hoje) {
    pacotesHoje = 0;
  }

  if (pacotesHoje >= LIMITE_DIARIO) {
    return NextResponse.json(
      { erro: "Limite diário de pacotes atingido", pacotesRestantesHoje: 0, limiteDiario: LIMITE_DIARIO },
      { status: 429 }
    );
  }

  const total = await prisma.figurinha.count();
  if (total === 0) {
    return NextResponse.json({ erro: "Nenhuma figurinha disponível" }, { status: 500 });
  }

  const indices: number[] = [];
  while (indices.length < QTD_PACOTE) {
    const idx = Math.floor(Math.random() * total);
    if (!indices.includes(idx)) indices.push(idx);
  }

  const todasFigs = await prisma.figurinha.findMany({
    include: { selecao: true, jogador: true },
  });

  const pacote = indices.map((i) => todasFigs[i]);

  for (const fig of pacote) {
    const existente = await prisma.albumFigurinha.findUnique({
      where: { usuarioId_figurinhaId: { usuarioId, figurinhaId: fig.id } },
    });

    if (existente) {
      await prisma.albumFigurinha.update({
        where: { id: existente.id },
        data: { quantidade: existente.quantidade + 1 },
      });
    } else {
      await prisma.albumFigurinha.create({
        data: { usuarioId, figurinhaId: fig.id },
      });
    }
  }

  await prisma.user.update({
    where: { id: usuarioId },
    data: {
      ultimoDiaAbertura: new Date(),
      pacotesAbertosHoje: pacotesHoje + 1,
    },
  });

  return NextResponse.json({
    figurinhas: pacote.map((f) => ({
      id: f.id,
      numero: f.numero,
      tipo: f.tipo,
      raridade: f.raridade,
      selecao: { id: f.selecao.id, nome: f.selecao.nome, codigoPais: f.selecao.codigoPais, corPrimaria: f.selecao.corPrimaria },
      jogador: f.jogador ? { nome: f.jogador.nome, posicao: f.jogador.posicao } : null,
    })),
    pacotesRestantesHoje: LIMITE_DIARIO - pacotesHoje - 1,
    limiteDiario: LIMITE_DIARIO,
  });
}
