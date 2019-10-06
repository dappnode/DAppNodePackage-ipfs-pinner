import "mocha";
import { expect } from "chai";
import flatten from "lodash/flatten";
import rewiremock from "rewiremock";

import * as apmDnpRepo from "../../src/sources/apmDnpRepo";
import { Version } from "../../src/fetchers/fetchNewApmVersions";
import {
  Source,
  PollSourceFunctionReturn,
  Asset,
  AssetOwn,
  SourceOwn
} from "../../src/types";
import { ReleaseAsset } from "../../src/fetchers/fetchDnpIpfsReleaseAssets";
import { mockHash } from "../testUtils";

describe("Source > apmDnpRepo", () => {
  async function getApmDnpRepoMock(
    versions: Version[],
    releaseAssets: ReleaseAsset[]
  ) {
    async function fetchNewApmVersions(
      repoName: string,
      numOfVersions: number
    ): Promise<Version[]> {
      repoName;
      numOfVersions;
      return versions;
    }

    async function fetchDnpIpfsReleaseAssets(
      contentUri: string
    ): Promise<ReleaseAsset[]> {
      contentUri;
      return releaseAssets.map(asset => ({ ...asset, hash: contentUri }));
    }

    return await rewiremock.around(
      () => import("../../src/sources/apmDnpRepo"),
      mock => {
        mock(() => import("../../src/fetchers/fetchNewApmVersions"))
          .withDefault(fetchNewApmVersions)
          .toBeUsed();
        mock(() => import("../../src/fetchers/fetchDnpIpfsReleaseAssets"))
          .withDefault(fetchDnpIpfsReleaseAssets)
          .toBeUsed();
      }
    );
  }

  const hash = mockHash;
  const contentUri = mockHash;

  describe("multiname parsers", () => {
    it("Should get and parse a multiname", () => {
      const repo = { name: "bitcoin.dnp.dappnode.eth" };
      const multiname = apmDnpRepo.getMultiname(repo);
      expect(multiname).to.equal(
        "apm-dnp-repo/bitcoin.dnp.dappnode.eth",
        "Wrong multiname"
      );
      expect(apmDnpRepo.parseMultiname(multiname)).to.deep.equal(
        repo,
        "Wrong parsed multiname"
      );
    });
  });

  describe("poll function", () => {
    it("Should return no results for an empty case", async () => {
      const name = "bitcoin.dnp.dappnode.eth";
      const source: SourceOwn = {
        multiname: apmDnpRepo.getMultiname({ name })
      };

      const versions: Version[] = [];
      const releaseAssets: ReleaseAsset[] = [];

      const currentOwnSources: SourceOwn[] = [];
      const currentOwnAssets: AssetOwn[] = [];
      const expectedResult: PollSourceFunctionReturn = {
        assetsToAdd: [],
        assetsToRemove: []
      };

      const apmDnpRepoMock = await getApmDnpRepoMock(versions, releaseAssets);
      const result = await apmDnpRepoMock.poll({
        source,
        currentOwnAssets,
        currentOwnSources,
        internalState: ""
      });
      expect(result).to.deep.equal(expectedResult);
    });

    it("Should return new assets if new versions are found", async () => {
      const name = "bitcoin.dnp.dappnode.eth";
      const source: SourceOwn = {
        multiname: apmDnpRepo.getMultiname({ name })
      };

      const versions: Version[] = [{ version: "0.2.0", contentUri }];
      const releaseAssets: ReleaseAsset[] = [
        { hash: "", filename: "manifest" }
      ];

      const currentOwnSources: SourceOwn[] = [];
      const currentOwnAssets: AssetOwn[] = [];
      const expectedResult: PollSourceFunctionReturn = {
        assetsToAdd: [
          {
            hash,
            multiname:
              "apm-dnp-release-file/bitcoin.dnp.dappnode.eth/0.2.0/manifest"
          }
        ],
        assetsToRemove: []
      };

      const apmDnpRepoMock = await getApmDnpRepoMock(versions, releaseAssets);
      const result = await apmDnpRepoMock.poll({
        source,
        currentOwnAssets,
        currentOwnSources,
        internalState: ""
      });
      expect(result).to.deep.equal(expectedResult);
    });

    it("Should deal with multiple version and clean old versions", async () => {
      const name = "name";
      const source: SourceOwn = {
        multiname: apmDnpRepo.getMultiname({ name })
      };

      const versions: Version[] = [
        { version: "0.2.0", contentUri },
        { version: "0.1.3", contentUri },
        { version: "0.2.2", contentUri }
      ];
      const releaseAssets: ReleaseAsset[] = [
        { hash: "", filename: "manifest" },
        { hash: "", filename: "image" }
      ];

      const currentOwnSources: SourceOwn[] = [];
      const currentOwnAssets: AssetOwn[] = flatten(
        ["0.1.3", "0.1.1", "0.1.2"].map(version => [
          {
            multiname: `apm-dnp-release-file/${name}/${version}/manifest`,
            hash
          },
          {
            multiname: `apm-dnp-release-file/${name}/${version}/image`,
            hash
          }
        ])
      );

      const expectedResult: PollSourceFunctionReturn = {
        assetsToAdd: [
          {
            multiname: "apm-dnp-release-file/name/0.2.2/manifest",
            hash
          },
          {
            multiname: "apm-dnp-release-file/name/0.2.2/image",
            hash
          },
          {
            multiname: "apm-dnp-release-file/name/0.2.0/manifest",
            hash
          },
          {
            multiname: "apm-dnp-release-file/name/0.2.0/image",
            hash
          }
        ],
        assetsToRemove: [
          {
            multiname: "apm-dnp-release-file/name/0.1.2/manifest",
            hash
          },
          {
            multiname: "apm-dnp-release-file/name/0.1.2/image",
            hash
          },
          {
            multiname: "apm-dnp-release-file/name/0.1.1/manifest",
            hash
          },
          {
            multiname: "apm-dnp-release-file/name/0.1.1/image",
            hash
          }
        ]
      };

      const apmDnpRepoMock = await getApmDnpRepoMock(versions, releaseAssets);
      const result = await apmDnpRepoMock.poll({
        source,
        currentOwnAssets,
        currentOwnSources,
        internalState: ""
      });
      expect(result).to.deep.equal(expectedResult);
    });

    it("Should ignore new versions if there are too many", async () => {
      const name = "name";
      const source: SourceOwn = {
        multiname: apmDnpRepo.getMultiname({ name })
      };

      const versions: Version[] = [
        { version: "0.2.0", contentUri },
        { version: "0.2.1", contentUri },
        { version: "0.2.2", contentUri },
        { version: "0.2.3", contentUri }
      ];
      const releaseAssets: ReleaseAsset[] = [
        { hash: "", filename: "manifest" },
        { hash: "", filename: "image" }
      ];

      const currentOwnSources: SourceOwn[] = [];
      const currentOwnAssets: AssetOwn[] = [];

      const expectedResult: PollSourceFunctionReturn = {
        assetsToAdd: [
          {
            multiname: "apm-dnp-release-file/name/0.2.3/manifest",
            hash
          },
          {
            multiname: "apm-dnp-release-file/name/0.2.3/image",
            hash
          },
          {
            multiname: "apm-dnp-release-file/name/0.2.2/manifest",
            hash
          },
          {
            multiname: "apm-dnp-release-file/name/0.2.2/image",
            hash
          },
          {
            multiname: "apm-dnp-release-file/name/0.2.1/manifest",
            hash
          },
          {
            multiname: "apm-dnp-release-file/name/0.2.1/image",
            hash
          }
        ],
        assetsToRemove: []
      };

      const apmDnpRepoMock = await getApmDnpRepoMock(versions, releaseAssets);
      const result = await apmDnpRepoMock.poll({
        source,
        currentOwnAssets,
        currentOwnSources,
        internalState: ""
      });
      expect(result).to.deep.equal(expectedResult);
    });
  });
});
