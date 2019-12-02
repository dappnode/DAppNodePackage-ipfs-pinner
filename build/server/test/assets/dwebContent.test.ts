import "mocha";
import { expect } from "chai";

import * as dwebContent from "../../src/assets/dwebContent";

describe("Asset > dwebContent", () => {
  describe("multiname parsers", () => {
    it("Should get and parse a multiname", () => {
      const releaseAsset = {
        domain: "decentral.eth",
        blockNumber: 7100000
      };
      const multiname = dwebContent.getMultiname(releaseAsset);
      expect(multiname).to.equal(
        "dweb-content/decentral.eth/7100000",
        "Wrong multiname"
      );
      expect(dwebContent.parseMultiname(multiname)).to.deep.equal(
        releaseAsset,
        "Wrong parsed multiname"
      );
    });
  });
});
