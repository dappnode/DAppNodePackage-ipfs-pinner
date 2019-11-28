const gatewayUrl = "http://ipfs.dappnode:8080/ipfs";
const webuiUrl = "http://ipfs.dappnode.io:5001/webui#/explore";

export const getGatewayLink = (hash: string): string => `${gatewayUrl}/${hash}`;
export const getWebuiLink = (hash: string): string => `${webuiUrl}/${hash}`;
