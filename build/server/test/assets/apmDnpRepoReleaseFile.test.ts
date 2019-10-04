import "mocha";
import { expect } from "chai";

import * as apmDnpRepoReleaseFile from "../../src/assets/apmDnpRepoReleaseFile";

describe("Asset > apmDnpRepoReleaseFile", () => {
  describe("multiname parsers", () => {
    it("Should get and parse a multiname", () => {
      const releaseAsset = {
        name: "bitcoin.dnp.dappnode.eth",
        version: "0.2.0",
        filename: "manifest"
      };
      const multiname = apmDnpRepoReleaseFile.getMultiname(releaseAsset);
      expect(multiname).to.equal(
        "apm-dnp-release-file/bitcoin.dnp.dappnode.eth/0.2.0/manifest",
        "Wrong multiname"
      );
      expect(apmDnpRepoReleaseFile.parseMultiname(multiname)).to.deep.equal(
        releaseAsset,
        "Wrong parsed multiname"
      );
    });
  });
});
