import React from "react";
import PeersTable from "./PeersTable";
import { ClusterPeer } from "../types";

export const peersPath = "/peers";

export default function Peers({ peers }: { peers: ClusterPeer[] }) {
  return (
    <>
      <PeersTable peers={peers} />
    </>
  );
}
