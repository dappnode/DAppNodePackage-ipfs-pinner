import React from "react";
import MaterialTable from "material-table";
import moment from "moment";
import { tableIcons } from "../MaterialTable";
import CardHeader from "../components/CardHeader";
import { SourceWithMetadata } from "../types";
import { sourcesPath } from "./index";

export default function SourcesTableSummary({
  sources
}: {
  sources: SourceWithMetadata[];
}) {
  return (
    <div style={{ maxWidth: "100%" }}>
      <MaterialTable
        title=""
        columns={[
          { title: "Name", field: "multiname" },
          { title: "Type", field: "multiname" },
          {
            title: "Added",
            field: "added",
            render: ({ added }) => moment(added).fromNow(),
            defaultSort: "desc"
          }
        ]}
        data={sources}
        options={{
          actionsColumnIndex: -1,
          search: false,
          showTitle: false,
          rowStyle: {
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis"
          }
        }}
        components={{
          Toolbar: () => (
            <CardHeader
              title="Sources"
              to={sourcesPath}
              toText={"Manage sources"}
            />
          )
        }}
        // @ts-ignore
        icons={tableIcons}
      />
    </div>
  );
}
