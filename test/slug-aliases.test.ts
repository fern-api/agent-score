import { describe, expect, it } from "vitest";
import { resolveSlugAlias } from "@/lib/slug-aliases";

describe("resolveSlugAlias", () => {
  it("maps the monday slug to the curated developer-docs entry", () => {
    expect(resolveSlugAlias("monday")).toBe("developer-monday-com-api-reference");
  });

  it("passes through slugs that have no alias", () => {
    expect(resolveSlugAlias("stripe")).toBe("stripe");
    expect(resolveSlugAlias("developer-monday-com-api-reference")).toBe("developer-monday-com-api-reference");
  });
});
