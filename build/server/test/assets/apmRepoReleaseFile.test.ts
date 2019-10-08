import "mocha";
import { expect } from "chai";

import * as apmRepoReleaseContent from "../../src/assets/apmRepoReleaseContent";

describe("Asset > apmRepoReleaseContent", () => {
  describe("multiname parsers", () => {
    it("Should get and parse a multiname", () => {
      const releaseAsset = {
        name: "bitcoin.dnp.dappnode.eth",
        version: "0.2.0",
        filename: "manifest"
      };
      const multiname = apmRepoReleaseContent.getMultiname(releaseAsset);
      expect(multiname).to.equal(
        "apm-repo-release-content/bitcoin.dnp.dappnode.eth/0.2.0/manifest",
        "Wrong multiname"
      );
      expect(apmRepoReleaseContent.parseMultiname(multiname)).to.deep.equal(
        releaseAsset,
        "Wrong parsed multiname"
      );
    });
  });
});
