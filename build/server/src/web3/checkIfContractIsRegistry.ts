import { ethers } from "ethers";
import provider from "./provider";

// const expectedApmAppName = "apm-registry";

const publicConstantAbi = {
  constant: true,
  inputs: [],
  name: "CREATE_REPO_ROLE",
  outputs: [{ name: "", type: "bytes32" }],
  payable: false,
  stateMutability: "view",
  type: "function"
};

/**
 * All APM Registry contracts have a public constant `APM_APP_NAME`
 * Test that this constant exist and its value is `apm-registry`
 *
 * [NOTE]: Will throw with "ENS name not configured" if the ENS can't
 * resolve the domain
 */
export async function checkIfContractIsRegistry(addressOrEnsName: string) {
  const registry = new ethers.Contract(
    addressOrEnsName,
    [publicConstantAbi],
    provider
  );

  const createRepoRole = await registry[publicConstantAbi.name]();
  // Will throw if createRepoRole = "0x", "0x000000000..."
  if (!parseInt(createRepoRole)) throw Error("CREATE_REPO_ROLE is zero");
}
