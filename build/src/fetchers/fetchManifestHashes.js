const ipfs = require("../ipfs");
const isIpfsHash = require("../utils/isIpfsHash");

/**
 * Fetches the image hash and the avatar hash of a manifest
 *
 * @param {string} hash "/ipfs/Qm..."
 * @returns {object} validHashes = {
 *   manifestHash: "/ipfs/Qm...",
 *   imageHash: "/ipfs/Qm..."
 *   avatarHash: "/ipfs/Qm..." (optional)
 * }
 */
async function fetchManifestHashes(hash) {
  const manifest = await ipfs.catObj(hash);
  const imageHash = manifest.image.hash;
  const avatarHash = manifest.avatar;

  if (!isIpfsHash(imageHash))
    throw Error(
      `Manifest hash ${hash} points to an invalid image hash ${imageHash}`
    );

  return {
    manifest: hash,
    image: imageHash,
    // Only add avatarHash if it's valid
    ...(isIpfsHash(avatarHash) ? { avatar: avatarHash } : {})
  };
}

module.exports = fetchManifestHashes;
