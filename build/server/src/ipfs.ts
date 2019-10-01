import { PinList, PinType } from "./types";

const ipfsClient = require("ipfs-http-client");

const host = process.env.IPFS_HOST || "my.ipfs.dnp.dappnode.eth";
const protocol = process.env.IPFS_PROTOCOL || "http";
const port = process.env.IPFS_PORT || "5001";

const ipfs = ipfsClient({ host, port, protocol });

export function cat(ipfsPath: string): Promise<string> {
  return ipfs.cat(ipfsPath).then((file: Buffer) => file.toString("utf8"));
}
