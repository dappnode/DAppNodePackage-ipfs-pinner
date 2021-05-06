import "mocha";
import { expect } from "chai";

import fetchNewApmVersions from "../../src/fetchers/fetchNewApmVersions";

describe("fetcher > fetchNewVersionsFromRepo", () => {
  describe("DAppNode DNP", () => {
    const repoName = "bind.dnp.dappnode.eth";
    const repo = {
      id: "0x94aa44e77be7b08d8cc21ab894bc7619bc042b6cdcb2a9432bb59c3e93b1d723",
      name: "bind",
      address: "0xB7e15019b306B9d76068742330E10CDC61Bf5006",
      blockNumber: 5703387
    };

    it(`Should return all versions for ${repo.name}`, async () => {
      const versions = await fetchNewApmVersions(repoName, 10);

      const expectedVersion020 = {
        version: "0.2.0",
        contentUri: "/ipfs/QmS55w46C2uLk55TySN38SEihgTmL1do4rxoBoiRAz12BK"
      };

      const version020 = versions.find(
        ({ version }) => version === expectedVersion020.version
      );

      expect(version020).to.deep.equal(expectedVersion020);
    }).timeout(30 * 1000);

    it("Should not return any version since lastIndex is cached", async () => {
      const versions = await fetchNewApmVersions(repoName, 0);
      // By April 2019 there were 19 versions released
      expect(versions).to.have.length(0);
    }).timeout(30 * 1000);
  });

  describe("Aragon Package", () => {
    const repoName = "finance.aragonpm.eth";
    const repo = {
      name: "finance",
      address: "0x2DAb32A4bEFC9cd6221796ecE92e98137c13647A"
    };

    it(`Should return all versions for ${repo.name}`, async () => {
      const versions = await fetchNewApmVersions(repoName, 10);
      console.log("versions: ", versions);
      const expectedVersion212 = {
        version: "2.1.2",
        contentUri: "ipfs:QmWyueP8dtXwuojHX4ThZJpggxxpyQYaGvDoHJa7dcPUrh"
      };

      const version212 = versions.find(
        ({ version }) => version === expectedVersion212.version
      );
      expect(version212).to.deep.equal(expectedVersion212);
    }).timeout(30 * 1000);
  });
});
