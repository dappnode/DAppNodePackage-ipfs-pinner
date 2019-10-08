import React from "react";
import { useTheme } from "@material-ui/styles";
import { PinStatus } from "../types";
import statusColorMap from "../components/statusColorMap";

export default function PinStatusDot({ status }: { status: PinStatus }) {
  // Load theme for colors
  const theme: any = useTheme();

  return (
    <span>
      <span
        style={{ color: statusColorMap(status, theme) }}
        role="img"
        aria-label="status"
      >
        🌑
      </span>
      <span style={{ marginLeft: "0.5rem" }}>{status}</span>
    </span>
  );
}
