import React from "react";
import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from "@material-ui/core";
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
              <TableCell>Address</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {addressArray.map(({ name, address }) => (
              <TableRow key={name}>
                <TableCell component="th" scope="row">
                  {name}
                </TableCell>
                <TableCell>{address}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
