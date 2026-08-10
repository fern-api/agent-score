import { describe, expect, it } from "vitest";
import { isBlockedDomain } from "@/lib/blocked-domains";

describe("isBlockedDomain", () => {
  it("blocks adult domains and their subdomains", () => {
    expect(isBlockedDomain("https://pornhub.com")).toBe(true);
    expect(isBlockedDomain("https://www.pornhub.com")).toBe(true);
    expect(isBlockedDomain("https://cdn.pornhub.com/x")).toBe(true);
    expect(isBlockedDomain("https://onlyfans.com")).toBe(true);
  });

  it("blocks adult TLDs", () => {
    expect(isBlockedDomain("https://something.xxx")).toBe(true);
    expect(isBlockedDomain("https://foo.adult")).toBe(true);
  });

  it("hard-blocks the monday.com apex (and www) but not its docs subdomains", () => {
    expect(isBlockedDomain("https://monday.com")).toBe(true);
    expect(isBlockedDomain("https://www.monday.com")).toBe(true);
    expect(isBlockedDomain("https://developers.monday.com")).toBe(false);
  });

  it("does not block ordinary docs sites", () => {
    expect(isBlockedDomain("https://docs.stripe.com")).toBe(false);
    expect(isBlockedDomain("https://example.com/docs")).toBe(false);
  });
});
