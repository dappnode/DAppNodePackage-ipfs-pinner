const web3Utils = require("web3-utils");

const getRandAddr = () => web3Utils.randomHex(20);

module.exports = getRandAddr;
