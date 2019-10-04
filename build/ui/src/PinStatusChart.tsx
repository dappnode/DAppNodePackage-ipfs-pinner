import React, { useState } from "react";
import Chart from "react-apexcharts";
import Button from "@material-ui/core/Button";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { useTheme } from "@material-ui/styles";
import ClockIcon from "@material-ui/icons/Schedule";
import { Typography, Grid } from "@material-ui/core";
import { AssetWithMetadata, PinStatus, pinStatus } from "./types";
import statusColorMap from "./components/statusColorMap";
import { parseType } from "./utils/multiname";

interface Pins {
  [type: string]: {
    pinned: number;
    remote: number;
    pinning: number;
    unpinning: number;
    pin_queued: number;
    unpin_queued: number;
    queued: number;
    cluster_error: number;
    pin_error: number;
    unpin_error: number;
    error: number;
  };
}

const statusOrdered: PinStatus[] = [
  pinStatus.pinned,
  pinStatus.remote,
  pinStatus.pinning,
  pinStatus.unpinning,
  pinStatus.pin_queued,
  pinStatus.unpin_queued,
  pinStatus.queued,
  pinStatus.cluster_error,
  pinStatus.pin_error,
  pinStatus.unpin_error,
  pinStatus.error
];

/**
 * Plot a horizontal
 * @param pins = [{
 *   id: "apm",
 *   status: {
 *     pinned: 243,
 *     pinning: 31,
 *     error: 2
 *   }
 * }, ... ]
 */
export default function PinStatusChart({
  assets
}: {
  assets: AssetWithMetadata[];
}) {
  const [onlyTotal, setOnlyTotal] = useState(true);

  const pins = aggregatePins(assets, onlyTotal);

  /**
   * Chart options
   */

  // Load theme for colors
  const theme: any = useTheme();
  const textColor = theme.palette.text.secondary;
  const textSize = theme.typography.fontSize;

  const options = {
    colors: statusOrdered.map(status => statusColorMap(status, theme)),
    chart: {
      stacked: true,
      // stackType: "100%" /* Force full-width and display % */,
      width: "100%",
      id: "pin-status-chart",
      toolbar: {
        show: true,
        tools: {
          download: false
        }
      }
    },
    plotOptions: {
      bar: {
        horizontal: true,
        endingShape: "rounded",
        columnWidth: "100%"
      }
    },
    xaxis: {
      categories: Object.keys(pins),
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
      max: null // Force max to be the exact max value
    },
    yaxis: {
      labels: {
        // Hide single "total name"
        show: !onlyTotal,
        style: {
          color: textColor,
          fontSize: textSize
        }
      }
    },
    grid: {
      yaxis: {
        lines: { show: false }
      }
    },
    tooltip: {
      x: { show: !onlyTotal }
    },
    legend: {
      showForSingleSeries: true, // Explain green is pinned if it's the only state
      showForNullSeries: false,
      showForZeroSeries: false,
      fontSize: textSize,
      labels: {
        colors: textColor
      },
      onItemClick: {
        // Disable for single series
        // Otherwise, the chart dissapears if the user clicks it
        // toggleDataSeries: statusArrayOrdered.length > 1
      }
    }
    // Legend has to be on the bottom or it becames really ugly
  };

  return (
    <div>
      <Typography
        style={{ marginBottom: -40 }}
        align="center"
        color="textSecondary"
      >
        {computePinnedPercent(pins)}% pinned, 100% clusters online
      </Typography>
      <Chart
        options={options}
        series={statusOrdered.map(status => ({
          name: status,
          data: Object.values(pins).map(
            countObj => (countObj || {})[status] || 0
          )
        }))}
        type="bar"
        // width={500}
        // {...(onlyTotal ? { height: 150 } : {})}
        height={70 + 70 * Object.keys(pins).length}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <Button onClick={() => setOnlyTotal(!onlyTotal)}>
          <span style={{ display: "flex", color: textColor }}>
            {onlyTotal ? <ExpandMoreIcon /> : <ExpandLessIcon />}
          </span>
          <span style={{ color: textColor }}>
            {onlyTotal ? "Expand" : "Collapse"}
          </span>
        </Button>
      </div>
    </div>
  );
}

// Utils

/**
 * Computes the percentage of pins with "pinned" status
 * @param pins
 * @returns 95.4%
 */
function computePinnedPercent(pins: Pins): string {
  let totalPins = 0;
  let totalPinned = 0;
  for (const countObj of Object.values(pins)) {
    totalPinned += (countObj || {}).pinned || 0;
    for (const count of Object.values(countObj || {})) totalPins += count || 0;
  }
  return ((100 * totalPinned) / totalPins).toPrecision(3);
}

/**
 * Convert a list of pinsLsStatus into a by-category list
 * @param pinsLsStatus
 * @returns pins
 */
function aggregatePins(assets: AssetWithMetadata[], total: boolean): Pins {
  const pins: Pins = {};
  for (const asset of assets) {
    const type = total ? "total" : parseType(asset.multiname);
    for (const peer of Object.values(asset.peerMap)) {
      const status = peer.status;
      pins[type] = {
        ...(pins[type] || {}),
        [status]: 1 + ((pins[type] || {})[status] || 0)
      };
    }
  }
  return pins;
}
