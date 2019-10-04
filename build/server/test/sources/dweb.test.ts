import "mocha";
import { expect } from "chai";
import rewiremock from "rewiremock";

import * as dweb from "../../src/sources/dweb";
import { PollSourceFunctionReturn, AssetOwn, SourceOwn } from "../../src/types";
import { mockHash, mockHash2 } from "../testUtils";

describe("Source > dweb", () => {
  async function getApmRegistry(hash: string) {
    async function fetchDweb(): Promise<string> {
      return hash;
    }

    return await rewiremock.around(
      () => import("../../src/sources/dweb"),
      mock => {
        mock(() => import("../../src/fetchers/fetchDweb"))
          .withDefault(fetchDweb)
          .toBeUsed();
      }
    );
  }

  const domain = "decentralize.eth";
  const dwebMultiname = "dweb/decentralize.eth";

  describe("multiname parsers", () => {
    it("Should get and parse a multiname", () => {
      const dwebSample = { domain };
      const multiname = dweb.getMultiname(dwebSample);
      expect(multiname).to.equal(dwebMultiname, "Wrong multiname");
      expect(dweb.parseMultiname(multiname)).to.deep.equal(
        dwebSample,
        "Wrong parsed multiname"
      );
    });
  });

  describe("poll function", () => {
    const assetMultiname = "dweb-content/dweb/decentralize.eth";

    it("Deal with empty case", async () => {
      const source: SourceOwn = {
        multiname: dwebMultiname
      };

      const hash = mockHash;

      const currentOwnSources: SourceOwn[] = [];
      const currentOwnAssets: AssetOwn[] = [];
      const expectedResult: PollSourceFunctionReturn = {
        assetsToAdd: [{ multiname: assetMultiname, hash }],
        assetsToRemove: []
      };

      const dwebMock = await getApmRegistry(hash);
      const result = await dwebMock.poll({
        source,
        currentOwnAssets,
        currentOwnSources,
        internalState: ""
      });
      expect(result).to.deep.equal(expectedResult);
    });

    it("Should change its assets if the hash has changed", async () => {
      const source: SourceOwn = {
        multiname: dwebMultiname
      };

      const hash = mockHash;
      const hash2 = mockHash2;

      const currentOwnSources: SourceOwn[] = [];
      const currentOwnAssets: AssetOwn[] = [
        { multiname: assetMultiname, hash: hash2 }
      ];
      const expectedResult: PollSourceFunctionReturn = {
        assetsToAdd: [{ multiname: assetMultiname, hash }],
        assetsToRemove: [{ multiname: assetMultiname, hash: hash2 }]
      };

      const dwebMock = await getApmRegistry(hash);
      const result = await dwebMock.poll({
        source,
        currentOwnAssets,
        currentOwnSources,
        internalState: ""
      });
      expect(result).to.deep.equal(expectedResult);
    });
  });
});
