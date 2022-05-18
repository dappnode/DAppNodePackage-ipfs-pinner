import React, { useState, useEffect } from "react";
import * as wampApi from "./wampApi";
import { ClusterEnvs, ClusterStatus, DappnodeParams } from "./wampApi";
import ShareLinkToJoinCluster from "./ShareLinkToJoinCluster";
import JoinAnotherCluster from "./JoinAnotherCluster";
import { ClusterPeer } from "../types";
import { getRandomHex, getBootstrapMultiaddress } from "./configClusterUtils";
import { RequestStatus } from "./data";

export default function ConfigCluster({ peers }: { peers: ClusterPeer[] }) {
  // State params
  const [clusterEnvs, setClusterEnvs] = useState(null as ClusterEnvs | null);
  const [hostPort, setHostPort] = useState(null as number | null);
  const [clusterStatus, setClusterStatus] = useState("" as ClusterStatus);
  const [yourIdentity, setYourIden] = useState(null as DappnodeParams | null);
  // State flags / loading
  const [generatingSecret, setGeneratingSecret] = useState(false);
  const [loadingSecret, setLoadingSecret] = useState(false);
  const [joinStatus, setJoinStatus] = useState({} as RequestStatus);
  // Derived from state
  // const yourBootstrap = (clusterEnvs || {}).BOOTSTRAP_MULTIADDRESS || "";
  const yourSecret = (clusterEnvs || {}).CLUSTER_SECRET || "";
  const yourPeer = peers.find(peer => peer.you);
  const yourPeerId = yourPeer ? yourPeer.id || "" : "";

  useEffect(() => {
    getCurrentClusterSettings();
    getDappnodeIdentity();
  }, []);

  async function getDappnodeIdentity(): Promise<void> {
    try {
      const { domain, staticIp, name } = await wampApi.getCurrentIdentity();
      setYourIden({ domain, staticIp, name });
    } catch (e) {
      console.error(`Error on getDappnodeIdentity ${e.stack}`);
    }
  }

  async function getCurrentClusterSettings(): Promise<void> {
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

  async function onJoinClusterSuccess(): Promise<void> {
    getCurrentClusterSettings();
  }

  async function setClusterSettings(
    secret: string,
    multiaddress: string
  ): Promise<void> {
    try {
      await wampApi.setClusterEnvs({
        CLUSTER_SECRET: secret,
        BOOTSTRAP_MULTIADDRESS: multiaddress
      });
    } catch (e) {
      console.error(`Error on setClusterSettings ${e.stack}`);
    }
  }

  async function generateSecret(): Promise<void> {
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

  function getMultiaddress(): string {
    if (!hostPort) throw Error("Cluster 9096 port not exposed");
    if (!yourPeerId) throw Error("Can't get your peer ID");
    if (!yourIdentity) throw Error("Can't get your DAppNode's identity");
    const { staticIp, domain } = yourIdentity;
    if (!staticIp && !domain)
      throw Error("Can't get your DAppNode's IP or domain");
    return getBootstrapMultiaddress({
      staticIp,
      domain,
      port: hostPort,
      peerId: yourPeerId
    });
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
        clusterEnvs={clusterEnvs}
        peers={peers}
        joinStatus={joinStatus}
        setJoinStatus={setJoinStatus}
        setClusterSettings={setClusterSettings}
        onSuccess={onJoinClusterSuccess}
      />

      {!joinStatus.loading && (
        <ShareLinkToJoinCluster
          yourMultiaddress={betterMultiaddress}
          errorMessage={errorMessage}
          yourSecret={yourSecret}
          generatingSecret={generatingSecret}
          loadingSecret={loadingSecret}
          clusterStatus={clusterStatus}
          generateSecret={generateSecret}
        />
      )}
    </>
  );
}
