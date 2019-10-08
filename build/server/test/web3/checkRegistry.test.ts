import "mocha";
import { expect } from "chai";

import { checkIfContractIsRegistry } from "../../src/web3/checkIfContractIsRegistry";

describe("Utils > checkIfContractIsRegistry", () => {
  const addresses = [
    {
      name: "dnp.dappnode.eth",
      address: "0x266bfdb2124a68beb6769dc887bd655f78778923",
      is: true
    },
    {
      name: "public.dappnode.eth",
      address: "0x9f85ae5aefe4a3eff39d9a44212aae21dd15079a",
      is: true
    },
    {
      name: "admin.dnp.dappnode.eth",
      address: "0xEe66C4765696C922078e8670aA9E6d4F6fFcc455",
      is: false
    },
    {
      name: "aragonpm.eth",
      address: "0x346854c542d437565339e60de8cb3efe1cab30dc",
      is: true
    },
    {
      name: "finance.aragonpm.eth",
      address: "0x2dab32a4befc9cd6221796ece92e98137c13647a",
      is: false
    }
  ];

  for (const { name, address, is } of addresses) {
    it(`${name} should be a registry`, async () => {
      const isRepo = await checkIfContractIsRegistry(address).then(
        () => true,
        () => false
      );
      expect(isRepo).to.equal(
        is,
        is ? "Should be registry" : "Should NOT be a registry"
      );
    });
  }
});
