const ipfsClient = require("ipfs-http-client");

const host = process.env.IPFS_HOST || "my.ipfs.dnp.dappnode.eth";
const protocol = process.env.IPFS_PROTOCOL || "http";
const port = process.env.IPFS_PORT || "5001";

const ipfs = ipfsClient({ host, port, protocol });

interface IpfsLsFile {
  depth: number; // 1;
  name: string; // "alice.txt";
  path: string; // "QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/alice.txt";
  size: number; // 11696;
  hash: string; // "QmZyUEQVuRK3XV7L9Dk26pg6RVSgaYkiSTEdnT2kZZdwoi";
  type: string; // "file";
}

export function ls(ipfsPath: string): Promise<IpfsLsFile[]> {
  return ipfs.ls(ipfsPath);
}

export function cat(ipfsPath: string): Promise<string> {
  return ipfs.cat(ipfsPath).then((file: Buffer) => file.toString("utf8"));
}

type PinType = "direct" | "indirect" | "recursive";
type RawPinLsReturn = {
  type: PinType;
  hash: string;
}[];
type PinLsReturn = { [hash: string]: PinType };
export function pinLs(): Promise<PinLsReturn> {
  return ipfs.pin.ls({ options: "recursive" }).then((pinset: RawPinLsReturn) =>
    pinset.reduce((pinObj: PinLsReturn, { type, hash }) => {
      return { ...pinObj, [hash]: type };
    }, {})
  );
}
