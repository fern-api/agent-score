import { describe, expect, it } from "vitest";
import { resolveSlugAlias } from "@/lib/slug-aliases";

describe("resolveSlugAlias", () => {
  it("passes through slugs that have no alias", () => {
    expect(resolveSlugAlias("stripe")).toBe("stripe");
    expect(resolveSlugAlias("developer-monday-com-api-reference")).toBe("developer-monday-com-api-reference");
  });

  it("does not redirect the monday apex slug (alias intentionally disabled — the apex is hard-blocked instead)", () => {
    expect(resolveSlugAlias("monday")).toBe("monday");
  });
});
