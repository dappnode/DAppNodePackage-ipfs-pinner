import React from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import moment from "moment";
//
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import { ClusterPeer } from "../types";

export default function PeerDetail({ peer }: { peer: ClusterPeer }) {
  const addressArray: { name: string; address: string }[] = [
    ...peer.clusterAddresses.map((address, i) => ({
      name: `Cluster ${i}`,
      address
    })),
    ...peer.ipfsAddresses.map((address, i) => ({
      name: `IPFS ${i}`,
      address
    }))
  ];
  return (
    <Card>
      <CardContent>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell align="right">Address</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {addressArray.map(({ name, address }) => (
              <TableRow key={peer.peername}>
                <TableCell component="th" scope="row">
                  {name}
                </TableCell>
                <TableCell align="right">{address}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
