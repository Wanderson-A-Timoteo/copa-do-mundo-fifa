import { NextResponse } from "next/server";
import { extractUserIdFromRequest } from "@/lib/auth";
import { getAlbum, adicionarFigurinha, removerFigurinha } from "@/services/album.service";

export async function GET(request: Request) {
  const usuarioId = await extractUserIdFromRequest(request);
  if (!usuarioId) {
    return NextResponse.json({ erro: "Usuário não identificado" }, { status: 401 });
  }

  const result = await getAlbum(usuarioId);
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const usuarioId = await extractUserIdFromRequest(request);
  if (!usuarioId) {
    return NextResponse.json({ erro: "Usuário não identificado" }, { status: 401 });
  }

  const { figurinhaId } = await request.json();
  await adicionarFigurinha(usuarioId, figurinhaId);

  return NextResponse.json({ sucesso: true });
}

export async function DELETE(request: Request) {
  const usuarioId = await extractUserIdFromRequest(request);
  if (!usuarioId) {
    return NextResponse.json({ erro: "Usuário não identificado" }, { status: 401 });
  }

  const { figurinhaId, removerTudo } = await request.json();
  await removerFigurinha(usuarioId, figurinhaId, removerTudo);

  return NextResponse.json({ sucesso: true });
}
