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
import { AssetsApiItem } from "../types";

export default function AssetStatusDetail({
  asset
}: {
  asset: AssetsApiItem | undefined;
}) {
  if (!asset)
    return (
      <Card>
        <CardContent>No pin selected</CardContent>
      </Card>
    );
  return (
    <Card>
      <CardContent>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Cluster name</TableCell>
              <TableCell align="right">Status</TableCell>
              <TableCell align="right">Last updated</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.values(asset.clusters).map(peer => (
              <TableRow key={peer.name}>
                <TableCell component="th" scope="row">
                  {peer.name}
                </TableCell>
                <TableCell align="right">
                  {peer.error ? `${peer.status}: ${peer.error}` : peer.status}
                </TableCell>
                <TableCell align="right">
                  {moment(peer.timestamp).fromNow()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
