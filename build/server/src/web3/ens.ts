const ENS = require("ethjs-ens");
const eth = require("./eth");

const ens = new ENS({ provider: eth.currentProvider, network: "1" });
export default ens;
