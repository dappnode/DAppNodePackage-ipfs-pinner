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
    db.addRegistry(registry1);
    const registries = db.getRegistries();
    expect(registries).to.deep.equal([registry1]);
  });

  it("should add a second registry and retrieve both", async () => {
    db.addRegistry(registry2);
    const registries = db.getRegistries();
    expect(registries).to.deep.equal([registry1, registry2]);
  });

  /**
   * Repos
   */
  const repo1 = { name: "admin.dnp.dappnode.eth", address: getRandAddr() };
  const repo2 = { name: "ln.public.dappnode.eth", address: getRandAddr() };

  it("should add a repo and retrieve it", async () => {
    db.addRepo(repo1);
    const repos = db.getRepos();
    expect(repos).to.deep.equal([repo1]);
  });

  it("should add a second repo and retrieve both", async () => {
    db.addRepo(repo2);
    const repos = db.getRepos();
    expect(repos).to.deep.equal([repo1, repo2]);
  });

  /**
   * IPFS hashes
   */
  it("should add a version and retrieve their hashes", async () => {
    const ipfsHash1 = "/ipfs/QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o";
    const ipfsHash2 = "/ipfs/zdj7WWeQ43G6JJvLWQWZpyHuAMq6uYWRjkBXFad11vE2LHhQ7";
    const name = "admin.dnp.dappnode.eth";
    const version = "0.2.0";

    db.addRepoVersion({
      name,
      version,
      contentUris: {
        manifestHash: ipfsHash1,
        imageHash: ipfsHash2
      }
    });

    const ipfsHashes = db.getIpfsHashes();
    expect(ipfsHashes).to.deep.equal([
      { asset: "manifest", name, version, hash: ipfsHash1, lastPinned: 0 },
      { asset: "image", name, version, hash: ipfsHash2, lastPinned: 0 }
    ]);
  });

  after("Should clean the db", cleanDb);
});
