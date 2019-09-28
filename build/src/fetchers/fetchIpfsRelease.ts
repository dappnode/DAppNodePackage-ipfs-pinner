import * as ipfs from "../ipfs";
import { DistributedFile, ManifestWithImage, ApmVersion } from "../types";
import isIpfsHash from "../utils/isIpfsHash";
import { getApmFileId } from "../utils/fileId";

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

    const files: DistributedFile[] = [
      {
        dir: false,
        hash,
        id: getApmFileId({ name, version, file: "manifest" })
      },
      {
        dir: false,
        hash: manifest.image.hash,
        id: getApmFileId({ name, version, file: "image" })
      }
    ];
    // Only add avatar file if exists
    if (manifest.avatar)
      files.push({
        dir: false,
        hash: manifest.avatar,
        id: getApmFileId({ name, version, file: "avatar" })
      });

    return files;
  } catch (e) {
    if (e.message.includes("is a directory")) {
      return [
        {
          dir: true,
          hash,
          id: getApmFileId({ name, version, file: "directory" })
        }
      ];
    } else {
      throw e;
    }
  }
}
