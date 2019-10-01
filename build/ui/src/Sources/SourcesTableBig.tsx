import React from "react";
import MaterialTable from "material-table";
import { tableIcons } from "../MaterialTable";
import moment from "moment";
import socket from "../socket";
import { SourcesApi } from "../types";

export default function SourcesTableBig({ sources }: { sources: SourcesApi }) {
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
        data={sources}
        editable={{
          onRowDelete: source =>
            new Promise((resolve, reject) => {
              console.log(`Deleting source ${source.type} ${source.id}`);
              socket.emit("delSource", source.type, source.id, (res: any) => {
                console.log("Deleted source", res);
                if (res && res.error) reject(res.error);
                else resolve();
              });
            })
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
