export const maxApmVersionsToPin = 3;

export const dappmanagerApiUrl = `http://172.33.1.7`;
export const dappmanagerGlobalEnvsUrl = `${dappmanagerApiUrl}/global-envs`;
export const CLUSTER_PORT = 9096;

/**
 * Specify the LAST BROKEN version of a specific repo
 * This app will ignore all versions EQUAL or LESS than the specified semver
 *
 * [WARNING] be very careful when changing this numbers. The App may ingore all versions
 */
export const knownLastBrokenVersions: { [dnpName: string]: string } = {
  // Wrongly deployed manifests
  "bind.dnp.dappnode.eth": "0.1.3",
  "livepeer.dnp.dappnode.eth": "0.0.1",
  // Versions no longer mantained. Not in IPFS nor in Github
  "core.dnp.dappnode.eth": "0.1.10",
  "dappmanager.dnp.dappnode.eth": "0.1.11",
  "ethchain.dnp.dappnode.eth": "0.1.1",
  "rinkeby.dnp.dappnode.eth": "0.0.3",
  "letsencrypt-nginx.dnp.dappnode.eth": "0.0.3",
  "otpweb.dnp.dappnode.eth": "0.0.2",
  "kovan.dnp.dappnode.eth": "0.0.1",
  "nginx-proxy.dnp.dappnode.eth": "0.0.2",
  "ropsten.dnp.dappnode.eth": "0.1.0"
};
