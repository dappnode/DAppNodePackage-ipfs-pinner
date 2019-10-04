import "mocha";
import { expect } from "chai";

import fetchNewApmRepos from "../../src/fetchers/fetchNewApmRepos";

describe("Fetcher > fetchNewApmRepos", () => {
  const registryName = "dnp.dappnode.eth";
  const bindBlock = 5703387;

  const expectedBindRepo = {
    shortname: "bind",
    address: "0xb7e15019b306b9d76068742330e10cdc61bf5006"
  };

  it("Should fetch a regular release", async () => {
    const repos = await fetchNewApmRepos(registryName, 0);

    const bindRepo = repos.find(
      repo => repo.shortname === expectedBindRepo.shortname
    );

    expect(bindRepo).to.deep.equal(expectedBindRepo);
  }).timeout(30 * 1000);

  it("Should not return the bind repo since lastBlock is cached", async () => {
    const repos = await fetchNewApmRepos(registryName, bindBlock + 1);
    const bindRepo = repos.find(
      repo => repo.shortname === expectedBindRepo.shortname
    );
    expect(bindRepo).to.be.undefined;
  }).timeout(30 * 1000);
});
