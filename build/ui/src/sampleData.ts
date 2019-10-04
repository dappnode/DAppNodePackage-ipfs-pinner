import { AssetWithMetadata, SourceWithMetadata } from "./types";

const timestamp =
  "Fri Oct 04 2019 14:50:51 GMT+0200 (Central European Summer Time)";

export const assetsSample: AssetWithMetadata[] = [
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  11,
  12
].map(n => ({
  hash: "QmPGzyXqbSojahV6rAikqW92rKeXmEK6GrwyKQTZvV4nCt",
  multiname: `apm-dnp-repo-file/ipfs.dnp.dappnode.eth/0.2.${n}/manifest`,
  from: `apm-dnp-repo/ipfs.dnp.dappnode.eth`,
  status: n % 2 === 0 ? "pinned" : "pinning",
  latestUpdate: timestamp,
  peerMap: {
    ["GASa6sf7a6s98f68as9faawfasf1"]: {
      peername: "cluster0",
      status: n % 2 === 0 ? "pinned" : "pinning",
      error: "",
      timestamp
    }
  }
}));

/**
 *
 *
 *
 *
 *
 *
 *
 *
 *
 */

export const sourcesSample: SourceWithMetadata[] = [
  {
    multiname: "apm-registry/dnp.dappnode.eth",
    from: "user",
    added: 1569836652305
  },
  {
    multiname: "apm-dnp-repo/rinkeby.dnp.dappnode.eth",
    from: "apm-registry/dnp.dappnode.eth",
    added: 1569830052305
  }
];
