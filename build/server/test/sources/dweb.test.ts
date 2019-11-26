import "mocha";
import { expect } from "chai";
import rewiremock from "rewiremock";

import * as dweb from "../../src/sources/dweb";
import * as dwebContent from "../../src/assets/dwebContent";
import { PollSourceFunctionReturn, AssetOwn, SourceOwn } from "../../src/types";
import { mockHash, mockHash2 } from "../testUtils";

describe("Source > dweb", () => {
  async function getApmRegistry(hash: string, blockNumber: number) {
    async function fetchDweb(): Promise<string> {
      return hash;
    }

    async function fetchBlockNumber(): Promise<number> {
      return blockNumber;
    }

    return await rewiremock.around(
      () => import("../../src/sources/dweb"),
      mock => {
        mock(() => import("../../src/fetchers/fetchDweb"))
          .withDefault(fetchDweb)
          .toBeUsed();
        mock(() => import("../../src/fetchers/fetchBlockNumber"))
          .withDefault(fetchBlockNumber)
          .toBeUsed();
      }
    );
  }

  const domain = "decentralize.eth";
  const dwebMultiname = "dweb/decentralize.eth";
  const blockNumber = 9132003;
  const assetMultiname = dwebContent.getMultiname({ domain, blockNumber });

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
    it("Deal with empty case", async () => {
      const source: SourceOwn = {
        multiname: dwebMultiname,
        hash: mockHash
      };

      const hash = mockHash;

      const currentOwnSources: SourceOwn[] = [];
      const currentOwnAssets: AssetOwn[] = [];
      const expectedResult: PollSourceFunctionReturn = {
        assetsToAdd: [{ multiname: assetMultiname, hash }],
        assetsToRemove: []
      };

      const dwebMock = await getApmRegistry(hash, blockNumber);
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
        multiname: dwebMultiname,
        hash: mockHash
      };

      const hash = mockHash;
      const hash2 = mockHash2;
      const prevAssetMultiname = dwebContent.getMultiname({
        domain,
        blockNumber: blockNumber - 10000
      });

      const currentOwnSources: SourceOwn[] = [];
      const currentOwnAssets: AssetOwn[] = [
        { multiname: prevAssetMultiname, hash: hash2 }
      ];
      const expectedResult: PollSourceFunctionReturn = {
        assetsToAdd: [{ multiname: assetMultiname, hash }],
        assetsToRemove: [{ multiname: prevAssetMultiname, hash: hash2 }]
      };

      const dwebMock = await getApmRegistry(hash, blockNumber);
      const result = await dwebMock.poll({
        source,
        currentOwnAssets,
        currentOwnSources,
        internalState: ""
      });
      expect(result).to.deep.equal(expectedResult);
    });

    it("Should NOT change its assets if the hash has changed but the block is not higher", async () => {
      const source: SourceOwn = {
        multiname: dwebMultiname,
        hash: mockHash
      };

      const hash = mockHash;
      const hash2 = mockHash2;
      const prevAssetMultiname = dwebContent.getMultiname({
        domain,
        blockNumber: blockNumber + 10000
      });

      const currentOwnSources: SourceOwn[] = [];
      const currentOwnAssets: AssetOwn[] = [
        { multiname: prevAssetMultiname, hash: hash2 }
      ];
      const expectedResult: PollSourceFunctionReturn = {
        assetsToAdd: [],
        assetsToRemove: []
      };

      const dwebMock = await getApmRegistry(hash, blockNumber);
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
