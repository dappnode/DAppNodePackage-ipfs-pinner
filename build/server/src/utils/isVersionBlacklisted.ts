import semver from "semver";
import { ApmVersion } from "../types";

const knownReposVersionThreshold: { [name: string]: string } = {
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

export default function isVersionBlacklisted(version: ApmVersion): boolean {
  const thresholdVersion: string = knownReposVersionThreshold[version.name];
  return Boolean(
    thresholdVersion &&
      semver.valid(version.version) &&
      semver.valid(thresholdVersion) &&
      !semver.gt(version.version, thresholdVersion)
  );
}
