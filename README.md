# DAppNode_IPFS_Replicator

Simple IPFS replicator to mantain DAppNode's content

## Architecture

A docker-compose handles:

1. Nodejs App that manages the pinning
2. Local IPFS node

### Nodejs App

Fetches releases INFO from the APM smart contracts via infura and from github releases The goal of this replicator it to aggregate valuable content, without un-pinning old versions. If size becomes a concern a "garbage-colector" mechanism will be implemented.

- Get names of repos from a the `dnp.dappnode.eth` repo via events
- Once a new name is discovered, fetch new versions and store their contents
- Do not use websockets, query every x blocks that range of blocks

## Identifiers

Pin id

```
/apm-dnp-repo-file/geth.dnp.dappnode.eth/0.2.5/manifest
/apm-dnp-repo-dir/geth.dnp.dappnode.eth/0.2.5
```

Asset id

```
/apm-dnp-repo/geth.dnp.dappnode.eth
/apn-registry/dnp.dappnode.eth
```
