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
  const [hostPort, setHostPort] = useState(null as number | null);
  const [clusterStatus, setClusterStatus] = useState(
    "" as wampApi.ClusterStatus
  );
  const [dappnodeIdentity, setDappnodeIdentity] = useState(
    null as wampApi.DappnodeParams | null
  );
  const yourSecret = clusterEnvs.CLUSTER_SECRET || "";
  const yourMultiaddress = yourPeer
    ? yourPeer.clusterAddresses.slice(-1)[0] || ""
    : "";
  const yourPeerId = yourPeer ? yourPeer.id || "" : "";

  const [generatingSecret, setGeneratingSecret] = useState(false);
  const [loadingSecret, setLoadingSecret] = useState(false);

  useEffect(() => {
    getCurrentClusterSettings();
    getDappnodeIdentity();
  }, []);

  async function getDappnodeIdentity() {
    try {
      const { domain, staticIp, name } = await wampApi.getCurrentIdentity();
      setDappnodeIdentity({ domain, staticIp, name });
    } catch (e) {
      console.error(`Error on getDappnodeIdentity ${e.stack}`);
    }
  }

  async function getCurrentClusterSettings() {
    try {
      setLoadingSecret(true);

      const ipfsClusterDnp = await wampApi.getCurrentClusterSettings();
      if (!ipfsClusterDnp) {
        setClusterStatus("not-found");
        throw Error("IPFS cluster DNP not found");
      }
      const { envs, ports, running } = ipfsClusterDnp;
      // Get status for feedback
      if (running) setClusterStatus("running");
      else setClusterStatus("stopped");
      // Set envs
      setClusterEnvs(envs);
      // Find exposed port
      const container9096Port = (ports || []).find(
        port => port.container === 9096 && port.protocol === "TCP"
      );
      if (container9096Port && container9096Port.host)
        setHostPort(container9096Port.host);
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

  function getMultiaddress() {
    if (!hostPort) throw Error("Cluster 9096 port not exposed");
    if (!yourPeerId) throw Error("Can't get your peer ID");
    if (dappnodeIdentity) {
      const { staticIp, domain } = dappnodeIdentity;
      if (staticIp) return `/ip4/${staticIp}/tcp/${hostPort}/p2p/${yourPeerId}`;
      if (domain) return `/dns4/${domain}/tcp/${hostPort}/p2p/${yourPeerId}`;
    }
    if (yourMultiaddress && !yourMultiaddress.startsWith("/ip4/172.33."))
      return yourMultiaddress;
    throw Error("Can't figure out your cluster multiaddress");
  }

  let betterMultiaddress: string = "";
  let errorMessage: string = "";
  try {
    betterMultiaddress = getMultiaddress();
  } catch (e) {
    errorMessage = e.message;
  }

  return (
    <>
      <JoinAnotherCluster
        yourPeerId={yourPeerId}
        setClusterSettings={setClusterSettings}
      />

      <ShareLinkToJoinCluster
        yourMultiaddress={betterMultiaddress}
        errorMessage={errorMessage}
        yourSecret={yourSecret}
        generatingSecret={generatingSecret}
        loadingSecret={loadingSecret}
        clusterStatus={clusterStatus}
        generateSecret={generateSecret}
      />
    </>
  );
}
