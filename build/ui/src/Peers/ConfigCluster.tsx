import React, { useState, useEffect } from "react";
import * as wampApi from "./wampApi";
import ShareLinkToJoinCluster from "./ShareLinkToJoinCluster";
import JoinAnotherCluster from "./JoinAnotherCluster";
import { ClusterPeer } from "../types";
import { getRandomHex } from "./configClusterUtils";

export default function ConfigCluster({
  yourPeer
}: {
  yourPeer: ClusterPeer | undefined;
}) {
  const [clusterEnvs, setClusterEnvs] = useState({} as wampApi.ClusterEnvs);
  const yourSecret = clusterEnvs.CLUSTER_SECRET || "";
  const yourMultiaddress = yourPeer
    ? yourPeer.clusterAddresses.slice(-1)[0] || ""
    : "";
  const yourPeerId = yourPeer ? yourPeer.id || "" : "";

  const [generatingSecret, setGeneratingSecret] = useState(false);
  const [loadingSecret, setLoadingSecret] = useState(false);

  useEffect(() => {
    getCurrentClusterSettings();
  }, []);

  async function getCurrentClusterSettings() {
    try {
      setLoadingSecret(true);
      await wampApi.getCurrentClusterSettings().then(setClusterEnvs);
    } catch (e) {
      console.error(`Error on getCurrentClusterSettings ${e.stack}`);
    } finally {
      setLoadingSecret(false);
    }
  }

  async function setClusterSettings(secret: string, multiaddress: string) {
    try {
      await wampApi.setClusterEnvs({
        CLUSTER_SECRET: secret,
        BOOTSTRAP_MULTIADDRESS: multiaddress
      });
    } catch (e) {
      console.error(`Error on setClusterSettings ${e.stack}`);
    }
  }

  async function generateSecret() {
    try {
      setGeneratingSecret(true);
      await wampApi.setClusterEnvs({ CLUSTER_SECRET: getRandomHex(32) });
      await getCurrentClusterSettings();
    } catch (e) {
      console.error(`Error setting cluster secret: ${e.stack}`);
    } finally {
      setGeneratingSecret(false);
    }
  }

  return (
    <>
      <JoinAnotherCluster
        yourPeerId={yourPeerId}
        setClusterSettings={setClusterSettings}
      />

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
