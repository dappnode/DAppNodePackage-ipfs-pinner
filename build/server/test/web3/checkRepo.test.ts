import "mocha";
import { expect } from "chai";

import { checkIfContractIsRepo } from "../../src/web3/checkIfContractIsRepo";

describe("Utils > checkIfContractIsRepo", () => {
  const addresses = [
    {
      name: "dnp.dappnode.eth",
      address: "0x266bfdb2124a68beb6769dc887bd655f78778923",
      is: false
    },
    {
      name: "public.dappnode.eth",
      address: "0x9f85ae5aefe4a3eff39d9a44212aae21dd15079a",
      is: false
    },
    {
      name: "admin.dnp.dappnode.eth",
      address: "0xEe66C4765696C922078e8670aA9E6d4F6fFcc455",
      is: true
    }
  ];

  for (const { name, address, is } of addresses) {
    it(`${name} should be a repo`, async () => {
      const isRepo = await checkIfContractIsRepo(address).then(
        () => true,
        () => false
      );
      expect(isRepo).to.equal(
        is,
        is ? "Should be repo" : "Should NOT be a repo"
      );
    });
  }
});
