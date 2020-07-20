import fs from "fs";
import path from "path";
import { Supervisor } from "./utils/supervisor";
import { logs } from "./logs";
import { shellArgs } from "./utils/shell";

const dappnodeIpfsNodeMultiaddress = "/dns4/ipfs.dappnode/tcp/5001";
const localListenMultiaddress = "/ip4/0.0.0.0/tcp/9094";
const ipfsClusterPath = process.env.IPFS_CLUSTER_PATH || "/data/ipfs-cluster";
const servicePath = path.join(ipfsClusterPath, "service.json");
const identityPath = path.join(ipfsClusterPath, "identity.json");

/**
 * ipfs-cluster-service binary instance. Makes sure it is always running
 * and allows to reset it when necessary.
 */
export const clusterBinary = Supervisor("ipfs-cluster-service", ["daemon"], {
  // cluster-service MUST be shutdown with SIGTERM so it persists peers to disk
  instantKill: false,
  log: data => logs.info("[ipfs-cluster-service]", data)
});

export async function initializeCluster({ peername }: { peername: string }) {
  await shellArgs("ipfs-cluster-service init", {
    force: true,
    consensus: "crdt"
  });

  editConfig(service => {
    service.cluster.peername = peername;
    service.consensus.crdt.trusted_peers = [];
    service.ipfs_connector.ipfshttp.node_multiaddress = dappnodeIpfsNodeMultiaddress;
    service.api.restapi.http_listen_multiaddress = localListenMultiaddress;
    return service;
  });

  clusterBinary.restart();
}

/**
 * Join an external cluster and restart and list of peers
 */
export function setNewClusterSettings({
  secret,
  bootstrapPeers
}: {
  secret: string;
  bootstrapPeers: string[];
}): void {
  editConfig(service => {
    service.cluster.secret = secret;
    service.cluster.peer_addresses = bootstrapPeers;
    service.consensus.crdt.trusted_peers = bootstrapPeers;
    return service;
  });
}

/**
 * Add a cluster peer to the trusted_peers list
 * @param peerMultiaddress "/dns4/cluster1.domain/tcp/9096/ipfs/QmcQ5XvrSQ4DouNkQyQtEoLczbMr6D9bSenGy6WQUCQUBt"
 */
export function trustPeer(peerMultiaddress: string): void {
  editConfig(service => {
    service.consensus.crdt.trusted_peers = [
      ...service.consensus.crdt.trusted_peers,
      peerMultiaddress
    ];
    return service;
  });
}

/**
 * Remove a cluster peer from the trusted_peers list
 * @param peerMultiaddress "/dns4/cluster1.domain/tcp/9096/ipfs/QmcQ5XvrSQ4DouNkQyQtEoLczbMr6D9bSenGy6WQUCQUBt"
 */
export function untrustPeer(peerMultiaddress: string): void {
  editConfig(service => {
    service.consensus.crdt.trusted_peers = service.consensus.crdt.trusted_peers.filter(
      peer => peer !== peerMultiaddress
    );
    return service;
  });
}

/**
 * Utility function to read the local service.json file
 */
export function readConfig(): IpfsClusterServiceJson {
  return JSON.parse(fs.readFileSync(servicePath, "utf8"));
}

/**
 * Utility function to read the local identity.json file
 */
export function readIdentity(): IpfsClusterIdentityJson {
  return JSON.parse(fs.readFileSync(identityPath, "utf8"));
}

/**
 * Utility function to edit the local service.json file
 * @param editFn
 */
function editConfig(
  editFn: (service: IpfsClusterServiceJson) => IpfsClusterServiceJson
) {
  const service = readConfig();
  const newService = editFn(service);
  fs.writeFileSync(servicePath, JSON.stringify(newService, null, 2));
}

/**
 * Sample service.json with default init values
 * ipfs-cluster-service version 0.13.0-next+gitd2a83e45f1ad5f84a3eae70b46fb9b521b90ab03
 */
interface IpfsClusterServiceJson {
  cluster: {
    peername: string; // "c48fcbf32979",
    secret: string; // "0bd8844ad55ce1acad40c0b0914f1dfbb891c8c4ccc4e287be325a9303cc54ad",
    leave_on_shutdown: boolean; // false,
    listen_multiaddress: string[]; // ["/ip4/0.0.0.0/tcp/9096", "/ip4/0.0.0.0/udp/9096/quic"];
    enable_relay_hop: boolean; // true,
    connection_manager: {
      high_water: number; // 400,
      low_water: number; // 100,
      grace_period: string; // "2m0s"
    };
    state_sync_interval: string; // "5m0s",
    pin_recover_interval: string; // "12m0s",
    replication_factor_min: number; // -1,
    replication_factor_max: number; // -1,
    monitor_ping_interval: string; // "15s",
    peer_watch_interval: string; // "5s",
    mdns_interval: string; // "10s",
    disable_repinning: boolean; // false,
    peer_addresses: string[]; // ["/dns4/cluster1.domain/tcp/9096/ipfs/QmcQ5XvrSQ4DouNkQyQtEoLczbMr6D9bSenGy6WQUCQUBt"];
  };
  consensus: {
    crdt: {
      cluster_name: string; // "ipfs-cluster",
      trusted_peers: string[]; // ["*"]; or ["/dns4/cluster1.domain/tcp/9096/ipfs/QmcQ5XvrSQ4DouNkQyQtEoLczbMr6D9bSenGy6WQUCQUBt"]
    };
  };
  api: {
    ipfsproxy: {
      listen_multiaddress: string; // "/ip4/127.0.0.1/tcp/9095",
      node_multiaddress: string; // "/ip4/127.0.0.1/tcp/5001",
      log_file: string; // "",
      read_timeout: string; // "0s",
      read_header_timeout: string; // "5s",
      write_timeout: string; // "0s",
      idle_timeout: string; // "1m0s",
      max_header_bytes: number; // 4096
    };
    restapi: {
      http_listen_multiaddress: string; // "/ip4/127.0.0.1/tcp/9094",
      read_timeout: string; // "0s",
      read_header_timeout: string; // "5s",
      write_timeout: string; // "0s",
      idle_timeout: string; // "2m0s",
      max_header_bytes: number; // 4096,
      basic_auth_credentials: null;
      http_log_file: string; // "",
      headers: { [header: string]: string }; // {};
      cors_allowed_origins: string[]; // ["*"];
      cors_allowed_methods: string[]; // ["GET"];
      cors_allowed_headers: string[]; // [];
      cors_exposed_headers: string[]; // ["Content-Type", "X-Stream-Output", "X-Chunked-Output", "X-Content-Length"]
      cors_allow_credentials: boolean; // true,
      cors_max_age: string; // "0s"
    };
  };
  ipfs_connector: {
    ipfshttp: {
      node_multiaddress: string; // "/ip4/127.0.0.1/tcp/5001",
      connect_swarms_delay: string; // "30s",
      ipfs_request_timeout: string; // "5m0s",
      pin_timeout: string; // "2m0s",
      unpin_timeout: string; // "3h0m0s",
      repogc_timeout: string; // "24h0m0s"
    };
  };
  pin_tracker: {
    stateless: {
      concurrent_pins: number; // 10
    };
  };
  monitor: {
    pubsubmon: {
      check_interval: string; // "15s",
      failure_threshold: number; // 3;
    };
  };
  informer: {
    disk: {
      metric_ttl: string; // "30s",
      metric_type: string; // "freespace"
    };
  };
  observations: {
    metrics: {
      enable_stats: boolean; // false,
      prometheus_endpoint: string; // "/ip4/127.0.0.1/tcp/8888",
      reporting_interval: string; // "2s"
    };
    tracing: {
      enable_tracing: boolean; // false,
      jaeger_agent_endpoint: string; // "/ip4/0.0.0.0/udp/6831",
      sampling_prob: number; // 0.3;
      service_name: string; // "cluster-daemon"
    };
  };
  datastore: {
    badger: {
      badger_options: {
        dir: string; // "",
        value_dir: string; // "",
        sync_writes: boolean; // true,
        table_loading_mode: number; // 2,
        value_log_loading_mode: number; // 0,
        num_versions_to_keep: number; // 1,
        max_table_size: number; // 16777216,
        level_size_multiplier: number; // 10,
        max_levels: number; // 7,
        value_threshold: number; // 32,
        num_memtables: number; // 5,
        num_level_zero_tables: number; // 5,
        num_level_zero_tables_stall: number; // 10,
        level_one_size: number; // 268435456,
        value_log_file_size: number; // 1073741823,
        value_log_max_entries: number; // 1000000,
        num_compactors: number; // 2,
        compact_l_0_on_close: boolean; // false,
        read_only: boolean; // false,
        truncate: boolean; // true
      };
    };
  };
}

/**
 * Sample identity.json with default init values
 * ipfs-cluster-service version 0.13.0-next+gitd2a83e45f1ad5f84a3eae70b46fb9b521b90ab03
 */
interface IpfsClusterIdentityJson {
  id: string; // "12D3KooWHkd7hP5nYLNFM6VAgLwkg4jCdy8U8eHpfbmL4P4LNS1X",
  private_key: string; // "CAESQGHwJpbblgswW/Is6f5aZqOL/IyJuD1gp4epAMcGPzdwdegSxRLK/6lBnfVnFRcw1lTRSgS2qdUexrrtpr/x4vo="
}
