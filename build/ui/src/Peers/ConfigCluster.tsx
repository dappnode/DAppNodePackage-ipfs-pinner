import React, { useState, useEffect } from "react";
import { useLocation } from "react-router";
import {
  getCurrentClusterSettings,
  setClusterSettings,
  ClusterEnvs,
  setClusterSecret
} from "./wampApi";
import { TextField, Tooltip, Button, LinearProgress } from "@material-ui/core";
import ShareLinkToJoinCluster from "./ShareLinkToJoinCluster";
import copy from "copy-to-clipboard";
import { ClusterPeer } from "../types";
import { getRandomHex, parseUrlToShare } from "./configClusterUtils";

function CopyableInput({ text }: { text: string }) {
  const [showTooltip, setShowTooltip] = useState(false);

  function onCopy() {
    copy(text);
    setShowTooltip(true);
  }

  return (
    <Tooltip
      open={showTooltip}
      title={"Copied to clipboard!"}
      leaveDelay={1500}
      onClose={() => setShowTooltip(false)}
    >
      <TextField
        onClick={onCopy}
        InputProps={{
          readOnly: true,
          disabled: true
        }}
        value={text}
        fullWidth
        margin="dense"
        variant="outlined"
      />
    </Tooltip>
    /* <List>
        <ListItem button style={{ border: "1px solid gray" }} onClick={onCopy}>
          <ListItemText>{text}</ListItemText>
        </ListItem>
      </List> */
  );
}

export default function ConfigCluster({
  yourPeer
}: {
  yourPeer: ClusterPeer | undefined;
}) {
  const [clusterEnvs, setClusterEnvs] = useState({} as ClusterEnvs);
  const yourSecret = clusterEnvs.CLUSTER_SECRET || "";
  const yourMultiaddress = yourPeer
    ? yourPeer.clusterAddresses.slice(-1)[0] || ""
    : "";
  const yourPeerId = yourPeer ? yourPeer.id || "" : "";

  const [generatingSecret, setGeneratingSecret] = useState(false);
  const [loadingSecret, setLoadingSecret] = useState(false);
  const [joiningCluster, setJoiningCluster] = useState(false);

  const location = useLocation();

  // Process of adding yourself to some else's cluster
  useEffect(() => {
    async function joinCluster() {
      const { secret, multiaddress } = parseUrlToShare(location.search);
      if (!secret || !multiaddress) return;
      if (!yourPeer) return; // Wait for yourPeer to be able to verify it's not you

      try {
        // Validate URL params
        if (!/[0-9A-Fa-f]{32}/g.test(secret))
          throw Error(`secret must be a 32 bytes hex string: ${secret}`);
        if (
          yourPeer.clusterAddresses.includes(multiaddress) ||
          multiaddress.includes(yourPeerId)
        )
          throw Error("You can't add yourself");

        // Set params
        setJoiningCluster(true);
        await setClusterSettings({ secret, multiaddress });
      } catch (e) {
        console.error(`Error joining cluster: ${e.stack}`);
      } finally {
        setJoiningCluster(false);
      }
    }

    joinCluster();

    // Display success
  }, [location, yourPeerId]);

  useEffect(() => {
    _getCurrentClusterSettings();
  }, []);

  async function _getCurrentClusterSettings() {
    try {
      setLoadingSecret(true);
      await getCurrentClusterSettings().then(setClusterEnvs);
    } catch (e) {
      console.error(`Error on getCurrentClusterSettings ${e.stack}`);
    } finally {
      setLoadingSecret(false);
    }
  }

  async function _setClusterSettings() {
    try {
      // await setClusterSettings({ secret, multiaddress });
    } catch (e) {
      console.error(`Error on setClusterSettings ${e.stack}`);
    }
  }

  async function generateSecret() {
    try {
      setGeneratingSecret(true);
      await setClusterSecret(getRandomHex(32));
      await _getCurrentClusterSettings();
    } catch (e) {
      console.error(`Error setting cluster secret: ${e.stack}`);
    } finally {
      setGeneratingSecret(false);
    }
  }

  return (
    <div>
      <ShareLinkToJoinCluster
        yourMultiaddress={yourMultiaddress}
        yourSecret={yourSecret}
        generatingSecret={generatingSecret}
        loadingSecret={loadingSecret}
        generateSecret={generateSecret}
      />
    </div>
  );
}
