import React from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import moment from "moment";
import PinStatusDot from "./PinStatusDot";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import { AssetWithMetadata } from "../types";

export default function AssetStatusDetail({
  asset
}: {
  asset: AssetWithMetadata;
}) {
  return (
    <Card>
      <CardContent>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Cluster name</TableCell>
              <TableCell>Error</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last updated</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.values(asset.peerMap).map(peer => (
              <TableRow key={peer.peername}>
                <TableCell component="th" scope="row">
                  {peer.peername}
                </TableCell>
                <TableCell>{peer.error || "-"}</TableCell>
                <TableCell>
                  <PinStatusDot status={peer.status} />
                </TableCell>
                <TableCell>{moment(peer.timestamp).fromNow()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
