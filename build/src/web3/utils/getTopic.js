const { keccak256 } = require("ethjs");

function getTopic({ name, inputs }) {
  const signature = `${name}(${inputs.map(({ type }) => type).join(",")})`;
  return keccak256(signature);
}

module.exports = getTopic;
