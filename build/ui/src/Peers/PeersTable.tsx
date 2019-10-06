import React from "react";
import isEqual from "lodash/isEqual";
import MaterialTable from "material-table";
import { tableIcons } from "../MaterialTable";
import { ClusterPeer } from "../types";
import PeerDetail from "./PeerDetail";

function PeersTable({ peers }: { peers: ClusterPeer[]; summary?: boolean }) {
  return (
    <div style={{ maxWidth: "100%" }}>
      <MaterialTable
        title="Peers"
        columns={[
          {
            title: "Name",
            field: "peername",
            render: data => data.peername + (data.you ? " (this peer)" : "")
          },
          { title: "Id", field: "id" },
          { title: "Status", field: "status" }
        ]}
        data={peers.map(peer => {
          return {
            ...peer,
            status: peer.clusterError
              ? `Cluster error: ${peer.clusterError}`
              : peer.ipfsError
              ? `IPFS error: ${peer.ipfsError}`
              : "ok"
          };
        })}
        detailPanel={peer => <PeerDetail peer={peer} />}
        options={{
          actionsColumnIndex: -1,
          pageSize: 10
        }}
        // @ts-ignore
        icons={tableIcons}
      />
    </div>
  );
}

export default React.memo(PeersTable, isEqual);
