import provider from "./provider";

/**
 * Resolve an ENS name. Does NOT throw if the address is not resolved
 * @returns the address if found, `null` if not found.
 */
export default function resolveName(name: string): Promise<string | null> {
  return provider.resolveName(name);
}
