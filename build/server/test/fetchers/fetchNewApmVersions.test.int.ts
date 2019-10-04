import "mocha";
import { expect } from "chai";

import fetchNewApmVersions from "../../src/fetchers/fetchNewApmVersions";

describe("fetcher > fetchNewVersionsFromRepo", () => {
  const repoName = "bind.dnp.dappnode.eth";
  const repo = {
    id: "0x94aa44e77be7b08d8cc21ab894bc7619bc042b6cdcb2a9432bb59c3e93b1d723",
    name: "bind",
    address: "0xb7e15019b306b9d76068742330e10cdc61bf5006",
    blockNumber: 5703387
  };

  it(`Should return all versions for ${repo.name}`, async () => {
    const versions = await fetchNewApmVersions(repoName, 3);

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
