import { ethers } from "ethers";
import provider from "./provider";

const isValidBumpAbi = {
  constant: true,
  inputs: [
    { name: "_oldVersion", type: "uint16[3]" },
    { name: "_newVersion", type: "uint16[3]" }
  ],
  name: "isValidBump",
  outputs: [{ name: "", type: "bool" }],
  type: "function"
};

/**
 * All APM Repo contracts should have a `isValidBump` function
 * Test that "0.0.0" => "0.1.0" is a valid bump by returning
 *
 * [NOTE]: Will throw with "ENS name not configured" if the ENS can't
 * resolve the domain
 */
export async function checkIfContractIsRepo(addressOrEnsName: string) {
  const registry = new ethers.Contract(
    addressOrEnsName,
    [isValidBumpAbi],
    provider
  );

  const isValidBump = await registry[isValidBumpAbi.name]([0, 0, 0], [0, 1, 0]);
  if (!isValidBump) throw Error("isValidBump function not present");
}
