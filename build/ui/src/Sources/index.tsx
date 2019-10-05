import React from "react";
import SourcesTable from "./SourcesTable";
import AddSourceForm from "./AddSourceForm";
import { SourceWithMetadata } from "../types";
import { Typography, Box } from "@material-ui/core";

export const sourcesPath = "/sources";

export default function Sources({
  sources
}: {
  sources: SourceWithMetadata[];
}) {
  return (
    <>
      <Typography align="center" color="textSecondary">
        Select an asset type to start
      </Typography>

      <AddSourceForm />
      <SourcesTable sources={sources} />
    </>
  );
}
