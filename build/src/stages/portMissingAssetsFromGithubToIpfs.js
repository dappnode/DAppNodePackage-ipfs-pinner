const db = require("../db");
const ipfs = require("../ipfs");

/**
 * - Collects all fetched repo's asstes for each version
 * - Collects pinned hashes and checks which assets are not pinned
 * - Checks if those assets are available in a github release
 * - If so, it add the file to IPFS with a stream
 * - If Github replies with 404, it will NOT try to fetch the fail again
 */
async function portMissingAssetsFromGithubToIpfs() {
  const assets = db.getReposUnpinnedAssets();

  console.log(
    `Collected ${assets.length} unavailable assets that maybe on Github`
  );

  for (const { name, version, asset, hash } of assets) {
    const id = [name, version, asset.replace("Hash", ""), hash].join(" ");
    console.log(`Uploading ${id} from Github...`);

    try {
      const shortName = name.split(".")[0];
      const repoSlug = `dappnode/DNP_${shortName.toUpperCase()}`;
      const tag = `v${version}`;
      const fileName = getFileName({ name, version, asset });
      /**
       * Construct github release asset url, example:
       * "https://github.com/dappnode/DNP_ADMIN/releases/download/v0.2.0/admin.dnp.dappnode.eth_0.2.0.tar.xz"
       */
      const url = `https://github.com/${repoSlug}/releases/download/${tag}/${fileName}`;

      let uploadedHash;
      try {
        // returns hash without prefix, uploadedHash = "Qm..."
        uploadedHash = await ipfs.addFromUrl(url);
        console.log({ uploadedHash });
      } catch (e) {
        // If file is not found on github flag it as so
        if (e.message.includes("404")) {
          db.updatePinStatus.notInGithub(hash);
          console.log(`Error 404 asset not found on Github ${url}`);
          continue;
        }
        // Append actual url to error data
        e.message = e.message + ` - url: ${url}`;
        throw e;
      }

      if (!hash.includes(uploadedHash))
        throw Error(`Incorrect resulting hash: ${uploadedHash}`);

      console.log(`Uploaded ${name} ${version} ${asset} from Github`);
      db.updatePinStatus.justPinned(hash);
    } catch (e) {
      console.error(`Error adding asset from github ${id}: ${e.stack}`);
    }
  }
}

// Utils

function getFileName({ name, version, asset }) {
  const shortName = name.split(".")[0];
  switch (asset) {
    case "manifestHash":
      return "dappnode_package.json";
    case "imageHash":
      return `${shortName}.dnp.dappnode.eth_${version}.tar.xz`;
    case "avatarHash":
      throw Error("Does not support avatarHash yet");
  }
}

module.exports = portMissingAssetsFromGithubToIpfs;
