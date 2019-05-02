const Ipfs = require("ipfs-http-client");
const ipfs = Ipfs("ipfs.infura.io", "5001", { protocol: "https" });
const wrapMethodsWithQueue = require("./utils/wrapMethodsWithQueue");

function add(data) {
  const content = Ipfs.Buffer.from(data);
  return ipfs.add(content).then(res => res[0].hash);
}

function cat(hash) {
  return ipfs.cat(hash).then(file => {
    console.log(file);
    return file.toString("utf8");
  });
}

function addObj(obj) {
  return add(JSON.stringify(obj, null, 2));
}

function catObj(hash) {
  return cat(hash).then(data => {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error(
        `Error on JSON.parse (see error below). Raw data: \n${data}`
      );
      console.error(e.stack);
    }
  });
}

/**
 * Wrap methods with a concurrency and retry async queue.
 * This wrap ensures that many concurrent calls will not overload the
 * node, increasing the chances of failure.
 */

const params = {
  times: 3,
  concurrency: 10,
  intervalBase: 225
};

const methods = {
  add,
  cat,
  addObj,
  catObj
};

const wrappedMethods = wrapMethodsWithQueue(methods, params);

module.exports = wrappedMethods;
