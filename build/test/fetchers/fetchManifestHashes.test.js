const expect = require("chai").expect;
const proxyquire = require("proxyquire");

const ipfsHash0 = "/ipfs/QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o";
const ipfsHash1 = "/ipfs/zdj7WWeQ43G6JJvLWQWZpyHuAMq6uYWRjkBXFad11vE2LHhQ7";

const ipfs = {
  catObj: async () => ({
    image: {
      hash: ipfsHash1
    },
    avatar: "wrong-hash"
  })
};

const fetchManifestHashes = proxyquire(
  "../../src/fetchers/fetchManifestHashes",
  { "../ipfs": ipfs }
);

describe("fetcher > fetchManifestHashes", () => {
  it("should fetch a manifest hashes", async () => {
    const manifestHash = ipfsHash0;

    const hashes = await fetchManifestHashes(manifestHash);
    expect(hashes).to.deep.equal({
      manifest: manifestHash,
      image: ipfsHash1
    });
  });
});
