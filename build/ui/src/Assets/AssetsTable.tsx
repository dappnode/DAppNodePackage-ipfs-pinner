import React from "react";
import { isEqual } from "lodash";
import MaterialTable from "material-table";
import { tableIcons } from "../MaterialTable";
import moment from "moment";
// Components
import AssetStatusDetail from "./AssetStatusDetail";
import PinStatusDot from "./PinStatusDot";
import CardHeader from "../components/CardHeader";
import { assetsPath } from "./index";
import { AssetWithMetadata } from "../types";
import { parseTypeAndDisplayName } from "../utils/multiname";

interface AssetsTableProps {
  assets: AssetWithMetadata[];
  summary?: boolean;
}

function AssetsTable({ assets, summary }: AssetsTableProps) {
  return (
    <div style={{ maxWidth: "100%" }}>
      <MaterialTable
        title="Assets"
        columns={[
          { title: "Name", field: "displayName" },
          { title: "Type", field: "type", hidden: summary },
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
        data={assets.map(asset => {
          const { type, displayName } = parseTypeAndDisplayName(
            asset.multiname
          );
          return {
            ...asset,
            type,
            displayName,
            status: (Object.values(asset.peerMap)[0] || {}).status,
            latestUpdate: (Object.values(asset.peerMap)[0] || {}).timestamp
          };
        })}
        // editable={{
        //   onRowDelete: oldData =>
        //     new Promise((resolve, reject) => {
        //       setTimeout(() => {
        //         alert(`Deleting ${oldData.name}`);
        //         resolve();
        //       }, 1000);
        //     })
        // }}
        detailPanel={
          !summary ? asset => <AssetStatusDetail asset={asset} /> : undefined
        }
        components={
          summary
            ? {
                Toolbar: () => (
                  <CardHeader
                    title="Assets"
                    to={assetsPath}
                    toText={"Manage assets"}
                  />
                )
              }
            : {}
        }
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
        // @ts-ignore
        icons={tableIcons}
      />
    </div>
  );
}

export default React.memo(AssetsTable, isEqual);
