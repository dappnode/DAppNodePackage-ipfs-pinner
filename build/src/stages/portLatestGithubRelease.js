const db = require("../db");
const ipfs = require("../ipfs")();
const request = require("request");
const { promisify } = require("util");
const requestAsync = promisify(request);
require("../utils/arrayPrototype");
const semver = require("semver");
const knownGithubRepos = require("../utils/knownGithubRepos");

const oAuthToken = process.env.GITHUB_OAUTH_TOKEN;

/**
 * - Fetch the latest release from Github
 * - Check if it matches the current latest from APM
 * - Check if it matches the current latest from Github
 * - If it matches any, clean or remove,
 * - Else, pin it and cache the result
 */
async function portLatestGithubRelease() {
  await Object.entries(knownGithubRepos).mapAsyncParallel(
    async ([name, slug]) => {
      const id = [name, slug].join(" ");

      try {
        // Returns a semver: "0.2.1"
        const currentLatestVersionApm = db.getRepoLatestVersion(name);

        // Returns: { latestVersion: "0.2.2", pinnedAssets: [{...}, ...] }
        const latestGithubCache = db.latestGithubVersionCache.get(slug) || {};
        const latestVersionCache = latestGithubCache.latestVersion;

        /**
         * If the latest version of APM becomes greater than the pinned
         * with the stage, remove it as the APM version has priority
         */
        if (
          currentLatestVersionApm &&
          latestVersionCache &&
          !semver.lt(currentLatestVersionApm, latestVersionCache)
        )
          await removePreviousPinnedVersion(latestGithubCache, slug);

        /**
         * Construct github API releases, example:
         * "https://api.github.com/repos/dappnode/DNP_ADMIN/releases"
         * - /latest endpoint will not pickup pre-releases
         */
        const url = `https://api.github.com/repos/${slug}/releases`;
        const headers = { "user-agent": "node.js" };
        if (oAuthToken) headers.Authorization = `token ${oAuthToken}`;
        const res = await requestAsync(url, { headers });

        // res.body = [
        //   {
        //     tag_name: "v0.2.0",
        //     draft: false,
        //     prerelease: true,
        //     created_at: "2019-04-30T13:57:58Z",
        //     published_at: "2019-04-30T14:17:02Z",
        //     assets: [
        //       {
        //         name: "admin.dnp.dappnode.eth_0.2.0.tar.xz",
        //         size: 7801660,
        //         browser_download_url:
        //           "https://github.com/dappnode/DNP_ADMIN/releases/download/v0.2.0/admin.dnp.dappnode.eth_0.2.0.tar.xz"
        //       }
        //     ]
        //   }
        // ];
        if (!res) throw Error(`Error fetching latest version`);
        const latestRelease = JSON.parse(res.body)[0] || {};
        const latestVersion = (latestRelease.tag_name || "").replace("v", "");

        // If the latest Github version increases, remove the previous pinned version
        if (
          latestVersion &&
          latestVersionCache &&
          semver.lt(latestVersionCache, latestVersion)
        )
          await removePreviousPinnedVersion(latestGithubCache, slug);

        // If the version is the same, skip this block
        if (latestVersion && latestVersionCache === latestVersion) return;

        if (
          currentLatestVersionApm &&
          latestVersion &&
          semver.gt(latestVersion, currentLatestVersionApm)
        ) {
          console.log(`Found version ${latestVersion} ${slug}`);
          const assetsToPin = latestRelease.assets.filter(
            asset =>
              (asset.name.includes(name) && asset.name.endsWith(".tar.xz")) ||
              asset.name.includes("dappnode_package.json")
          );

          const pinnedAssets = [];
          await assetsToPin.mapAsyncParallel(async asset => {
            const url = (asset || {}).browser_download_url;
            if (!url) return;
            const { Name, Hash } = await ipfs.addFromUrl(url);
            const hash = `/ipfs/${Hash}`;
            const hashData = {
              hash: `/ipfs/${Hash}`,
              name,
              version: latestVersion,
              asset: Name.includes("dappnode_package.json")
                ? "manifest"
                : "image",
              githubReleaseOnly: true,
              slug
            };
            db.updatePinStatus.data(hash, hashData);
            db.updatePinStatus.justPinned(hash);
            pinnedAssets.push(hashData);
          });
          db.latestGithubVersionCache.set(slug, {
            latestVersion,
            pinnedAssets
          });
          console.log(`Ported version ${latestVersion} of ${slug} from Github`);
        }
      } catch (e) {
        console.error(`Error adding asset from github ${id}: ${e.stack}`);
      }
    }
  );
}

async function removePreviousPinnedVersion(latestGithubCache = {}, slug) {
  const { latestVersion, pinnedAssets } = latestGithubCache;
  // Clean local latest version from github
  console.log(`Removing Github version ${latestVersion} ${slug}`);
  for (const pinnedAsset of pinnedAssets || []) {
    db.removePinnedHash(pinnedAsset.hash);
    await ipfs.pinRemove(pinnedAsset.hash);
  }
  console.log(`Removed Github version ${latestVersion} ${slug}`);
}

module.exports = portLatestGithubRelease;
