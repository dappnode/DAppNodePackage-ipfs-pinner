import resolveName from "../web3/resolveName";

export default async function fetchEnsAddress(ensDomain: string) {
  const address = await resolveName(ensDomain);
  if (!address) throw Error(`ENS address not found: ${ensDomain}`);
  return address;
}
