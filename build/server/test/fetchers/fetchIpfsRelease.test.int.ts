import "mocha";
import { expect } from "chai";

import fetchIpfsRelease from "../../src/fetchers/fetchIpfsRelease";

describe("Fetcher > fetchIpfsRelease", () => {
  it("Should fetch a regular release", async () => {
    const release = await fetchIpfsRelease({
      name: "bind.dnp.dappnode.eth",
      version: "0.2.0",
      contentUri: "/ipfs/QmS55w46C2uLk55TySN38SEihgTmL1do4rxoBoiRAz12BK"
    });
    expect(release).to.equal([
      {
        id: "manifest",
        hash: "/ipfs/QmS55w46C2uLk55TySN38SEihgTmL1do4rxoBoiRAz12BK",
        size: 0,
        dir: false,
        source: {
          from: "apm",
          name: "bind.dnp.dappnode.eth",
          version: "0.2.0"
        }
      },
      {
        id: "image",
        hash: "/ipfs/QmdzT5y1vmizD5woFtKpJcr3U4tMCvh1nS7m5wCt7FdutM",
        size: 16168666,
        dir: false,
        source: {
          from: "apm",
          name: "bind.dnp.dappnode.eth",
          version: "0.2.0"
        }
      },
      {
        id: "avatar",
        hash: "/ipfs/QmNPDBS2RzQrmtwQ1kpvogCA74ZSWmn8crEU86u2EKAgvy",
        size: 0,
        dir: false,
        source: {
          from: "apm",
          name: "bind.dnp.dappnode.eth",
          version: "0.2.0"
        }
      }
    ]);
  }).timeout(30 * 1000);
});
