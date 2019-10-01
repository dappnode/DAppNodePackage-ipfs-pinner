const crypto = require("crypto");

const getRandAddr = () => "0x" + crypto.randomBytes(20).toString("hex");

module.exports = getRandAddr;
