import { ens } from "../web3";

export default async function resolveEnsDomain(ensDomain: string) {
  const address = await ens.lookup(ensDomain);
  return address;
}
