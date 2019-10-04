import React from "react";
import AssetsTableBig from "./AssetsTableBig";
import { AssetWithMetadata } from "../types";

export const assetsPath = "/assets";

export default function Assets({ assets }: { assets: AssetWithMetadata[] }) {
  return <AssetsTableBig assets={assets} />;
}
