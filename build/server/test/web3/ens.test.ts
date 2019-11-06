import "mocha";
import { expect } from "chai";

import resolveEnsContent, {
  namehash,
  decodeContentHash
} from "../../src/web3/resolveEnsContent";

/**
 * The purpose of this test is to make sure the ENS nodes are computed correctly
 *
 * [NOTE] tests are specified in the `domains` object = {
 *   "domain-to-test": "expected node to be returned"
 * }
 */

const domainsToNamehash = {
  "decentral.eth":
    "0x880271a5aa586090a365755936242b05d4a5378eff6aba78f3af81deb0158b0b",
  "my.admin.dnp.dappnode.eth":
    "0x8ee9dcc8fbece2dd5bd100ca63e11ca37e1d1ddedfbb5469dac1ea5e2d889a45",
  "mycrypto.dappnode.eth":
    "0xa447e2756a96e5d76aa44c925dd7a10241836f134b9a4acc432db6c784bd4ea9",
  "portalnetwork.eth":
    "0x05c84f0505a22d7072990fc4dabd7d7028c69c0c55dcdc4d20dac25b36581a7c",
  "eth2dai.eduadiez.eth":
    "0xac3ab696061345d6c2595d7630e38ebae403b8d05e31be5d44aa073ea0f3e447"
};

const domainToContent = {
  "decentral.eth": "/ipfs/QmXufxJH2a14QcWdvaHq3PMmFLK8xmCXoD68NVaxchSEVi",
  "mycrypto.dappnode.eth":
    "/ipfs/Qmdojo8KAsZu7XTkETYwSiZMCjdUa58YNZCUKmsZ21i8gV",
  "eth2dai.eduadiez.eth": "/ipfs/QmZoHo1wi4G9VHX6xLmMBRdFpdHMkHnsqVXqV6Vsng9m8j"
};

const contentHashes = {
  "0xe30101701220aa4396c7e54ce85638b1f5a66f83b0b698a80e6ca3511ccc7e8551c6ae89ab40":
    "/ipfs/QmZoHo1wi4G9VHX6xLmMBRdFpdHMkHnsqVXqV6Vsng9m8j"
};

describe("ENS", () => {
  describe("getContent", () => {
    for (const [domain, expectedContent] of Object.entries(domainToContent)) {
      it(`should return the IPFS hash of ${domain}`, async () => {
        const content = await resolveEnsContent(domain);
        expect(content).to.equal(expectedContent);
      }).timeout(30 * 1000);
    }
  });

  describe("util > namehash", () => {
    for (const [domain, expectedNode] of Object.entries(domainsToNamehash)) {
      it(`should compute the node of ${domain}`, async () => {
        const node = namehash(domain);
        expect(node).to.equal(expectedNode);
      });
    }
  });

  describe("util > decodeContentHash (CONTENTHASH_INTERFACE_ID = '0xbc1c58d1')", () => {
    for (const [contentHashEncoded, expectedContent] of Object.entries(
      contentHashes
    )) {
      it(`should decode ${contentHashEncoded}`, async () => {
        const content = decodeContentHash(contentHashEncoded);
        expect(content).to.equal(expectedContent);
      });
    }
  });
});
