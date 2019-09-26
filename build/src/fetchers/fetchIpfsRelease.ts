import * as ipfs from "../ipfs";
import { DistributedFile, ManifestWithImage, ApmVersion } from "../types";
import isIpfsHash from "../utils/isIpfsHash";

/**
 * Should resolve a name/version into the manifest and all relevant hashes
 * Should return enough information to then query other files if necessary
 * or inspect the package metadata
 * - The download of image and avatar should be handled externally with other "pure"
 *   functions, without this method becoming a factory
 * - The download methods should be communicated of enought information to
 *   know where to fetch the content, hence the @DistributedFileSource
 */
export default async function fetchIpfsRelease({
  name,
  version,
  contentUri
}: ApmVersion): Promise<DistributedFile[]> {
  const hash = contentUri;
  if (!isIpfsHash(hash)) throw Error(`Release must be an IPFS hash ${hash}`);

  try {
    const manifestString: string = await ipfs.cat(hash);
    const manifest: ManifestWithImage = JSON.parse(manifestString);
    if (!manifest.image) throw Error(`Manifest has no image field`);

    const commonSource = { from: "apm" as "apm", name, version };

    const files = [
      {
        dir: false,
        hash,
        size: 0,
        source: { ...commonSource, fileId: "manifest" }
      },
      {
        dir: false,
        hash: manifest.image.hash,
        size: manifest.image.size,
        source: { ...commonSource, fileId: "image" }
      }
    ];
    // Only add avatar file if exists
    if (manifest.avatar)
      files.push({
        dir: false,
        hash: manifest.avatar,
        size: 0,
        source: { ...commonSource, fileId: "avatar" }
      });

    return files;
  } catch (e) {
    if (e.message.includes("is a directory")) {
      const files = await ipfs.ls(hash);
      const manifestEntry = files.find(file => file.name.endsWith(".json"));
      const imageEntry = files.find(file => file.name.endsWith(".tar.xz"));
      if (!manifestEntry) throw Error("Release must contain a manifest");
      if (!imageEntry) throw Error("Release must contain an image");

      // Just for reporting purposes, not critical
      const size = files.reduce((total, file) => total + (file.size || 0), 0);

      return [
        {
          dir: true,
          hash,
          source: { from: "apm", name, version, fileId: "directory" },
          size
        }
      ];
    } else {
      throw e;
    }
  }
}
