const getRepoVersionAssetsToPinAndUnpin = require("./getRepoVersionAssetsToPinAndUnpin");
const db = require("../../db");

function getRepoVersionAssetsMissing(NUM_OF_VERSIONS_TO_PIN) {
  const { assetsToPin } = getRepoVersionAssetsToPinAndUnpin(
    NUM_OF_VERSIONS_TO_PIN
  );

  // Now check if some asset is not pinned
  // Filter by assets that have never been pinned
  return assetsToPin.filter(({ hash }) => {
    const { lastPinned } = db.getIpfsHash(hash) || {};
    return !lastPinned;
  });
}

module.exports = getRepoVersionAssetsMissing;
