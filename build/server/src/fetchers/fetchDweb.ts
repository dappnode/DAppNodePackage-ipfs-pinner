import resolveEnsContent from "../web3/resolveEnsContent";
import { normalizeIpfsHash } from "../utils/isIpfsHash";

export default async function fetchDweb(ensDomain: string): Promise<string> {
  const content = await resolveEnsContent(ensDomain);
  if (!content) throw Error(`ENS content not found: ${ensDomain}`);
  return normalizeIpfsHash(content);
}
