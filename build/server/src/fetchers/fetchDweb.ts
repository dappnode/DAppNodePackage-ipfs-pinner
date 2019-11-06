import resolveEnsContent from "../web3/resolveEnsContent";

export default async function fetchDweb(ensDomain: string) {
  const content = await resolveEnsContent(ensDomain);
  if (!content) throw Error(`ENS content not found: ${ensDomain}`);
  return content;
}
