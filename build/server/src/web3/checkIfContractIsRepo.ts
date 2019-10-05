const eth = require("./eth");

const isValidBumpAbi = {
  constant: true,
  inputs: [
    { name: "_oldVersion", type: "uint16[3]" },
    { name: "_newVersion", type: "uint16[3]" }
  ],
  name: "isValidBump",
  outputs: [
    {
      name: "",
      type: "bool"
    }
  ],
  payable: false,
  stateMutability: "pure",
  type: "function"
};

const evmScriptConstant = {
  constant: true,
  inputs: [],
  name: "EVMSCRIPT_REGISTRY_APP_ID",
  outputs: [{ name: "", type: "bytes32" }],
  payable: false,
  stateMutability: "view",
  type: "function"
};

/**
 * All APM Repo contracts should have a `isValidBump` function
 * Test that "0.0.0" => "0.1.0" is a valid bump by returning
 */
export async function checkIfContractIsRepo(address: string) {
  const registry = eth
    .contract([isValidBumpAbi, evmScriptConstant])
    .at(address);
  const isValidBump = await registry[isValidBumpAbi.name](
    [0, 0, 0],
    [0, 1, 0]
  ).then((res: any) => res[0]);
  if (!isValidBump) throw Error("isValidBump function not present");

  const evmScript = await registry[evmScriptConstant.name]();
  if (!evmScript) throw Error("Aragon Apps have a EVMSCRIPT_REGISTRY_APP_ID");
}
