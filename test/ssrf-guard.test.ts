import http from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { guardedDispatcher, isPublicAddress, resolvesToPublicAddress } from "@/lib/ssrf-guard";

describe("isPublicAddress", () => {
  it.each([
    "127.0.0.1",
    "10.1.2.3",
    "172.16.0.1",
    "192.168.1.1",
    "169.254.169.254",
    "100.64.0.1",
    "0.0.0.0",
    "::1",
    "::",
    "fe80::1",
    "fc00::1",
    "fd00:ec2::254",
    "::ffff:169.254.169.254",
    "::ffff:127.0.0.1",
    "not-an-ip",
  ])("blocks %s", (ip) => {
    expect(isPublicAddress(ip)).toBe(false);
  });

  it.each(["8.8.8.8", "195.63.133.197", "2606:4700:4700::1111"])("allows %s", (ip) => {
    expect(isPublicAddress(ip)).toBe(true);
  });
});

describe("resolvesToPublicAddress", () => {
  it.each([
    "http://169.254.169.254/latest/meta-data/",
    "http://127.0.0.1:3000/",
    "http://[::1]/",
    "http://0x7f000001/",
    "http://localhost/",
    "http://10.0.0.1/",
  ])("rejects %s", async (url) => {
    expect(await resolvesToPublicAddress(url)).toBe(false);
  });

  it("accepts a public IP literal", async () => {
    expect(await resolvesToPublicAddress("http://8.8.8.8/")).toBe(true);
  });
});

describe("guardedDispatcher", () => {
  let server: http.Server;
  let port: number;

  beforeAll(async () => {
    server = http.createServer((_req, res) => res.end("internal"));
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    port = (server.address() as AddressInfo).port;
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it("the local server is reachable without the guard", async () => {
    const res = await fetch(`http://127.0.0.1:${port}/`);
    expect(await res.text()).toBe("internal");
  });

  it.each(["127.0.0.1", "localhost"])("blocks fetch to %s", async (host) => {
    const err = await fetch(`http://${host}:${port}/`, {
      // @ts-expect-error dispatcher is a Node fetch extension
      dispatcher: guardedDispatcher,
    }).catch((e: Error) => e);
    expect(err).toBeInstanceOf(Error);
    expect(String((err as Error & { cause?: unknown }).cause)).toMatch(/Blocked request to non-public address/);
  });
});
