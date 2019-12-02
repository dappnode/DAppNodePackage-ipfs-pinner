import "mocha";
import { expect } from "chai";

import fetchNewApmRepos from "../../src/fetchers/fetchNewApmRepos";

describe("Fetcher > fetchNewApmRepos", () => {
  describe("DAppNode registry", () => {
    const registryName = "dnp.dappnode.eth";
    const bindBlock = 5703387;

    const expectedBindRepo = {
      shortname: "bind",
      address: "0xB7e15019b306B9d76068742330E10CDC61Bf5006"
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

  describe("Aragon PM registry", () => {
    const registryName = "aragonpm.eth";
    // const bindBlock = 5703387;

    const expectedFinanceRepo = {
      shortname: "finance",
      address: "0x2DAb32A4bEFC9cd6221796ecE92e98137c13647A"
    };

    it("Should fetch a regular release", async () => {
      const repos = await fetchNewApmRepos(registryName, 0);

      const financeRepo = repos.find(
        repo => repo.shortname === expectedFinanceRepo.shortname
      );

      expect(financeRepo).to.deep.equal(expectedFinanceRepo);
    }).timeout(30 * 1000);
  });
});
