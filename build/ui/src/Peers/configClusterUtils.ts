import { apiUrl } from "../socket";
import { peersPath } from "./data";
import { JoinClusterData } from "../types";

const secretParamName = "secret";
const multiaddressParamName = "multiaddress";

export function getUrlToShare({
  secret,
  multiaddress
}: JoinClusterData): string {
  const baseUrl = new URL(apiUrl);
  baseUrl.pathname = peersPath;
  baseUrl.searchParams.set(secretParamName, secret);
  baseUrl.searchParams.set(multiaddressParamName, multiaddress);
  return baseUrl.toString();
}

export function parseUrlToShare(urlSearch: string): JoinClusterData {
  const queryParams = new URLSearchParams(urlSearch);
  const secret = queryParams.get(secretParamName) || "";
  const multiaddress = queryParams.get(multiaddressParamName) || "";
  return { secret, multiaddress };
}
