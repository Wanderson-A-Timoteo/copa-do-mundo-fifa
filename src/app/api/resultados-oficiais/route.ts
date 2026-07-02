import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verificarToken } from "@/lib/auth";

export async function GET() {
  const resultados = await prisma.resultadoOficial.findMany();
  return NextResponse.json({ resultados });
}

export async function POST(request: Request) {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }
  let payload;
  try {
    payload = verificarToken(auth.slice(7));
  } catch {
    return NextResponse.json({ erro: "Token inválido" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 403 });
  }

  const { partidaId, golsMandante, golsVisitante, penaltisMandante, penaltisVisitante } = await request.json();

  if (!partidaId || typeof partidaId !== "number") {
    return NextResponse.json({ erro: "partidaId é obrigatório" }, { status: 400 });
  }

  const isLimpar = golsMandante === null && golsVisitante === null;

  if (isLimpar) {
    await prisma.resultadoOficial.deleteMany({ where: { partidaId } });
    return NextResponse.json({ sucesso: true, limpo: true });
  }

  if (typeof golsMandante !== "number" || typeof golsVisitante !== "number") {
    return NextResponse.json(
      { erro: "golsMandante e golsVisitante devem ser números" },
      { status: 400 }
    );
  }

  const data: Record<string, unknown> = { golsMandante, golsVisitante };
  if (penaltisMandante !== undefined) data.penaltisMandante = penaltisMandante;
  if (penaltisVisitante !== undefined) data.penaltisVisitante = penaltisVisitante;

  const resultado = await prisma.resultadoOficial.upsert({
    where: { partidaId },
    create: { partidaId, ...data } as never,
    update: data,
  });

  return NextResponse.json({ resultado });
}
