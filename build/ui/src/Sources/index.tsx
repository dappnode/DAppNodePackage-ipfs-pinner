import React from "react";
import SourcesTable from "./SourcesTable";
import AddSourceForm from "./AddSourceForm";
import { SourceWithMetadata } from "../types";

export const sourcesPath = "/sources";

export default function Sources({
  sources
}: {
  sources: SourceWithMetadata[];
}) {
  return (
    <>
      <AddSourceForm />
      <SourcesTable sources={sources} />
    </>
  );
}
