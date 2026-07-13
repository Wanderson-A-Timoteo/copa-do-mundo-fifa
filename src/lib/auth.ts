import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET não está definido. Configure a variável de ambiente JWT_SECRET.");
}

const SECRET = new TextEncoder().encode(JWT_SECRET);

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
  return new SignJWT({ userId: payload.userId, email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verificarToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, SECRET);
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
