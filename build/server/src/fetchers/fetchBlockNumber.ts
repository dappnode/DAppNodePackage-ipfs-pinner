import * as web3 from "../web3";

export default async function fetchBlockNumber(): Promise<number> {
  const latestBlock = await web3.getBlockNumber();
  return latestBlock;
}
