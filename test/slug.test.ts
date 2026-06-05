import { describe, expect, it } from "vitest";
import { nameToSlug, urlToSlug } from "@/lib/slug";

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
