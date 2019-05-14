const expect = require("chai").expect;
const cleanDb = require("../cleanDb");

const fetchNewReposFromRegistry = require("../../src/fetchers/fetchNewReposFromRegistry");

describe("fetcher > fetchNewReposFromRegistry", () => {
  before("Should clean the db", cleanDb);

  /**
   * [REAL] test, may fail or take a while
   */
  // Real address in mainnet of "dnp.dappnode.eth"
  const registryAddress = "0x266bfdb2124a68beb6769dc887bd655f78778923";

  it("Should return all repos for dnp.dappnode.eth", async () => {
    const repos = await fetchNewReposFromRegistry(registryAddress);
    // By April 2019 there were 25 valid repos released
    expect(repos).to.have.length.above(25);
    /**
     * Assert a specific version
     */
    const adminRepo = repos.find(({ name }) => name === "admin");
    expect(adminRepo).to.deep.equal(
      {
        id:
          "0x7b7d7491331e736fd597441c99888477186663492ab03d120b4556f27c6ce41f",
        name: "admin",
        address: "0xee66c4765696c922078e8670aa9e6d4f6ffcc455"
      },
      "adminRepo did not match expected values"
    );
  }).timeout(30 * 1000);

  it("Should not return any repo since lastBlock is cached", async () => {
    const repos = await fetchNewReposFromRegistry(registryAddress);
    // By April 2019 there were 19 repos released
    expect(repos).to.have.length(0);
  }).timeout(30 * 1000);

  after("Should clean the db", cleanDb);
});
