const Web3 = require("web3");

const providerUrl =
  process.env.WEB3HOST ||
  "https://mainnet.infura.io/v3/bb15bacfcdbe45819caede241dcf8b0d";
const web3 = new Web3(providerUrl);
console.log("Web3 connection to: " + providerUrl);

module.exports = web3;
