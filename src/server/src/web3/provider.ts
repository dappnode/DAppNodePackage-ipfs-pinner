import { ethers } from "ethers";
import logs from "../logs";

const hostUrl = process.env.WEB3_HOST_URL || "http://fullnode.dappnode:8545";
logs.info(`Web3 connected (ethers ${ethers.version}): ${hostUrl}`);

const provider = new ethers.providers.JsonRpcProvider(hostUrl);

export default provider;
