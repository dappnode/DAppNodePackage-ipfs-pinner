import getClientVersion from "../web3/getClientVersion";

/**
 * Checks if the Ethereum client connected to is Geth
 */
export default async function fetchIsNodeGeth(): Promise<boolean> {
  // "Parity-Ethereum//v2.5.10-stable-9f94473ea-20191112/x86_64-linux-musl/rustc1.38.0"
  // "Geth/v1.9.8-stable-d62e9b28/linux-amd64/go1.13.4"
  const clientVersion = await getClientVersion();
  return /^geth/i.test(clientVersion);
}
