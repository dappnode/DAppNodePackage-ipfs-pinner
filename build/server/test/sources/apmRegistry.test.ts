import "mocha";
import { expect } from "chai";
import rewiremock from "rewiremock";

import * as apmRegistry from "../../src/sources/apmRegistry";
import { PollSourceFunctionReturn, AssetOwn, SourceOwn } from "../../src/types";
import { mockAddress, mockHash } from "../testUtils";
import { ApmRegistryRepo } from "../../src/fetchers/fetchNewApmRepos";

describe("Source > apmRegistry", () => {
  /* eslint-disable-next-line @typescript-eslint/explicit-function-return-type */
  async function getApmRegistry(repos: ApmRegistryRepo[], blockNumber: number) {
    async function fetchNewApmRepos(
      name: string,
      fromBlock: number
    ): Promise<ApmRegistryRepo[]> {
      name;
      fromBlock;
      return repos;
    }

    async function fetchBlockNumber(): Promise<number> {
      return blockNumber;
    }

    return await rewiremock.around(
      () => import("../../src/sources/apmRegistry"),
      mock => {
        mock(() => import("../../src/fetchers/fetchNewApmRepos"))
          .withDefault(fetchNewApmRepos)
          .toBeUsed();
        mock(() => import("../../src/fetchers/fetchBlockNumber"))
          .withDefault(fetchBlockNumber)
          .toBeUsed();
      }
    );
  }

  const registryName = "dnp.dappnode.eth";
  const registryMultiname = "apm-registry/dnp.dappnode.eth";
  const address = mockAddress;

  describe("multiname parsers", () => {
    it("Should get and parse a multiname", () => {
      const registry = { name: registryName };
      const multiname = apmRegistry.getMultiname(registry);
      expect(multiname).to.equal(registryMultiname, "Wrong multiname");
      expect(apmRegistry.parseMultiname(multiname)).to.deep.equal(
        registry,
        "Wrong parsed multiname"
      );
    });
  });

  describe("poll function", () => {
    it("Should return no results for an empty case", async () => {
      const source: SourceOwn = {
        multiname: registryMultiname,
        hash: mockHash
      };

      const repos: ApmRegistryRepo[] = [];
      const blockNumber = 0;

      const currentOwnSources: SourceOwn[] = [];
      const currentOwnAssets: AssetOwn[] = [];
      const expectedResult: PollSourceFunctionReturn = {
        sourcesToAdd: [],
        internalState: String(blockNumber)
      };

      const apmRegistryMock = await getApmRegistry(repos, blockNumber);
      const result = await apmRegistryMock.poll({
        source,
        currentOwnAssets,
        currentOwnSources,
        internalState: ""
      });
      expect(result).to.deep.equal(expectedResult);
    });

    it("Should return new assets if new versions are found", async () => {
      const source: SourceOwn = {
        multiname: registryMultiname,
        hash: mockHash
      };

      const repos: ApmRegistryRepo[] = [{ shortname: "bitcoin", address }];
      const blockNumber = 0;

      const currentOwnSources: SourceOwn[] = [];
      const currentOwnAssets: AssetOwn[] = [];
      const expectedResult: PollSourceFunctionReturn = {
        sourcesToAdd: [{ multiname: "apm-repo/bitcoin.dnp.dappnode.eth" }],
        internalState: String(blockNumber)
      };

      const apmRegistryMock = await getApmRegistry(repos, 0);
      const result = await apmRegistryMock.poll({
        source,
        currentOwnAssets,
        currentOwnSources,
        internalState: ""
      });
      expect(result).to.deep.equal(expectedResult);
    });

    it("Should deal with multiple repos and ignore already added", async () => {
      const source: SourceOwn = {
        multiname: registryMultiname,
        hash: mockHash
      };

      const bitcoin = {
        shortname: "bitcoin",
        multiname: "apm-repo/bitcoin.dnp.dappnode.eth"
      };
      const geth = {
        shortname: "geth",
        multiname: "apm-repo/geth.dnp.dappnode.eth"
      };

      const repos: ApmRegistryRepo[] = [
        { shortname: bitcoin.shortname },
        { shortname: geth.shortname }
      ].map(repo => ({ ...repo, address }));
      const blockNumber = 0;

      const currentOwnSources: SourceOwn[] = [
        { multiname: bitcoin.multiname, hash: mockHash }
      ];
      const currentOwnAssets: AssetOwn[] = [];
      const expectedResult: PollSourceFunctionReturn = {
        sourcesToAdd: [{ multiname: geth.multiname }],
        internalState: String(blockNumber)
      };

      const apmRegistryMock = await getApmRegistry(repos, 0);
      const result = await apmRegistryMock.poll({
        source,
        currentOwnAssets,
        currentOwnSources,
        internalState: ""
      });
      expect(result).to.deep.equal(expectedResult);
    });
  });
});
