import React from "react";
import AssetsTable from "./AssetsTable";
import { AssetWithMetadata } from "../types";

export const assetsPath = "/assets";

export default function Assets({ assets }: { assets: AssetWithMetadata[] }) {
  return <AssetsTable assets={assets} />;
}
