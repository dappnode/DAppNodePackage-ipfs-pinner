import React, { useState, useEffect } from "react";
import {
  getCurrentClusterSettings,
  ClusterEnvs,
  setClusterSecret
} from "./wampApi";
import ShareLinkToJoinCluster from "./ShareLinkToJoinCluster";
import JoinAnotherCluster from "./JoinAnotherCluster";
import { ClusterPeer } from "../types";
import { getRandomHex } from "./configClusterUtils";

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
    <>
      <JoinAnotherCluster yourPeerId={yourPeerId} />

      <ShareLinkToJoinCluster
        yourMultiaddress={yourMultiaddress}
        yourSecret={yourSecret}
        generatingSecret={generatingSecret}
        loadingSecret={loadingSecret}
        generateSecret={generateSecret}
      />
    </>
  );
}
