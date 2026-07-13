import { describe, it, expect } from "vitest";
import { formatarData, formatarHora, formatarDataLonga } from "@/lib/format";

describe("format", () => {
  const testDate = "2026-06-11T19:00:00.000Z";

  describe("formatarData", () => {
    it("should format date in pt-BR format", () => {
      expect(formatarData(testDate)).toBe("11/06/2026");
    });

    it("should accept custom options", () => {
      const result = formatarData(testDate, { month: "long" });
      expect(result).toContain("junho");
    });
  });

  describe("formatarHora", () => {
    it("should format time in pt-BR format", () => {
      expect(formatarHora(testDate)).toBe("19:00");
    });
  });

  describe("formatarDataLonga", () => {
    it("should format long date with weekday", () => {
      const result = formatarDataLonga(testDate);
      expect(result).toContain("11");
      expect(result).toContain("junho");
    });
  });
});
