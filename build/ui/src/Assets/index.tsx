import React from "react";
import AssetsTableBig from "./AssetsTableBig";
import { AssetsApi } from "../types";

export const assetsPath = "/assets";

export default function Assets({ assets }: { assets: AssetsApi }) {
  return <AssetsTableBig assets={assets} />;
}
