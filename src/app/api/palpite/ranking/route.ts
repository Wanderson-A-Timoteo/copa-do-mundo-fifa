import { NextResponse } from "next/server";
import { getRanking } from "@/services/palpite.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const ranking = await getRanking();
    return NextResponse.json({ ranking });
  } catch (error) {
    console.error("Erro ao buscar ranking:", error);
    return NextResponse.json({ erro: "Falha ao buscar ranking" }, { status: 500 });
  }
}
