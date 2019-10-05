const eth = require("./eth");

const expectedApmAppName = "apm-registry";

const publicConstantAbi = {
  constant: true,
  inputs: [],
  name: "APM_APP_NAME",
  outputs: [
    {
      name: "", // leave this empty
      type: "string"
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
  const apmAppName = await registry[publicConstantAbi.name]().then(
    (res: any) => res[0]
  );
  if (!apmAppName) throw Error("APM_APP_NAME is null");
  if (apmAppName !== expectedApmAppName)
    throw Error(`APM_APP_NAME is ${apmAppName}`);
}
