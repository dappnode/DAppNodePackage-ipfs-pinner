import React from "react";
import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Link
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import moment from "moment";
import AssetStatusDot from "./AssetStatusDot";
import { AssetWithMetadata } from "../types";
import { getGatewayLink, getWebuiLink } from "../utils/links";

const useStyles = makeStyles(theme => ({
  links: {
    marginLeft: "14px",
    "& *:not(:last-child)": {
      marginRight: "1rem"
    },
    "& a": {
      transition: "color ease 100ms"
    }
  }
}));

export default function AssetStatusDetail({
  asset
}: {
  asset: AssetWithMetadata;
}) {
  const classes = useStyles();

  const { hash } = asset;
  const gatewayLink = getGatewayLink(hash);
  const webuiLink = getWebuiLink(hash);

  return (
    <Card>
      <CardContent>
        <div className={classes.links}>
          <span>
            <code>{hash}</code>
          </span>
          <span style={{ color: "#e0e0e0" }}>|</span>
          <Link href={gatewayLink} target="_blank" rel="noopener noreferrer">
            View on gateway
          </Link>
          <span style={{ color: "#e0e0e0" }}>|</span>
          <Link href={webuiLink} target="_blank" rel="noopener noreferrer">
            View on WebUI
          </Link>
        </div>

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
                  <AssetStatusDot status={peer.status} />
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
