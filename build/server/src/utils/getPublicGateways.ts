import request from "request-promise-native";
import logs from "../logs";

const timeout = 15 * 1000;

const gatewaysListUrl =
  "https://raw.githubusercontent.com/ipfs/public-gateway-checker/master/gateways.json";
const hashToTest = "Qmaisz6NMhDB51cCvNWa1GMS7LU1pAxdF4Ld6Ft9kZEP2a";
const expectedContent = "Hello from IPFS Gateway Checker";
const gatewayListFallback = [
  "https://ipfs.io/ipfs/",
  "https://gateway.ipfs.io/ipfs/",
  "https://ipfs.infura.io/ipfs/",
  "https://rx14.co.uk/ipfs/",
  "https://ninetailed.ninja/ipfs/",
  "https://upload.global/ipfs/",
  "https://ipfs.globalupload.io/ipfs/",
  "https://ipfs.jes.xxx/ipfs/",
  "https://catalunya.network/ipfs/",
  "https://siderus.io/ipfs/",
  "https://eu.siderus.io/ipfs/",
  "https://na.siderus.io/ipfs/",
  "https://ap.siderus.io/ipfs/",
  "https://ipfs.eternum.io/ipfs/",
  "https://hardbin.com/ipfs/",
  "https://ipfs.macholibre.org/ipfs/",
  "https://ipfs.works/ipfs/",
  "https://ipfs.wa.hle.rs/ipfs/",
  "https://api.wisdom.sh/ipfs/",
  "https://gateway.blocksec.com/ipfs/",
  "https://ipfs.renehsz.com/ipfs/",
  "https://cloudflare-ipfs.com/ipfs/",
  "https://ipns.co/",
  "https://ipfs.netw0rk.io/ipfs/",
  "https://gateway.swedneck.xyz/ipfs/",
  "https://ipfs.mrh.io/ipfs/",
  "https://gateway.originprotocol.com/ipfs/",
  "https://ipfs.dapps.earth/ipfs/",
  "https://gateway.pinata.cloud/ipfs/",
  "https://ipfs.doolta.com/ipfs/",
  "https://ipfs.sloppyta.co/ipfs/",
  "https://ipfs.busy.org/ipfs/",
  "https://ipfs.greyh.at/ipfs/",
  "https://gateway.serph.network/ipfs/",
  "https://jorropo.ovh/ipfs/",
  "https://gateway.temporal.cloud/ipfs/",
  "https://ipfs.fooock.com/ipfs/",
  "https://ipfstube.erindachtler.me/ipfs/",
  "https://cdn.cwinfo.net/ipfs/"
];

/**
 * @returns {array} gateway list
 */
export default async function getPublicGateways(): Promise<string[]> {
  // gateways have the format "https://gateway.ipfs.io/ipfs/:hash",
  let gateways: string[] = gatewayListFallback;
  try {
    const gatewaysArray: string[] = await request.get(gatewaysListUrl, {
      json: true
    });
    gateways = gatewaysArray.map((url: string) => url.replace(":hash", ""));
  } catch (e) {
    logs.error("Error fetching gatewaysList", e);
  }

  const activeGateways: string[] = [];
  const errors: string[] = [];
  logs.info(`Fetched ${gateways.length} possible active gateways`);
  await Promise.all(
    gateways.map(async (gateway: string) => {
      try {
        const res = await request.get(gateway + hashToTest, { timeout });
        if (res.body.includes(expectedContent)) activeGateways.push(gateway);
      } catch (e) {
        errors.push(e.message);
      }
    })
  );
  if (!activeGateways.length)
    throw Error(`No active gateways found: ${errors.join(", ")}`);
  else return activeGateways;
}
