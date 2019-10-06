import request from "request-promise-native";

const host = process.env.IPFS_API_HOST || "localhost";
const port = process.env.IPFS_API_PORT || "5001";
const protocol = process.env.IPFS_API_PROTOCOL || "http";

const httpApiUrl = `${protocol}://${host}:${port}/api/v0`;

console.log(`IPFS connection to ${httpApiUrl}`);

export const directoryErrorMessage = "dag node is a directory";

interface IpfsApiError {
  Message: string; // 'this dag node is a directory',
  Code: number; // 0,
  Type: string; // 'error'
}

/**
 * Prettifies request errors giving as much info as possible
 * @param e
 */
function handleErrors(e: any) {
  let message: string = e.message;
  let req: string = "";

  if (typeof e.error === "object" && e.error.Message) {
    const error: IpfsApiError = e.error;
    message = `${error.Message} - ${error.Code} ${error.Type}`;
  }

  // Prettify original request
  const { path, method } = ((e || {}).response || {}).req || {};
  if (path && method) req = `${method || ""} ${path || "unknown"}`;

  if (e.message.includes("ECONNREFUSED"))
    throw Error(`Can't connect to IPFS API at ${httpApiUrl}`);

  e.message = message + (req ? ` (req: ${req})` : "");
  throw e;
}

/**
 * Streams file from url to IPFS
 * Methodology reference
 *  - `form.append` https://github.com/form-data/form-data#usage
 *
 * @param url "https://raw.githubusercontent.com/danfinlay/ethereum-ens-network-map/master/index.js"
 * @returns res = {
 *   Hash: "QmVqbBsi4jswchAvBK4USLhcUPKQVXN7893PxtFq85xrtH",
 *   Size: 164
 * }
 */
export const addFromUrl = (
  url: string
): Promise<{ Hash: string; Size: number }> =>
  new Promise((resolve, reject) => {
    const req = request(`${httpApiUrl}/add`, (err, res, body) => {
      /**
       * - If the url does not resolve, request will return this object
       *   { Message: 'multipart: NextPart: EOF', Code: 0, Type: 'error' }
       * - If the IPFS API is not available, the promise will reject
       */
      if (err) reject(err);
      else {
        const bodyJson = JSON.parse(body);
        if (bodyJson.Hash) resolve(bodyJson.Hash);
        else if (bodyJson.Type === "error")
          if ((bodyJson.Message || "").includes("EOF")) reject(Error("404"));
          else reject(Error(bodyJson.Message));
        else reject(Error(`Unknown body format: ${body}`));
      }
    });
    const form = req.form();
    form.append("file", request(url));
  });

/**
 * Gets the list of pins in the cluster.
 * Pins may not be actually pinned in the IPFS nodes, see `pinsStatus`
 *
 * GET	/allocations	List of pins and their allocations (pinset)
 */
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
export async function catJson(hash: string): Promise<any> {
  return await request
    .get(`${httpApiUrl}/cat`, {
      qs: {
        arg: hash
      },
      json: true
    })
    .catch(handleErrors);
}
