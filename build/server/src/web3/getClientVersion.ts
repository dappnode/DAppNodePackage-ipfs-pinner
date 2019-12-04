import provider from "./provider";

/**
 * Gets the client version
 *
 * @returns clientVersion
 * "Parity-Ethereum//v2.5.10-stable-9f94473ea-20191112/x86_64-linux-musl/rustc1.38.0"
 * "Geth/v1.9.8-stable-d62e9b28/linux-amd64/go1.13.4"
 */
export default async function getClientVersion(): Promise<string> {
  return await provider.send("web3_clientVersion", []);
}
