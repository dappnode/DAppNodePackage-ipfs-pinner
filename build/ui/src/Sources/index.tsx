import React from "react";
import SourcesTableBig from "./SourcesTableBig";
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
      <SourcesTableBig sources={sources} />
    </>
  );
}
