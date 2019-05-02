const expect = require("chai").expect;

const isIpfsHash = require("../../src/utils/isIpfsHash");

describe("utils > isIpfsHash", () => {
  const ipfsHash0 = "/ipfs/QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o";
  const ipfsHash1 = "/ipfs/zdj7WWeQ43G6JJvLWQWZpyHuAMq6uYWRjkBXFad11vE2LHhQ7";

  it("should return true for CID v0", () => {
    expect(isIpfsHash(ipfsHash0)).to.equal(true);
  });

  it("should return true for CID v1", () => {
    expect(isIpfsHash(ipfsHash1)).to.equal(true);
  });

  it("should return false a non CID", () => {
    expect(isIpfsHash("non-hash")).to.equal(false);
  });
});
