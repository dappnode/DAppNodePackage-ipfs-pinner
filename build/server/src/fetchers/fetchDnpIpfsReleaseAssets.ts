import * as ipfs from "../ipfs";
import isIpfsHash, { normalizeIpfsHash } from "../utils/isIpfsHash";

export interface ReleaseAsset {
  hash: string;
  filename: string;
}

interface ManifestWithImage {
  name: string;
  version: string;
  avatar: string;
  image: {
    hash: string;
    size: number;
  };
}

/**
 * Should resolve a name/version into the manifest and all relevant hashes
 * Should return enough information to then query other files if necessary
 * or inspect the package metadata
 * - The download of image and avatar should be handled externally with other "pure"
 *   functions, without this method becoming a factory
 * - The download methods should be communicated of enought information to
 *   know where to fetch the content, hence the @DistributedFileSource
 */
export default async function fetchDnpIpfsReleaseAssets(
  contentUri: string
): Promise<ReleaseAsset[]> {
  const hash = normalizeIpfsHash(contentUri);
  if (!isIpfsHash(hash)) throw Error(`Release must be an IPFS hash ${hash}`);

  try {
    const manifest: ManifestWithImage = await ipfs.catJson(hash);
    if (typeof manifest !== "object") throw Error("Manifest is not an object");
    if (!manifest.image) throw Error("Manifest has no image field");

    const files = [
      { hash, filename: "manifest" },
      { hash: normalizeIpfsHash(manifest.image.hash), filename: "image" }
    ];
    // Only add avatar file if exists
    if (manifest.avatar)
      files.push({
        hash: normalizeIpfsHash(manifest.avatar),
        filename: "avatar"
      });

    return files;
  } catch (e) {
    if (e.message.includes(ipfs.directoryErrorMessage)) {
      return [{ hash, filename: "directory" }];
    } else {
      throw e;
    }
  }
}
