import got from "got";
import { dappmanagerGlobalEnvsUrl } from "../params";

/**
 * Get the host machine name
 * curl http://172.33.1.7/global-envs/server_name
 */
export async function getServerName(): Promise<string> {
  const serverName = await got
    .get(`${dappmanagerGlobalEnvsUrl}/server_name`)
    .text();
  return serverName.trim();
}

/**
 * Get the DAppNode hostname (domain or IP)
 * curl http://172.33.1.7/global-envs/hostname
 */
export async function getHostname(): Promise<string> {
  const hostname = await got.get(`${dappmanagerGlobalEnvsUrl}/hostname`).text();
  return hostname.trim();
}
