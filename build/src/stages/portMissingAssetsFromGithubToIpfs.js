const db = require("../db");
const ipfs = require("../ipfs")();
const knownGithubRepos = require("../utils/knownGithubRepos");

/**
 * - Collects all fetched repo's assets for each version
 * - Collects pinned hashes and checks which assets are not pinned
 * - Checks if those assets are available in a github release
 * - If so, it add the file to IPFS with a stream
 * - If Github replies with 404, it will NOT try to fetch the fail again
 */
async function portMissingAssetsFromGithubToIpfs() {
  const assets = db
    .getReposUnpinnedAssets()
    // Only try to port releases from known repos
    .map(repo => ({ ...repo, slug: knownGithubRepos[repo.name] }))
    .filter(({ slug }) => slug);

  console.log(
    `Collected ${assets.length} unavailable assets that maybe on Github`
  );

  await assets.mapAsyncParallel(
    async ({ name, version, asset, hash, slug }) => {
      const id = [name, version, asset.replace("Hash", ""), hash].join(" ");
      try {
        console.log(`Uploading ${id} from Github...`);
        const tag = `v${version}`;
        const fileName = getFileName({ name, version, asset });
        /**
         * Construct github release asset url, example:
         * "https://github.com/dappnode/DNP_ADMIN/releases/download/v0.2.0/admin.dnp.dappnode.eth_0.2.0.tar.xz"
         */
        const url = `https://github.com/${slug}/releases/download/${tag}/${fileName}`;

        let uploadedHash;
        try {
          /**
           * returns hash without prefix, uploadedHash = "Qm..."
           *
           * - If the url does not resolve, request throw "404"
           * - If the IPFS API is not available, request will throw
           */
          uploadedHash = await ipfs.addFromUrl(url);
        } catch (e) {
          if ((e.message || "").includes("404")) {
            db.updatePinStatus.notInGithub(hash);
            return console.log(`Error 404 asset not found on Github ${url}`);
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
  );
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
