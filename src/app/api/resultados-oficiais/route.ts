import { NextResponse } from "next/server";

import { salvarResultadoOficial } from "@/services/palpite.service";

export async function GET() {
  const { prisma } = await import("@/lib/prisma");
  const resultados = await prisma.resultadoOficial.findMany();
  return NextResponse.json({ resultados });
}

export async function POST(request: Request) {
  try {
    const { requireAdmin } = await import("@/lib/auth");
    await requireAdmin(request);
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }
    return NextResponse.json({ erro: "Não autorizado" }, { status: 403 });
  }

  const { partidaId, golsMandante, golsVisitante, penaltisMandante, penaltisVisitante } =
    await request.json();

  if (!partidaId || typeof partidaId !== "number") {
    return NextResponse.json({ erro: "partidaId é obrigatório" }, { status: 400 });
  }

  try {
    const result = await salvarResultadoOficial(
      partidaId,
      golsMandante,
      golsVisitante,
      penaltisMandante,
      penaltisVisitante,
    );
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { erro: "golsMandante e golsVisitante devem ser números" },
      { status: 400 },
    );
  }
}
