import * as ipfs from "./ipfs";
import * as pinDb from "./pinDb";

/**
 * Hashes from the pinset are in the raw form:
 * "QmZgYr9iVt5U2dFWiVD5kiZmTN3Rti44zm6cVPqZEHRM1M"
 */
function trimHash(hash: string): string {
  return hash.split("ipfs/")[1] || hash;
}

export default async function reconcilePinSet(): Promise<void> {
  console.log("> Loading pinset...");
  const currentPinset = await ipfs.pinLs();
  console.log("> Got pinset");
  const files = pinDb.getFiles();
  for (const file of files) {
    const id = [file.source.name, file.source.version, file.source.fileId].join(
      " "
    );
    if (currentPinset[trimHash(file.hash)]) {
      console.log(`File already pinned! ${id}`);
    } else {
      console.log(`Should pin file ${id}`);
    }
  }
}
