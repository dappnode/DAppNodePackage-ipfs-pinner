import React from "react";
import PeersTable from "./PeersTable";
import { ClusterPeer } from "../types";
import ConfigCluster from "./ConfigCluster";
import isEqual from "lodash/isEqual";
import { peersPath } from "./data";

export { peersPath };

function Peers({ peers }: { peers: ClusterPeer[] }) {
  const yourPeer = peers.find(peer => peer.you);

  return (
    <>
      <ConfigCluster yourPeer={yourPeer} />
      <PeersTable peers={peers} />
    </>
  );
}

export default React.memo(Peers, isEqual);
