import "mocha";
import { expect } from "chai";

import fetchIpfsRelease from "../../src/fetchers/fetchDnpIpfsReleaseAssets";

describe("Fetcher > fetchIpfsRelease", () => {
  it("Should fetch a regular release", async () => {
    const contentUri = "/ipfs/QmS55w46C2uLk55TySN38SEihgTmL1do4rxoBoiRAz12BK";
    // name: "bind.dnp.dappnode.eth",
    // version: "0.2.0",
    // contentUri: "/ipfs/QmS55w46C2uLk55TySN38SEihgTmL1do4rxoBoiRAz12BK"
    const release = await fetchIpfsRelease(contentUri);
    expect(release).to.deep.equal([
      {
        filename: "manifest",
        hash: "/ipfs/QmS55w46C2uLk55TySN38SEihgTmL1do4rxoBoiRAz12BK"
      },
      {
        filename: "image",
        hash: "/ipfs/QmdzT5y1vmizD5woFtKpJcr3U4tMCvh1nS7m5wCt7FdutM"
      },
      {
        filename: "avatar",
        hash: "/ipfs/QmNPDBS2RzQrmtwQ1kpvogCA74ZSWmn8crEU86u2EKAgvy"
      }
    ]);
  }).timeout(30 * 1000);
});
