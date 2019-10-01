import { AssetsApi, SourcesApi } from "./types";

export const assetsSample: AssetsApi = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12].map(
  n => ({
    hash: "QmPGzyXqbSojahV6rAikqW92rKeXmEK6GrwyKQTZvV4nCt",
    displayName: `ipfs.dnp.dappnode.eth @ 0.2.${n} - manifest`,
    type: "apm-dnp-repo-file",
    status: n % 2 === 0 ? "pinned" : "pinning",
    latestUpdate: 1569836652305,
    clusters: [
      {
        name: "cluster0",
        status: n % 2 === 0 ? "pinned" : "pinning",
        error: "",
        timestamp: 1569836652305
      }
    ]
  })
);

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

export const sourcesSample: SourcesApi = [
  {
    type: "apm-registry",
    id: "apm-registry/dnp.dappnode.eth",
    displayName: "dnp.dappnode.eth",
    added: 1569836652305
  },
  {
    type: "apm-dnp-repo",
    id: "/apm-dnp-repo/rinkeby.dnp.dappnode.eth",
    displayName: "rinkeby.dnp.dappnode.eth",
    added: 1569830052305
  }
];
