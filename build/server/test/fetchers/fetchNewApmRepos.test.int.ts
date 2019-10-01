import "mocha";
import { expect } from "chai";

import fetchNewApmRepos from "../../src/fetchers/fetchNewApmRepos";
import { ApmRegistry } from "../../src/types";

describe("Fetcher > fetchNewApmRepos", () => {
  const registry: ApmRegistry = {
    name: "dnp.dappnode.eth",
    address: "0x266BFdb2124A68beB6769dC887BD655f78778923"
  };

  it("Should fetch a regular release", async () => {
    //
    const repos = await fetchNewApmRepos(registry);

    const expectedBindRepo = {
      id: "0x94aa44e77be7b08d8cc21ab894bc7619bc042b6cdcb2a9432bb59c3e93b1d723",
      name: "bind",
      address: "0xb7e15019b306b9d76068742330e10cdc61bf5006",
      blockNumber: 5703387
    };

    const bindRepo = repos.find(repo => repo.name === expectedBindRepo.name);

    expect(bindRepo).to.deep.equal(expectedBindRepo);
  }).timeout(30 * 1000);

  it("Should not return any repo since lastBlock is cached", async () => {
    const repos = await fetchNewApmRepos(registry);
    // By April 2019 there were 19 repos released
    expect(repos).to.have.length(0);
  }).timeout(30 * 1000);
});
