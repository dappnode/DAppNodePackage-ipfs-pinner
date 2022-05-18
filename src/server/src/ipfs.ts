import logs from "./logs";
const Ipfs = require("ipfs-http-client");

const ipfsApiUrl = process.env.IPFS_API_URL || "http://localhost:5001";

const ipfsCatTimeout = 5 * 1000;
const ipfsAddTimeout = 10 * 1000;

logs.info("IPFS HTTP API", { ipfsApiUrl });
const ipfs = Ipfs(ipfsApiUrl);

export const directoryErrorMessage = "dag node is a directory";
export const timeoutErrorMessage = "Timeout - hash not available";

interface IpfsApiError {
  Message: string; // 'this dag node is a directory',
  Code: number; // 0,
  Type: string; // 'error'
}
interface ErrorArg extends Error {
  error?: IpfsApiError;
  response?: {
    req?: {
      path: string;
      method: string;
    };
  };
}

/**
 * Prettifies request errors giving as much info as possible
 * @param e
 */
function handleErrors(e: ErrorArg): void {
  let message: string = e.message;
  let req = "";

  if (typeof e.error === "object" && e.error.Message) {
    const error: IpfsApiError = e.error;
    message = `${error.Message} - ${error.Code} ${error.Type}`;
  }

  // Prettify original request
  const { path, method } = ((e || {}).response || {}).req || {};
  if (path && method) req = `${method || ""} ${path || "unknown"}`;

  if (e.message.includes("ECONNREFUSED"))
    throw Error(`Can't connect to IPFS API at ${ipfsApiUrl}`);

  if (e.message.includes("ESOCKETTIMEDOUT") || e.message.includes("ETIMEDOUT"))
    throw Error(timeoutErrorMessage);

  e.message = message + (req ? ` (req: ${req})` : "");
  throw e;
}

/**
 * Add raw string to IPFS as file
 *
 * @param data "amazing raw content"
 * @returns raw CID "QmVqbBsi4jswchAvBK4USLhcUPKQVXN7893PxtFq85xrtH"
 */
export async function add(data: string): Promise<string> {
  const content = Ipfs.Buffer.from(data);

  const files = [];
  for await (const file of ipfs.add(content, { timeout: ipfsAddTimeout })) {
    files.push(file);
  }
  return files[0].cid.toString();
}

/**
 * Downloads IPFS hash contents
 * @param hash
 * @returns contents
 * GET /cat Show IPFS object data.
 * args:
 * - arg [string]: The path to the IPFS object(s) to be outputted. Required: yes.
 * - offset [int64]: Byte offset to begin reading from. Required: no.
 * - length [int64]: Maximum number of bytes to read. Required: no.
 */
export async function catJson<R>(hash: string): Promise<R> {
  try {
    const chunks = [];
    for await (const chunk of ipfs.cat(hash, {
      timeout: ipfsCatTimeout
    })) {
      chunks.push(chunk);
    }
    const data = Buffer.concat(chunks);
    return JSON.parse(data.toString());
  } catch (e) {
    handleErrors(e);
    throw e;
  }
}
