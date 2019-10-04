import React from "react";
import MaterialTable from "material-table";
import { tableIcons } from "../MaterialTable";
import moment from "moment";
import socket from "../socket";
import { parseTypeAndDisplayName } from "../utils/multiname";
import { SourceWithMetadata } from "../types";

export default function SourcesTableBig({
  sources
}: {
  sources: SourceWithMetadata[];
}) {
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
        editable={{
          onRowDelete: source =>
            new Promise((resolve, reject) => {
              console.log(`Deleting source ${source.multiname}`);
              socket.emit("delSource", source.multiname, (res: any) => {
                console.log("Deleted source", res);
                if (res && res.error) reject(res.error);
                else resolve();
              });
            })
        }}
        parentChildData={(row, rows) => {
          // There's an error in the typings, where this function expects row[],
          // but it really need a row element (the parent)
          const parent = rows.find(a => a.multiname === row.from);
          // @ts-ignore
          return parent as typeof rows;
        }}
        options={{
          actionsColumnIndex: -1,
          pageSize: 10
        }}
        // @ts-ignore
        icons={tableIcons}
      />
    </div>
  );
}
