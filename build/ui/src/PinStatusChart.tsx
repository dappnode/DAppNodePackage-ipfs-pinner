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

  const pins = aggregatePins(assets);

  /**
   * Chart options
   */
  // Load theme for colors
  const theme: any = useTheme();
  const textColor = theme.palette.text.secondary;
  const textSize = theme.typography.fontSize;

  /**
   * Generate series data in the appropiate format
   *
   * const series = [
   *   {
   *     name: "Marine Sprite",
   *     data: [44, 55, 41, 37, 22, 43, 21]
   *   },
   *   {
   *     name: "Striking Calf",
   *     data: [53, 32, 33, 52, 13, 43, 32]
   *   }
   * ];
   */

  const statusArray = getAllStatusFromPins(pins);
  const statusArrayOrdered = statusOrdered.filter(status =>
    statusArray.includes(status)
  );

  const series = statusArrayOrdered.map(status => {
    return {
      name: status,
      data: (onlyTotal ? aggregateTotal(pins, statusArrayOrdered) : pins).map(
        pinGroup => pinGroup.status[status] || 0
      )
    };
  });

  const options = {
    colors: statusArrayOrdered.map(status => statusColorMap(status, theme)),
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
      categories: pins.map(({ type }) => type),
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
      fontSize: textSize,
      labels: {
        colors: textColor
      },
      onItemClick: {
        // Disable for single series
        // Otherwise, the chart dissapears if the user clicks it
        toggleDataSeries: statusArrayOrdered.length > 1
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
        series={series}
        type="bar"
        // width={500}
        // {...(onlyTotal ? { height: 150 } : {})}
        height={70 + 70 * pins.length}
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
 * Returns an array of unique status occurring in at least one pin
 * @param pins
 * @returns ["pinned", "pinning"]
 */
function getAllStatusFromPins(pins: PinGroup[]): PinStatus[] {
  const statusList: { [status: string]: true } = {};
  for (const pinGroup of pins)
    for (const status of Object.keys(pinGroup.status))
      statusList[status] = true;
  return Object.keys(statusList) as PinStatus[];
}

/**
 * Computes the percentage of pins with "pinned" status
 * @param pins
 * @returns 95.4%
 */
function computePinnedPercent(pins: PinGroup[]): string {
  const totalPins = pins.reduce((total, pin) => {
    const localTotal = statusOrdered.reduce(
      (t, status) => (pin.status[status] || 0) + t,
      0
    );
    return total + localTotal;
  }, 0);
  const totalPinned = pins.reduce((total, pin) => {
    return pin.status.pinned + total;
  }, 0);
  return ((100 * totalPinned) / totalPins).toPrecision(3);
}

/**
 * Convert a list of pinsLsStatus into a by-category list
 * @param pinsLsStatus
 * @returns pins
 */
function aggregatePins(assets: AssetWithMetadata[]): Pins {
  const pins: Pins = {};
  for (const asset of assets) {
    const type = parseType(asset.multiname);
    for (const peer of Object.values(asset.peerMap)) {
      const status = peer.status;
      pins[type] = {
        ...(pins[type] || {}),
        [status]: 1 + (pins[type][status] || 0)
      };
    }
  }
  return pins;
}

/**
 * Collapses a by-type category into a grand single total by status
 */
function aggregateTotal(pins: Pins, statusArrayOrdered: PinStatus[]): Pins {
  return [
    pins.reduce(
      (totalGroup: PinGroup, pinGroup) => {
        for (const status of statusArrayOrdered)
          totalGroup.status[status] =
            (totalGroup.status[status] || 0) + (pinGroup.status[status] || 0);
        return totalGroup;
      },
      { type: "total", status: {} }
    )
  ];
}
