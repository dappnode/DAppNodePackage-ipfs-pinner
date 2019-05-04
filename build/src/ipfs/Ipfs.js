const request = require("request");
const { promisify } = require("util");
const requestAsync = promisify(request);
const prettyBytes = require("pretty-bytes");

/**
 * Initialize IPFS library
 *
 * @param {string} apiUrl
 * - "http://my.ipfs.dnp.dappnode.eth:5001"
 * - "https://ipfs.infura.io:5001"
 */
function Ipfs(apiUrl) {
  const baseUrl = `${apiUrl}/api/v0`;

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
        if (err) reject(err);
        else resolve(JSON.parse(body));
      });
      const form = req.form();
      form.append("file", request(url));
    });

  /**
   * Downloads IPFS hash contents
   * @param {string} hash
   * @returns {string} contents
   */
  const cat = hash =>
    requestAsync(`${baseUrl}/cat?arg=${hash}`).then(res => res.body);

  /**
   * Returns list of all pinned hashes
   *
   * @param {string} hash "QmNMCAWCc1EAfQ7BdVfpH9HnV1W9FiP9ztdAasdfghjksd"
   * @returns {string} hash "QmNMCAWCc1EAfQ7BdVfpH9HnV1W9FiP9ztdAasdfghjksd"
   * If the upload was successful, the returned hash is the same
   */
  const pinAdd = hash =>
    requestAsync(`${baseUrl}/pin/add?arg=${hash}`).then(res =>
      parseJson(res.body)
    );

  /**
   * Returns list of all pinned hashes
   *
   * @returns {object} pinList = {
   *   QmNMCAWCc1EAfQ7BdVfpH9HnV1W9FiP9ztdAasdfghjksd: true,
   *   QmNNcdkFZuS17hdAWNWFbsCe3QHLpVJ5cCdAasdfghjksd: true,
   */
  const pinList = () =>
    requestAsync(`${baseUrl}/pin/ls?type=recursive`)
      .then(res => parseJson(res.body))
      .then(body => body.Keys);

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
    requestAsync(`${baseUrl}/object/stat?arg=${hash}`, { timeout }).then(res =>
      parseJson(res.body)
    );

  /**
   * Returns current stats of the IPFS node
   *
   * @returns {object} stats = {
   *   size: 4223045026,
   *   maxSize: 50000000000
   * }
   */
  const repoStats = async ({ human }) =>
    requestAsync(`${baseUrl}/stats/repo?size-only=true`)
      .then(res => parseJson(res.body))
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
  const id = async () =>
    requestAsync(`${baseUrl}/id`).then(res => parseJson(res.body));

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
    objectStats,
    repoStats,
    id
  };
}

module.exports = Ipfs;
