import { ethers } from "ethers";
import provider from "./provider";
const CID = require("cids");
const multihash = require("multihashes");
const multicodec = require("multicodec");

/**
 * ENS parameters
 * Last updated January 2019
 */

const TEXT_INTERFACE_ID = "0x59d1d43c";
const CONTENTHASH_INTERFACE_ID = "0xbc1c58d1";
const CONTENT_INTERFACE_ID = "0xd8389dc5";
const interfaces = [
  TEXT_INTERFACE_ID,
  CONTENTHASH_INTERFACE_ID,
  CONTENT_INTERFACE_ID
];

const ensAddr = "0x314159265dd8dbb310642f98f50c066173c1259b";
const ensInterface = [
  "function resolver(bytes32 nodeHash) constant returns (address resolver)"
];
const resolverInterface = [
  "function supportsInterface(bytes4 interfaceId) constant returns (bool supported)",
  "function addr(bytes32 nodeHash) constant returns (address addr)",
  "function name(bytes32 nodeHash) constant returns (string name)",
  "function text(bytes32 nodeHash, string key) constant returns (string value)",
  "function contenthash(bytes32 nodeHash) constant returns (bytes contenthash)",
  "function content(bytes32 nodeHash) constant returns (bytes32 content)",
  "function multihash(bytes32 nodeHash) constant returns (bytes multihash)"
];

const ens = new ethers.Contract(ensAddr, ensInterface, provider);

/**
 * Resolves a request for an ENS domain iterating over various methods
 * @param  {string} name
 * @return {Promise<string>} content
 */
export default async function resolveEnsContent(name: string): Promise<string> {
  const node = namehash(name);
  const resolverAddress: string = await ens.resolver(node);
  if (parseInt(resolverAddress) === 0)
    throw Error(`No resolver found for ${name}`);

  const resolver = new ethers.Contract(
    resolverAddress,
    resolverInterface,
    provider
  );

  const interfacesAvailable: { [interfaceHash: string]: boolean } = {};
  await Promise.all(
    interfaces.map(async intf => {
      interfacesAvailable[intf] = await resolver.supportsInterface(intf);
    })
  );

  /**
   * `contentHash` method
   */
  if (interfacesAvailable[CONTENTHASH_INTERFACE_ID]) {
    const contentHashEncoded = await resolver.contenthash(node);
    const content = decodeContentHash(contentHashEncoded);
    if (content) return content;
  }

  /**
   * `text` method
   * This method is deprecated, but it is preserved for compatibility
   */
  if (interfacesAvailable[TEXT_INTERFACE_ID]) {
    const content = await resolver.text(node, "dnslink");
    if ((content || "").startsWith("/ipfs/")) return content;
  }

  throw Error(`Can't resolve ENS: ${name}`);
}

// Utils

/**
 * Alias for computing the namehash of ensName
 */
export function namehash(name: string): string {
  return ethers.utils.namehash(name);
}

/**
 * Used in the CONTENTHASH_INTERFACE_ID = "0xbc1c58d1"
 *
 * @param {string} contenthash
 * @returns {string|null} content
 */
export function decodeContentHash(contenthash: string): string | undefined {
  if (!contenthash || contenthash === "0x") return;

  const contentHashEncoded = Buffer.from(contenthash.slice(2), "hex");
  const contentCodec: string = multicodec.getCodec(contentHashEncoded);

  if (contentCodec.startsWith("ipfs")) {
    const value = multicodec.rmPrefix(contentHashEncoded);
    const cid = new CID(value);
    return "/ipfs/" + multihash.toB58String(cid.multihash);
  } else if (contentCodec.startsWith("swarm")) {
    throw Error(`Unsupported swarm codec: ${contenthash}`);
  } else {
    throw Error(`Unsupported codec on ENS contentHash: ${contenthash}`);
  }
}
