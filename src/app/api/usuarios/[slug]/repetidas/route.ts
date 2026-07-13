import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { figurinhaInclude } from "@/lib/prisma-selects";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const usuario = await prisma.user.findUnique({
    where: { slug },
    select: { id: true, nome: true, slug: true },
  });

  if (!usuario) {
    const idNum = parseInt(slug, 10);
    if (!isNaN(idNum)) {
      const porId = await prisma.user.findUnique({
        where: { id: idNum },
        select: { id: true, nome: true, slug: true },
      });
      if (porId) {
        return NextResponse.redirect(
          new URL(`/api/usuarios/${porId.slug}/repetidas`, _request.url),
        );
      }
    }
    return NextResponse.json({ erro: "Usuário não encontrado" }, { status: 404 });
  }

  const repetidas = await prisma.albumFigurinha.findMany({
    where: { usuarioId: usuario.id, quantidade: { gte: 2 } },
    select: {
      quantidade: true,
      figurinhaId: true,
      figurinha: {
        select: {
          id: true,
          slug: true,
          numero: true,
          raridade: true,
          ...figurinhaInclude,
        },
      },
    },
    orderBy: { figurinha: { selecao: { nome: "asc" } } },
  });

  return NextResponse.json({ usuario, repetidas });
}
