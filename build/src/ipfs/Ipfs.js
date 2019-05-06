const request = require("request");
const { promisify } = require("util");
const requestAsync = promisify(request);
const prettyBytes = require("pretty-bytes");

const defaultTimeout = 15 * 60 * 1000;

/**
 * Initialize IPFS library
 *
 * @param {string} apiUrl
 * - "http://my.ipfs.dnp.dappnode.eth:5001"
 * - "https://ipfs.infura.io:5001"
 */
function Ipfs(apiUrl) {
  console.log(`IPFS connection to ${apiUrl}`);
  const baseUrl = `${apiUrl}/api/v0`;

  function call(subUrl, timeout = defaultTimeout) {
    const url = `${baseUrl}${subUrl}`;
    return requestAsync(url, { timeout }).then(res => {
      if (res.statusCode === 200) return res.body;
      else throw Error(`${res.body} - url: ${url}`);
    });
  }

  /**
   * Streams file from url to IPFS
   * Methodology reference
   *  - `form.append` https://github.com/form-data/form-data#usage
   *
   * @param {string} url "https://raw.githubusercontent.com/danfinlay/ethereum-ens-network-map/master/index.js"
   * @returns {object} res = {
   *   Hash: "QmVqbBsi4jswchAvBK4USLhcUPKQVXN7893PxtFq85xrtH",
   *   Size: 164
   * }
   */
  const addFromUrl = url =>
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
   * @param {string} hash
   * @returns {string} contents
   */
  const cat = hash => call(`/cat?arg=${hash}`);

  /**
   * Returns list of all pinned hashes
   *
   * @param {string} hash "QmNMCAWCc1EAfQ7BdVfpH9HnV1W9FiP9ztdAasdfghjksd"
   * @returns {string} hash "QmNMCAWCc1EAfQ7BdVfpH9HnV1W9FiP9ztdAasdfghjksd"
   * If the upload was successful, the returned hash is the same
   */
  const pinAdd = hash => call(`/pin/add?arg=${hash}`).then(parseJson);

  /**
   * Returns list of all pinned hashes
   *
   * @returns {object} pinList = {
   *   QmNMCAWCc1EAfQ7BdVfpH9HnV1W9FiP9ztdAasdfghjksd: true,
   *   QmNNcdkFZuS17hdAWNWFbsCe3QHLpVJ5cCdAasdfghjksd: true,
   */
  const pinList = () =>
    call(`/pin/ls?type=recursive`)
      .then(parseJson)
      .then(body => body.Keys);

  /**
   * Remove pinned objects from local storage
   * @param {string} hash "QmNMCAWCc1EAfQ7BdVfpH9HnV1W9FiP9ztdAasdfghjksd"
   */
  const pinRemove = hash => call(`/pin/rm?arg=${hash}`).then(parseJson);

  /**
   * Returns IPFS object stats
   * Use it to check if the file is available before downloading
   *
   * @param {string} hash "QmVqbBsi4jswchAvBK4USLhcUPKQVXN7893PxtFq85xrtH"
   * @param {number} timeout HTTP request timeout in ms
   * @returns {object} stats = {
   *   Hash: "QmVqbBsi4jswchAvBK4USLhcUPKQVXN7893PxtFq85xrtH",
   *   NumLinks: 0,
   *   BlockSize: 164,
   *   LinksSize: 3,
   *   DataSize: 161,
   *   CumulativeSize: 164
   * }
   */
  const objectStats = (hash, timeout = 30 * 1000) =>
    call(`/object/stat?arg=${hash}`, timeout).then(parseJson);

  /**
   * Returns current stats of the IPFS node
   *
   * @returns {object} stats = {
   *   size: 4223045026,
   *   maxSize: 50000000000
   * }
   */
  const repoStats = ({ human }) =>
    call(`/stats/repo?size-only=true`)
      .then(parseJson)
      .then(({ RepoSize, StorageMax }) => {
        if (human)
          return {
            size: prettyBytes(RepoSize),
            maxSize: prettyBytes(StorageMax)
          };
        else return { size: RepoSize, maxSize: StorageMax };
      });

  /**
   * Returns current node ID
   *
   * @returns {object} stats = {
   *   "ID": "<string>"
   *   "PublicKey": "<string>"
   *   "Addresses": [ "<string>", ... ]
   *   "AgentVersion": "<string>"
   *   "ProtocolVersion": "<string>"
   * }
   */
  const id = () => call(`/id`).then(parseJson);

  /**
   * [PARSER]
   */
  function parseJson(s) {
    return JSON.parse(s);
  }

  return {
    addFromUrl,
    cat,
    pinAdd,
    pinList,
    pinRemove,
    objectStats,
    repoStats,
    id
  };
}

module.exports = Ipfs;
