import React from "react";
import SourcesTableBig from "./SourcesTableBig";
import AddSourceForm from "./AddSourceForm";
import { SourcesApi, SourceOptionsApi } from "../types";

export const sourcesPath = "/sources";

export default function Sources({ sources }: { sources: SourcesApi }) {
  return (
    <>
      <AddSourceForm />
      <SourcesTableBig sources={sources} />
    </>
  );
}
