import logs from "../logs";

const Eth = require("ethjs");

const host = process.env.WEB3_HOST || "fullnode.dappnode";
const port =
  process.env.WEB3_PORT === "none" ? "" : process.env.WEB3_PORT || "8545";
const protocol = process.env.WEB3_PROTOCOL || "http";

const httpApiUrl = port
  ? `${protocol}://${host}:${port}`
  : `${protocol}://${host}`;
logs.info("Web3 connection", { httpApiUrl });

const eth = new Eth(new Eth.HttpProvider(httpApiUrl));

module.exports = eth;

export {};
