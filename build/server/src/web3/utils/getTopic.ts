const { keccak256 } = require("ethjs");

interface EventAbi {
  name: string;
  inputs: {
    indexed: boolean;
    name: string;
    type: string;
  }[];
}

export default function getTopic({ name, inputs }: EventAbi) {
  const signature = `${name}(${inputs.map(({ type }) => type).join(",")})`;
  return keccak256(signature);
}
