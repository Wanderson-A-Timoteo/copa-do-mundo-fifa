import { NextResponse } from "next/server";
import { getRanking } from "@/services/palpite.service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");

    const page = pageParam ? parseInt(pageParam, 10) : undefined;
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    const data = await getRanking(page, limit);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao buscar ranking:", error);
    return NextResponse.json({ erro: "Falha ao buscar ranking" }, { status: 500 });
  }
}
