const expect = require("chai").expect;
const cleanDb = require("../cleanDb");
const getRandAddr = require("../getRandAddr");

const db = require("../../src/db");

describe("db > dbWrap", () => {
  before("Should clean the db", cleanDb);

  /**
   * Registries
   */
  const registry1 = { name: "dnp.dappnode.eth", address: getRandAddr() };
  const registry2 = { name: "public.dappnode.eth", address: getRandAddr() };

  it("should add a registry and retrieve it", async () => {
    await db.addRegistry(registry1);
    const registries = await db.getRegistries();
    expect(registries).to.deep.equal([registry1]);
  });

  it("should add a second registry and retrieve both", async () => {
    await db.addRegistry(registry2);
    const registries = await db.getRegistries();
    expect(registries).to.deep.equal([registry1, registry2]);
  });

  /**
   * Repos
   */
  const repo1 = { name: "admin.dnp.dappnode.eth", address: getRandAddr() };
  const repo2 = { name: "ln.public.dappnode.eth", address: getRandAddr() };

  it("should add a repo and retrieve it", async () => {
    await db.addRepo(repo1);
    const repos = await db.getRepos();
    expect(repos).to.deep.equal([repo1]);
  });

  it("should add a second repo and retrieve both", async () => {
    await db.addRepo(repo2);
    const repos = await db.getRepos();
    expect(repos).to.deep.equal([repo1, repo2]);
  });

  /**
   * IPFS hashes
   */
  it("should a version and retrieve their hashes", async () => {
    const ipfsHash1 = "/ipfs/QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o";
    const ipfsHash2 = "/ipfs/zdj7WWeQ43G6JJvLWQWZpyHuAMq6uYWRjkBXFad11vE2LHhQ7";

    await db.addRepoVersion({
      name: "admin.dnp.dappnode.eth",
      version: "0.2.0",
      contentUris: {
        manifestHash: ipfsHash1,
        imageHash: ipfsHash2
      }
    });

    const ipfsHashes = await db.getIpfsHashes();
    expect(ipfsHashes).to.deep.equal([
      { hash: ipfsHash1, lastPinned: 0 },
      { hash: ipfsHash2, lastPinned: 0 }
    ]);
  });

  after("Should clean the db", cleanDb);
});
