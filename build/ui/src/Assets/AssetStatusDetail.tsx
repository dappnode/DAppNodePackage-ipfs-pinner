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
import moment from "moment";
import PinStatusDot from "./PinStatusDot";
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
