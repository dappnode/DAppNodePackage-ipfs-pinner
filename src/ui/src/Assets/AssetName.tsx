import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Link } from "@material-ui/core";
import { getGatewayLink, getWebuiLink } from "../utils/links";

const useStyles = makeStyles(theme => ({
  statusCell: {
    display: "flex",
    alignItems: "center",
    "& svg": {
      fontSize: "1rem",
      display: "none"
    },
    "&:hover > svg": {
      display: "block"
    }
  },
  link: {
    transition: "color ease 100ms",
    color: "inherit",
    "&:hover": {
      color: theme.palette.primary.dark
    }
  }
}));

export default function AssetName({
  displayName,
  hash
}: {
  displayName: string;
  hash: string;
}) {
  // Load theme for colors
  const classes = useStyles();

  const gatewayLink = getGatewayLink(hash);
  const webuiLink = getWebuiLink(hash);

  return (
    <span className={classes.statusCell}>
      <Link
        href={displayName.includes("image") ? webuiLink : gatewayLink}
        className={classes.link}
        underline="none"
        target="_blank"
        rel="noopener noreferrer"
      >
        {displayName}
      </Link>
    </span>
  );
}
