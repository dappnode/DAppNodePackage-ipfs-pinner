import resolveName from "../web3/resolveName";

export default async function fetchEnsDomain(ensDomain: string) {
  const address = await resolveName(ensDomain);
  if (!address) throw Error(`ENS domain not found`);
  return address;
}
