import "mocha";
import { expect } from "chai";

import fetchIpfsRelease from "../../src/fetchers/fetchDnpIpfsReleaseAssets";

describe("Fetcher > fetchIpfsRelease", () => {
  it("Should fetch a regular release", async () => {
    const contentUri = "/ipfs/QmS55w46C2uLk55TySN38SEihgTmL1do4rxoBoiRAz12BK";
    // name: "bind.dnp.dappnode.eth",
    // version: "0.2.0",
    const release = await fetchIpfsRelease(contentUri);
    expect(release).to.deep.equal([
      {
        filename: "manifest",
        hash: "QmS55w46C2uLk55TySN38SEihgTmL1do4rxoBoiRAz12BK"
      },
      {
        filename: "image",
        hash: "QmdzT5y1vmizD5woFtKpJcr3U4tMCvh1nS7m5wCt7FdutM"
      },
      {
        filename: "avatar",
        hash: "QmNPDBS2RzQrmtwQ1kpvogCA74ZSWmn8crEU86u2EKAgvy"
      }
    ]);
  }).timeout(30 * 1000);

  it("Should fetch a contentURI type ipfs:Qm", async () => {
    const contentUri = "ipfs:QmQmv6Sx2XGDKtncqZPYz3skQjJtxCbcfuPyyDh8iHx2P3";
    // name: "finance.aragonpm.eth",
    // version: "2.1.0",
    const release = await fetchIpfsRelease(contentUri);
    expect(release).to.deep.equal([
      {
        filename: "directory",
        hash: "QmQmv6Sx2XGDKtncqZPYz3skQjJtxCbcfuPyyDh8iHx2P3"
      }
    ]);
  }).timeout(30 * 1000);
});
