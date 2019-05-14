const db = require("../../db");
const semver = require("semver");

function getRepoVersionAssetsToPinAndUnpin(NUM_OF_VERSIONS_TO_PIN) {
  // Slice works with string numbers ("3") and actual numbers (3)
  const numOfVersionsToPin =
    process.env.NUM_OF_VERSIONS_TO_PIN || NUM_OF_VERSIONS_TO_PIN || 3;

  // Use objects to prevent duplication
  const assetsToPin = {};
  const assetsToUnpin = {};
  const decode = obj =>
    Object.entries(obj).map(([hash, data]) => ({ hash, ...data }));
  const add = (obj, hash, data) => (obj[hash] = data);

  // repoVersions = {
  //   "admin.dnp.dappnode.eth": {
  //     "0.1.2": {
  //       name: "admin.dnp.dappnode.eth",
  //       version: "0.1.2",
  //       contentUris: {
  //         manifest: "Qmabcd..."
  //       }
  //     }
  //   }
  // };
  const repoVersions = db.getRepoVersions();

  for (const dnp of Object.values(repoVersions)) {
    Object.values(dnp)
      .sort((v1, v2) => semver.rcompare(v1.version, v2.version))
      .forEach((version, i) => {
        for (const [asset, hash] of Object.entries(version.contentUris)) {
          const data = { name: version.name, version: version.version, asset };
          // Only pin the latest n versions
          if (i < numOfVersionsToPin) add(assetsToPin, hash, data);
          else add(assetsToUnpin, hash, data);
        }
      });
  }

  // Resolve conflicts, if something has to be unpinned and pinned, stays pinned
  // This happens often with DNPs avatars
  for (const hash of Object.keys(assetsToUnpin)) {
    if (assetsToPin[hash]) delete assetsToUnpin[hash];
  }

  return {
    assetsToPin: decode(assetsToPin),
    assetsToUnpin: decode(assetsToUnpin)
  };
}

module.exports = getRepoVersionAssetsToPinAndUnpin;
