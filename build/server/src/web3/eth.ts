import logs from "../logs";

const Eth = require("ethjs");

const host = process.env.WEB3_HOST || "fullnode.dappnode";
const protocol = process.env.WEB3_PROTOCOL || "http";

const providerUrl = `${protocol}://${host}`;
logs.info("Web3 connection", { providerUrl });

const eth = new Eth(new Eth.HttpProvider(providerUrl));

module.exports = eth;

export {};
