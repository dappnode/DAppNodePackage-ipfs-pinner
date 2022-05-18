import getBlockNumber from "../web3/getBlockNumber";

export default async function fetchBlockNumber(): Promise<number> {
  return await getBlockNumber();
}
