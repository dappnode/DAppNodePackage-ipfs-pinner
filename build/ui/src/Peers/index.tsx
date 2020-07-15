import React from "react";
import PeersTable from "./PeersTable";
import { ClusterPeer } from "../types";
import ShareLinkToJoinCluster from "./ShareLinkToJoinCluster";
import JoinAnotherCluster from "./JoinAnotherCluster";
import isEqual from "lodash/isEqual";
import { peersPath } from "./data";

export { peersPath };

function Peers({ peers }: { peers: ClusterPeer[] }) {
  return (
    <>
      <JoinAnotherCluster />
      <ShareLinkToJoinCluster />
      <PeersTable peers={peers} />
    </>
  );
}

export default React.memo(Peers, isEqual);
