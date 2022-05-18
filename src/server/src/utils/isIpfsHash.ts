const isIPFS = require("is-ipfs");

/**
 * Returns the CID component of an IPFS path
 * @param hash "/ipfs/Qm...", "ipfs/Qm...", "ipfs:Qm..."
 * @returns "Qm..."
 */
export function normalizeIpfsHash(hash: string): string {
  // Correct hash prefix
  hash = hash.split("ipfs/")[1] || hash;
  hash = hash.split("ipfs:")[1] || hash;
  return hash.replace("/", "");
}

/**
 * Checks if the given string is a valid IPFS CID or path
 *
 * isIPFS.cid('QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o') // true (CIDv0)
 * isIPFS.cid('zdj7WWeQ43G6JJvLWQWZpyHuAMq6uYWRjkBXFad11vE2LHhQ7') // true (CIDv1)
 * isIPFS.cid('noop') // false
 *
 * @param {string} hash
 * @returns {bool}
 */
export default function isIpfsHash(hash: string): boolean {
  if (!hash || typeof hash !== "string") return false;
  // Correct hash prefix
  hash = hash.split("ipfs/")[1] || hash;
  hash = hash.split("ipfs:")[1] || hash;
  hash.replace("/", "");
  // Make sure hash if valid
  return isIPFS.cid(hash);
}
