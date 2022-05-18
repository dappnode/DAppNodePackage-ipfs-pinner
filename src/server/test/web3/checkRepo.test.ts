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
    },
    {
      name: "aragonpm.eth",
      address: "0x346854c542d437565339e60de8cb3efe1cab30dc",
      is: false
    },
    {
      name: "finance.aragonpm.eth",
      address: "0x2dab32a4befc9cd6221796ece92e98137c13647a",
      is: true
    }
  ];

  for (const { name, address, is } of addresses) {
    it(`${name} should ${is ? "" : "NOT"} be a repo`, async () => {
      let isRepo = false;
      let error = "";
      try {
        await checkIfContractIsRepo(address);
        isRepo = true;
      } catch (e) {
        error = e.message;
      }

      expect(isRepo).to.equal(is, error);
    }).timeout(10 * 1000);
  }
});
