import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production" && process.env.VERCEL) {
      return new TextEncoder().encode("dummy-secret-for-build-time-only-12345");
    }
    throw new Error("JWT_SECRET não está definido. Configure a variável de ambiente JWT_SECRET.");
  }
  return new TextEncoder().encode(secret);
}

const PUBLIC_ROUTES = ["/", "/login", "/cadastro"];

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname)) return true;

  if (
    pathname.startsWith("/selecoes") ||
    pathname.startsWith("/estadios") ||
    pathname.startsWith("/tabela") ||
    pathname.startsWith("/perfil")
  ) {
    return true;
  }

  if (
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/auth/cadastro") ||
    pathname.startsWith("/api/auth/google") ||
    pathname.startsWith("/api/grupos") ||
    pathname.startsWith("/api/selecoes") ||
    pathname.startsWith("/api/estadios") ||
    pathname.startsWith("/api/partidas") ||
    pathname.startsWith("/api/figurinhas") ||
    pathname.startsWith("/api/resultados-oficiais") ||
    pathname.startsWith("/api/usuarios/")
  ) {
    return true;
  }

  return false;
}

async function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  let token: string | null = null;

  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    token = request.cookies.get("token")?.value ?? null;
  }

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as { userId: number; email: string };
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon")) {
    return NextResponse.next();
  }

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  const user = await verifyToken(request);

  if (pathname.startsWith("/api/")) {
    if (!user) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
