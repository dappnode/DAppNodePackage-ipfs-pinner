import React from "react";
import MaterialTable from "material-table";
import moment from "moment";
import { tableIcons } from "../MaterialTable";
import CardHeader from "../components/CardHeader";
import { AssetWithMetadata } from "../types";
import PinStatusDot from "../components/PinStatusDot";
import { assetsPath } from "./index";

export default function AssetsTableSummary({
  assets
}: {
  assets: AssetWithMetadata[];
}) {
  return (
    <div style={{ maxWidth: "100%" }}>
      <MaterialTable
        title=""
        columns={[
          { title: "Name", field: "multiname" },
          {
            title: "Status",
            field: "status",
            render: ({ status }) => <PinStatusDot status={status} />
          },
          {
            title: "Updated",
            field: "latestUpdate",
            render: ({ latestUpdate }) => moment(latestUpdate).fromNow(),
            defaultSort: "desc"
          }
        ]}
        data={assets.map(asset => ({
          ...asset,
          status: Object.values(asset.peerMap)[0].status,
          latestUpdate: Object.values(asset.peerMap)[0].timestamp
        }))}
        options={{
          actionsColumnIndex: -1,
          search: false,
          showTitle: false,
          rowStyle: {
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis"
          }
          // padding: "dense"
        }}
        components={{
          Toolbar: () => (
            <CardHeader
              title="Assets"
              to={assetsPath}
              toText={"Manage assets"}
            />
          )
        }}
        // @ts-ignore
        icons={tableIcons}
      />
    </div>
  );
}
