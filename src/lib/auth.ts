import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error(
    "JWT_SECRET não está definido. Configure a variável de ambiente JWT_SECRET."
  );
}

export interface TokenPayload {
  userId: number;
  email: string;
}

export async function hashSenha(senha: string): Promise<string> {
  return bcrypt.hash(senha, 10);
}

export async function compararSenha(
  senha: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(senha, hash);
}

export function gerarToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET!, { expiresIn: "7d" });
}

export function verificarToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET!) as TokenPayload;
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
