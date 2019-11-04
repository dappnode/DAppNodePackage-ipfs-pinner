import { ethers } from "ethers";
import provider from "./provider";
import ensureAncientBlocks from "./ensureAncientBlocks";

const registryNewRepoEventAbi = {
  anonymous: false,
  inputs: [
    {
      indexed: false,
      name: "id",
      type: "bytes32"
    },
    {
      indexed: false,
      name: "name",
      type: "string"
    },
    {
      indexed: false,
      name: "repo",
      type: "address"
    }
  ],
  name: "NewRepo",
  type: "event"
};

const newRepoEvent = new ethers.utils.Interface([registryNewRepoEventAbi]);

const newRepoEventTopic =
  newRepoEvent.events[registryNewRepoEventAbi.name].topic;

interface NewRepoEvent {
  blockNumber: number;
  returnValues: {
    id: string;
    name: string;
    repo: string;
  };
}

/**
 * Fetches the new repos logs from a registry
 *
 * [NOTE]: Will throw with "ENS name not configured" if the ENS can't
 * resolve the domain
 */
export default async function getNewReposFromRegistry(
  addressOrEnsName: string,
  fromBlock?: number
): Promise<NewRepoEvent[]> {
  // Change this method if the web3 library is not ethjs
  await ensureAncientBlocks();

  const result = await provider.getLogs({
    address: addressOrEnsName, // or contractEnsName,
    fromBlock: fromBlock || 0,
    toBlock: "latest",
    topics: [newRepoEventTopic]
  });

  return result.map(event => {
    const parsedLog = newRepoEvent.parseLog(event);
    if (!parsedLog || !parsedLog.values)
      throw Error(`Error parsing NewRepo event`);
    const {
      id,
      name,
      repo
    }: { id: string; name: string; repo: string } = parsedLog.values;
    return {
      blockNumber: event.blockNumber || 0,
      returnValues: { id, name, repo }
    };
  });
}
