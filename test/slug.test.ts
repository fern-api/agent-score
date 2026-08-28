import { describe, expect, it } from "vitest";
import { isValidName, isValidSlug, nameToSlug, urlToSlug } from "@/lib/slug";

describe("nameToSlug", () => {
  it("derives a company slug from a display name", () => {
    expect(nameToSlug("Monday")).toBe("monday");
    expect(nameToSlug("monday.com")).toBe("monday-com");
    expect(nameToSlug("Acme Pay")).toBe("acme-pay");
  });
});

describe("urlToSlug", () => {
  it("includes the path for path-scoped URLs", () => {
    expect(urlToSlug("https://developer.monday.com/api-reference")).toBe("developer-monday-com-api-reference");
  });

  it("uses just the host (www stripped) for bare domains", () => {
    expect(urlToSlug("https://www.monday.com")).toBe("monday-com");
  });

  it("falls back to 'unknown' for an unparseable URL", () => {
    expect(urlToSlug("::::")).toBe("unknown");
  });
});

describe("isValidSlug", () => {
  it("accepts the slugs we generate", () => {
    expect(isValidSlug("middesk")).toBe(true);
    expect(isValidSlug("developer-monday-com-api-reference")).toBe(true);
    expect(isValidSlug(nameToSlug("Acme Pay"))).toBe(true);
    expect(isValidSlug(urlToSlug("https://docs.nvidia.com/dynamo"))).toBe(true);
  });

  it("rejects scanner payloads that polluted the leaderboard", () => {
    expect(isValidSlug("middesk0'XOR(if(now()=sysdate(),sleep(15),0))XOR'Z")).toBe(false);
    expect(isValidSlug("auth0-1 waitfor delay '0:0:15' -- ")).toBe(false);
    expect(isValidSlug("middeskjrOdmAtt' OR 153=(SELECT 153 FROM PG_SLEEP(15))--")).toBe(false);
    expect(isValidSlug("(select 198766*667891)")).toBe(false);
    expect(isValidSlug("@@sJMry")).toBe(false);
    expect(isValidSlug("Middesk")).toBe(false);
    expect(isValidSlug("-middesk")).toBe(false);
    expect(isValidSlug("")).toBe(false);
    expect(isValidSlug("m".repeat(81))).toBe(false);
  });
});

describe("isValidName", () => {
  it("accepts display names", () => {
    expect(isValidName("Middesk")).toBe(true);
    expect(isValidName("monday.com")).toBe(true);
  });

  it("rejects markup, control characters, and overlong names", () => {
    expect(isValidName('<script>alert(1)</script>')).toBe(false);
    expect(isValidName("bad\u0000name")).toBe(false);
    expect(isValidName("  ")).toBe(false);
    expect(isValidName("M".repeat(61))).toBe(false);
  });
});
