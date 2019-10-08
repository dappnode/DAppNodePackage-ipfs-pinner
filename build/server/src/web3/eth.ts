import logs from "../logs";

const Eth = require("ethjs");

const hostUrl = process.env.WEB3_HOST_URL || "http://fullnode.dappnode:8545";

const httpApiUrl = hostUrl;
logs.info("Web3 connection", { httpApiUrl });

const eth = new Eth(new Eth.HttpProvider(httpApiUrl));

module.exports = eth;

export {};
