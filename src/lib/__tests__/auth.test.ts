import { describe, it, expect } from "vitest";

import {
  hashSenha,
  compararSenha,
  gerarToken,
  verificarToken,
  setTokenCookie,
  clearTokenCookie,
  getTokenFromCookie,
  getTokenFromRequest,
} from "@/lib/auth";

describe("auth", () => {
  describe("hashSenha / compararSenha", () => {
    it("should hash and verify a password", async () => {
      const hash = await hashSenha("minha-senha-123");
      expect(hash).not.toBe("minha-senha-123");
      expect(await compararSenha("minha-senha-123", hash)).toBe(true);
    });

    it("should reject wrong password", async () => {
      const hash = await hashSenha("senha-correta");
      expect(await compararSenha("senha-errada", hash)).toBe(false);
    });
  });

  describe("gerarToken / verificarToken", () => {
    it("should generate and verify a token", async () => {
      const token = await gerarToken({ userId: 42, email: "test@example.com" });
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3);

      const payload = await verificarToken(token);
      expect(payload.userId).toBe(42);
      expect(payload.email).toBe("test@example.com");
    });

    it("should reject invalid token", async () => {
      await expect(verificarToken("invalid.token.here")).rejects.toThrow();
    });
  });

  describe("cookie helpers", () => {
    it("setTokenCookie should return cookie string with token", () => {
      const cookie = setTokenCookie("abc123");
      expect(cookie).toContain("token=abc123");
      expect(cookie).toContain("Path=/");
      expect(cookie).toContain("Max-Age=604800");
      expect(cookie).toContain("HttpOnly");
      expect(cookie).toContain("SameSite=lax");
    });

    it("clearTokenCookie should expire the cookie", () => {
      const cookie = clearTokenCookie();
      expect(cookie).toContain("token=");
      expect(cookie).toContain("Max-Age=0");
      expect(cookie).toContain("Expires=Thu, 01 Jan 1970");
    });

    it("getTokenFromCookie should extract token from cookie header", () => {
      const req = new Request("http://localhost", {
        headers: { cookie: "token=jwt-value-123; other=value" },
      });
      expect(getTokenFromCookie(req)).toBe("jwt-value-123");
    });

    it("getTokenFromCookie should return null if no cookie", () => {
      const req = new Request("http://localhost");
      expect(getTokenFromCookie(req)).toBeNull();
    });

    it("getTokenFromRequest should prefer Authorization header", () => {
      const req = new Request("http://localhost", {
        headers: {
          authorization: "Bearer bearer-token",
          cookie: "token=cookie-token",
        },
      });
      expect(getTokenFromRequest(req)).toBe("bearer-token");
    });

    it("getTokenFromRequest should fall back to cookie", () => {
      const req = new Request("http://localhost", {
        headers: { cookie: "token=cookie-token" },
      });
      expect(getTokenFromRequest(req)).toBe("cookie-token");
    });
  });
});
