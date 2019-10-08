const eth = require("./eth");

// const expectedApmAppName = "apm-registry";

const publicConstantAbi = {
  constant: true,
  inputs: [],
  name: "CREATE_REPO_ROLE",
  outputs: [
    {
      name: "", // leave this empty
      type: "bytes32"
    }
  ],
  payable: false,
  stateMutability: "view",
  type: "function"
};

/**
 * All APM Registry contracts have a public constant `APM_APP_NAME`
 * Test that this constant exist and its value is `apm-registry`
 */
export async function checkIfContractIsRegistry(address: string) {
  const registry = eth.contract([publicConstantAbi]).at(address);
  const createRepoRole = await registry[publicConstantAbi.name]().then(
    (res: any) => res[0]
  );
  // Will throw if createRepoRole = "0x", "0x000000000..."
  if (!parseInt(createRepoRole)) throw Error("CREATE_REPO_ROLE is zero");
}
