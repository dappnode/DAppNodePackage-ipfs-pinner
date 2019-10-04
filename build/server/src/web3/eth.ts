const Eth = require("ethjs");

const providerUrl =
  process.env.WEB3_HOST ||
  "https://mainnet.infura.io/v3/bb15bacfcdbe45819caede241dcf8b0d";

console.log("Web3 connection to: " + providerUrl);

const eth = new Eth(new Eth.HttpProvider(providerUrl));

module.exports = eth;

export {};
