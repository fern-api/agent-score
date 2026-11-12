import dns from 'node:dns';
import net from 'node:net';
import ipaddr from 'ipaddr.js';
import { Agent, buildConnector, setGlobalDispatcher } from 'undici';

/**
 * Scoring fetches whatever URL a visitor submits, and afdocs follows redirects.
 * To stop the server from being used to reach loopback, link-local (cloud
 * metadata at 169.254.169.254), or private-network hosts, every outbound
 * connection made by global fetch is checked against the address it actually
 * connects to. Checking at connect time covers redirect hops and DNS names
 * that resolve to a different address than they did on an earlier lookup.
 */

export function isPublicAddress(ip: string): boolean {
  try {
    return ipaddr.process(ip).range() === 'unicast';
  } catch {
    return false;
  }
}

function blockedError(hostname: string, address: string): Error {
  return new Error(`Blocked request to non-public address ${address} (${hostname})`);
}

const guardedLookup: net.LookupFunction = (hostname, options, callback) => {
  dns.lookup(hostname, { ...options, all: true }, (err, addresses) => {
    if (err) return callback(err, '', 0);
    const blocked = addresses.find((a) => !isPublicAddress(a.address));
    if (blocked) return callback(blockedError(hostname, blocked.address), '', 0);
    if (options.all) return (callback as unknown as (e: null, a: dns.LookupAddress[]) => void)(null, addresses);
    callback(null, addresses[0].address, addresses[0].family);
  });
};

const baseConnector = buildConnector({ lookup: guardedLookup });

const guardedConnector: buildConnector.connector = (opts, callback) => {
  // net.connect skips the lookup function for IP-literal hosts.
  const host = opts.hostname.replace(/^\[|\]$/g, '');
  if (net.isIP(host) && !isPublicAddress(host)) {
    return callback(blockedError(opts.hostname, host), null);
  }
  return baseConnector(opts, callback);
};

export const guardedDispatcher = new Agent({ connect: guardedConnector });

export function installSsrfGuard(): void {
  setGlobalDispatcher(guardedDispatcher);
}

/** Resolves the URL's host and reports whether every address it maps to is public. */
export async function resolvesToPublicAddress(url: string): Promise<boolean> {
  try {
    const host = new URL(url).hostname.replace(/^\[|\]$/g, '');
    if (net.isIP(host)) return isPublicAddress(host);
    const addresses = await dns.promises.lookup(host, { all: true });
    return addresses.length > 0 && addresses.every((a) => isPublicAddress(a.address));
  } catch {
    return false;
  }
}
