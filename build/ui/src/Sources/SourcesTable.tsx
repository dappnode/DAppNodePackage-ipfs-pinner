import React from "react";
import isEqual from "lodash/isEqual";
import MaterialTable from "material-table";
import { tableIcons } from "../MaterialTable";
import moment from "moment";
import * as socket from "../socket";
import CardHeader from "../components/CardHeader";
import { sourcesPath } from "./index";
import { parseTypeAndDisplayName } from "../utils/multiname";
import { SourceWithMetadata } from "../types";

function SourcesTable({
  sources,
  summary
}: {
  sources: SourceWithMetadata[];
  summary?: boolean;
}) {
  async function deleteSource({ multiname }: SourceWithMetadata) {
    console.log(`deleting source ${multiname}`);
    await socket.delSource(multiname);
    console.log(`Successfully deleted ${multiname}`);
  }

  return (
    <div style={{ maxWidth: "100%" }}>
      <MaterialTable
        title="Sources"
        columns={[
          { title: "Name", field: "displayName" },
          { title: "Type", field: "type" },
          {
            title: "Added",
            field: "added",
            render: ({ added }) => moment(added).fromNow(),
            defaultSort: "desc"
          }
        ]}
        data={sources.map(source => {
          const { type, displayName } = parseTypeAndDisplayName(
            source.multiname
          );
          return {
            ...source,
            type,
            displayName
          };
        })}
        editable={!summary ? { onRowDelete: deleteSource } : {}}
        parentChildData={(row, rows) => {
          // There's an error in the typings, where this function expects row[],
          // but it really need a row element (the parent)
          const parent = rows.find(a => a.multiname === row.from);
          // @ts-ignore
          return parent as typeof rows;
        }}
        options={{
          actionsColumnIndex: -1,
          pageSize: summary ? 5 : 10,
          ...(summary
            ? {
                search: false,
                showTitle: false,
                rowStyle: {
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis"
                }
              }
            : {})
        }}
        components={
          summary
            ? {
                Toolbar: () => (
                  <CardHeader
                    title="Sources"
                    to={sourcesPath}
                    toText={"Manage sources"}
                  />
                )
              }
            : {}
        }
        // @ts-ignore
        icons={tableIcons}
      />
    </div>
  );
}

export default React.memo(SourcesTable, isEqual);
