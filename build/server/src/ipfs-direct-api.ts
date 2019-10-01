import request from "request";

const defaultTimeout = 15 * 60 * 1000;
const apiUrl =
  process.env.IPFS_API_URL || "http://my.ipfs.dnp.dappnode.eth:5001";

console.log(`IPFS connection to ${apiUrl}`);
const baseUrl = `${apiUrl}/api/v0`;

function call(subUrl: string, timeout?: number): Promise<string> {
  if (!timeout) timeout = defaultTimeout;
  const url = `${baseUrl}${subUrl}`;
  return new Promise((resolve, reject) => {
    request(url, { timeout }, function(err, res, body) {
      if (err) reject(err);
      if (res.statusCode === 200) resolve(body);
      else reject(Error(`${body} - url: ${url}`));
    });
  });
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
    const req = request(`${baseUrl}/add`, (err, res, body) => {
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
 * Downloads IPFS hash contents
 * @param hash
 * @returns contents
 */
export const cat = (hash: string): Promise<string> => call(`/cat?arg=${hash}`);
