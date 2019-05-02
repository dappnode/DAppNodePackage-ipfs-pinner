const expect = require("chai").expect;
const cleanDb = require("../cleanDb");

const fetchNewVersionsFromRepo = require("../../src/fetchers/fetchNewVersionsFromRepo");

describe("fetcher > fetchNewVersionsFromRepo", () => {
  before("Should clean the db", cleanDb);

  /**
   * [REAL] test, may fail or take a while
   */
  // Real address in mainnet of "admin.dnp.dappnode.eth"
  const repoAddress = "0xee66c4765696c922078e8670aa9e6d4f6ffcc455";

  it("Should return all versions for admin.dnp.dappnode.eth", async () => {
    const versions = await fetchNewVersionsFromRepo(repoAddress);
    // By April 2019 there were 19 versions released
    expect(versions).to.have.length.above(18);
    /**
     * Assert a specific version
     */
    const version01180 = versions.find(({ version }) => version === "0.1.18");
    expect(version01180).to.deep.equal(
      {
        contentUri: "/ipfs/QmWv8aCqTbEDJyiw3SJip5XKfF2hdsXCTXTQANtRQ1Z4ao",
        version: "0.1.18"
      },
      "Version 0.1.18 did not match expected values"
    );
  }).timeout(30 * 1000);

  it("Should not return any version since lastIndex is cached", async () => {
    const versions = await fetchNewVersionsFromRepo(repoAddress);
    // By April 2019 there were 19 versions released
    expect(versions).to.have.length(0);
  }).timeout(30 * 1000);

  after("Should clean the db", cleanDb);
});
