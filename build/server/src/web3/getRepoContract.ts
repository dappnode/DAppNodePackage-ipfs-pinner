import { ethers } from "ethers";
import provider from "./provider";
import { hexToUtf8 } from "./utils";

const repositoryAbi = [
  {
    constant: true,
    inputs: [],
    name: "getVersionsCount",
    outputs: [{ name: "", type: "uint256" }],
    type: "function"
  },
  {
    constant: true,
    inputs: [{ name: "_versionId", type: "uint256" }],
    name: "getByVersionId",
    outputs: [
      { name: "semanticVersion", type: "uint16[3]" },
      { name: "contractAddress", type: "address" },
      { name: "contentURI", type: "bytes" }
    ],
    type: "function"
  }
];

/**
 * Repo methods to get version data
 * Returns both methods to prevent initializing ethers too many times
 *
 * [NOTE]: Will throw with "ENS name not configured" if the ENS can't
 * resolve the domain
 */
export default function getRepoContract(addressOrEnsName: string) {
  const repo = new ethers.Contract(addressOrEnsName, repositoryAbi, provider);

  async function getVersionsCount(): Promise<number> {
    const res = await repo.getVersionsCount();
    if (typeof res === "number") return res;
    else return res.toNumber();
  }

  async function getVersionById(
    versionId: number
  ): Promise<{ version: string; contentUri: string }> {
    const res: {
      semanticVersion: string[];
      contentURI: string;
    } = await repo.getByVersionId(versionId);
    return {
      version: res.semanticVersion.map(v => v.toString()).join("."),
      contentUri: hexToUtf8(res.contentURI)
    };
  }

  return {
    getVersionsCount,
    getVersionById
  };
}
