import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Resolve slug to user ID
  const usuario = await prisma.user.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!usuario) {
    const idNum = parseInt(slug, 10);
    if (!isNaN(idNum)) {
      const porId = await prisma.user.findUnique({
        where: { id: idNum },
        select: { id: true, slug: true },
      });
      if (porId) {
        return NextResponse.redirect(new URL(`/api/usuarios/${porId.slug}/posse`, _request.url));
      }
    }
    return NextResponse.json({ erro: "Usuário não encontrado" }, { status: 404 });
  }

  // Fetch only distinct figurinha IDs that the user owns (quantidade >= 1)
  const posse = await prisma.albumFigurinha.findMany({
    where: {
      usuarioId: usuario.id,
      quantidade: { gte: 1 },
    },
    select: { figurinhaId: true },
  });

  const idsPosse = posse.map((p) => p.figurinhaId);

  return NextResponse.json({ posse: idsPosse });
}
