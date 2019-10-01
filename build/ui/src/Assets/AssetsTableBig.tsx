import React from "react";
import MaterialTable from "material-table";
import { tableIcons } from "../MaterialTable";
import moment from "moment";
// Components
import AssetStatusDetail from "./AssetStatusDetail";
import PinStatusDot from "../components/PinStatusDot";
import { AssetsApi } from "../types";

export default function AssetsTableBig({ assets }: { assets: AssetsApi }) {
  return (
    <div style={{ maxWidth: "100%" }}>
      <MaterialTable
        title="Assets"
        columns={[
          { title: "Name", field: "displayName" },
          // { title: "", field: "assetId", sorting: false },
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
        data={assets}
        // editable={{
        //   onRowDelete: oldData =>
        //     new Promise((resolve, reject) => {
        //       setTimeout(() => {
        //         alert(`Deleting ${oldData.name}`);
        //         resolve();
        //       }, 1000);
        //     })
        // }}
        detailPanel={rowData => (
          <AssetStatusDetail
            asset={assets.find(pin => pin.hash === rowData.hash)}
          />
        )}
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
