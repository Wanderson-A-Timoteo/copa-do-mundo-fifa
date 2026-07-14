import { describe, it, expect, beforeEach, vi } from "vitest";
import { checkRateLimit, getRateLimitHeaders, getClientIp } from "@/lib/rate-limit";

describe("rate-limit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    return () => vi.useRealTimers();
  });

  describe("checkRateLimit", () => {
    it("should allow first request", () => {
      const result = checkRateLimit("test-key", 5, 60_000);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it("should track multiple requests", () => {
      checkRateLimit("track-key", 3, 60_000);
      checkRateLimit("track-key", 3, 60_000);
      const result = checkRateLimit("track-key", 3, 60_000);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(0);
    });

    it("should block when limit exceeded", () => {
      checkRateLimit("block-key", 2, 60_000);
      checkRateLimit("block-key", 2, 60_000);
      const result = checkRateLimit("block-key", 2, 60_000);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it("should reset after window expires", () => {
      checkRateLimit("reset-key", 1, 10_000);
      const blocked = checkRateLimit("reset-key", 1, 10_000);
      expect(blocked.allowed).toBe(false);

      vi.advanceTimersByTime(11_000);

      const allowed = checkRateLimit("reset-key", 1, 10_000);
      expect(allowed.allowed).toBe(true);
    });
  });

  describe("getRateLimitHeaders", () => {
    it("should return standard headers", () => {
      const result = checkRateLimit("hdr-key", 5, 60_000);
      const headers = getRateLimitHeaders(result);
      expect(headers["X-RateLimit-Remaining"]).toBe("4");
      expect(headers["X-RateLimit-Reset"]).toBeDefined();
    });

    it("should include Retry-After when blocked", () => {
      checkRateLimit("retry-key", 1, 30_000);
      const blocked = checkRateLimit("retry-key", 1, 30_000);
      const headers = getRateLimitHeaders(blocked);
      expect(headers["Retry-After"]).toBeDefined();
      expect(Number(headers["Retry-After"])).toBeGreaterThan(0);
    });
  });

  describe("getClientIp", () => {
    it("should extract IP from x-forwarded-for", () => {
      const req = new Request("http://localhost", {
        headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
      });
      expect(getClientIp(req)).toBe("1.2.3.4");
    });

    it("should fall back to x-real-ip", () => {
      const req = new Request("http://localhost", {
        headers: { "x-real-ip": "9.8.7.6" },
      });
      expect(getClientIp(req)).toBe("9.8.7.6");
    });

    it("should return unknown if no headers", () => {
      const req = new Request("http://localhost");
      expect(getClientIp(req)).toBe("unknown");
    });
  });
});
