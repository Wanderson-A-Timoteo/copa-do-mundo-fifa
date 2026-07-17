import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // Retornamos um secret genérico apenas durante o build time para evitar crash no Vercel
    if (process.env.NODE_ENV === "production" && process.env.VERCEL) {
       return new TextEncoder().encode("dummy-secret-for-build-time-only-12345");
    }
    throw new Error("JWT_SECRET não está definido. Configure a variável de ambiente JWT_SECRET.");
  }
  return new TextEncoder().encode(secret);
}

export interface TokenPayload {
  userId: number;
  email: string;
}

export async function hashSenha(senha: string): Promise<string> {
  return bcrypt.hash(senha, 10);
}

export async function compararSenha(senha: string, hash: string): Promise<boolean> {
  return bcrypt.compare(senha, hash);
}

export async function gerarToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verificarToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, getSecret());
  return { userId: payload.userId as number, email: payload.email as string };
}

const TOKEN_COOKIE = "token";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 7 * 24 * 60 * 60,
};

export function setTokenCookie(token: string): string {
  const expires = new Date(Date.now() + COOKIE_OPTIONS.maxAge * 1000).toUTCString();
  return [
    `${TOKEN_COOKIE}=${token}`,
    `Path=${COOKIE_OPTIONS.path}`,
    `Max-Age=${COOKIE_OPTIONS.maxAge}`,
    `Expires=${expires}`,
    COOKIE_OPTIONS.httpOnly ? "HttpOnly" : "",
    COOKIE_OPTIONS.secure ? "Secure" : "",
    `SameSite=${COOKIE_OPTIONS.sameSite}`,
  ]
    .filter(Boolean)
    .join("; ");
}

export function clearTokenCookie(): string {
  return [
    `${TOKEN_COOKIE}=`,
    `Path=${COOKIE_OPTIONS.path}`,
    "Max-Age=0",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    COOKIE_OPTIONS.httpOnly ? "HttpOnly" : "",
    COOKIE_OPTIONS.secure ? "Secure" : "",
    `SameSite=${COOKIE_OPTIONS.sameSite}`,
  ]
    .filter(Boolean)
    .join("; ");
}

export function getTokenFromCookie(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${TOKEN_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function getTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }
  return getTokenFromCookie(request);
}

export async function extractUserIdFromRequest(request: Request): Promise<number | null> {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  try {
    return (await verificarToken(token)).userId;
  } catch {
    return null;
  }
}

export async function requireAuth(request: Request): Promise<number> {
  const userId = await extractUserIdFromRequest(request);
  if (!userId) throw new Error("UNAUTHORIZED");
  return userId;
}

export async function requireAdmin(request: Request): Promise<number> {
  const userId = await requireAuth(request);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "ADMIN") throw new Error("FORBIDDEN");
  return userId;
}
