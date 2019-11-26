import "mocha";
import { expect } from "chai";

import { getUserParent, addChildNodesToRemove } from "../../src/state/utils";
import { StateChange, State, Source, Asset } from "../../src/types";
import { mockHash } from "../testUtils";

describe("Sources > utils", () => {
  describe("getUserParent", () => {
    const userFrom = "user/Qmaasoudnqouboausbd9awd";
    const registry: Source = {
      multiname: "apm-registry/dnp.dappnode.eth",
      from: userFrom,
      hash: mockHash
    };
    const repo: Source = {
      multiname: "apm-repo/bitcoin.dnp.dappnode.eth",
      from: registry.multiname,
      hash: mockHash
    };
    const asset: Asset = {
      multiname:
        "apm-repo-release-content/bitcoin.dnp.dappnode.eth/0.2.0/directory",
      from: repo.multiname,
      hash: "Qm1"
    };

    const repoMissing: Source = {
      multiname: "apm-repo/missing.missing.dappnode.eth",
      from: "apm-registry/missing.dappnode.eth",
      hash: mockHash
    };
    const assetMissing: Asset = {
      multiname:
        "apm-repo-release-content/missing.missing.dappnode.eth/0.2.0/directory",
      from: "apm-repo/missing.missing.dappnode.eth",
      hash: "Qm2"
    };
    const state: State = {
      assets: [asset, assetMissing],
      sources: [repo, registry, repoMissing],
      cache: {}
    };

    it("Should find asset parent", () => {
      expect(getUserParent(asset, state)).to.equal(userFrom);
    });
    it("Should find repo parent", () => {
      expect(getUserParent(repo, state)).to.equal(userFrom);
    });
    it("Should registry as parent", () => {
      expect(getUserParent(registry, state)).to.equal(userFrom);
    });

    it("Should return undefined for an asset without parent", () => {
      expect(getUserParent(assetMissing, state)).to.equal(undefined);
    });
    it("Should return undefined for a repo without parent", () => {
      expect(getUserParent(repoMissing, state)).to.equal(undefined);
    });
  });

  describe("addChildNodesToRemove", () => {
    it("Should add sources", () => {
      const sourceMain = {
        multiname: "/type/main",
        from: "user",
        hash: mockHash
      };
      const sourceChild1 = {
        multiname: "/type/child1",
        from: sourceMain.multiname,
        hash: mockHash
      };

      const stateChange: StateChange = {
        sourcesToAdd: [],
        sourcesToRemove: [sourceMain],
        assetsToAdd: [],
        assetsToRemove: [],
        cacheChange: {}
      };

      const state: State = {
        sources: [sourceMain, sourceChild1],
        assets: [],
        cache: {}
      };

      const expectedResult: StateChange = {
        sourcesToAdd: [],
        sourcesToRemove: [sourceMain, sourceChild1],
        assetsToAdd: [],
        assetsToRemove: [],
        cacheChange: {}
      };

      expect(addChildNodesToRemove(stateChange, state)).to.deep.equal(
        expectedResult
      );
    });

    it("Should add assets", () => {
      const sourceMain = {
        multiname: "/type/main",
        from: "user",
        hash: mockHash
      };
      const assetOfMain = {
        multiname: "/type2/ofMain",
        from: sourceMain.multiname,
        hash: "Qm"
      };

      const stateChange: StateChange = {
        sourcesToAdd: [],
        sourcesToRemove: [sourceMain],
        assetsToAdd: [],
        assetsToRemove: [],
        cacheChange: {}
      };

      const state: State = {
        sources: [sourceMain],
        assets: [assetOfMain],
        cache: {}
      };

      const expectedResult: StateChange = {
        sourcesToAdd: [],
        sourcesToRemove: [sourceMain],
        assetsToAdd: [],
        assetsToRemove: [assetOfMain],
        cacheChange: {}
      };

      expect(addChildNodesToRemove(stateChange, state)).to.deep.equal(
        expectedResult
      );
    });

    it("Should recursively add sources, assets and delete duplicates", () => {
      const sourceMain = {
        multiname: "/type/main",
        from: "user",
        hash: mockHash
      };
      const sourceChild1 = {
        multiname: "/type/child1",
        from: sourceMain.multiname,
        hash: mockHash
      };
      const sourceChild2 = {
        multiname: "/type/child2",
        from: sourceChild1.multiname,
        hash: mockHash
      };
      const sourceChild3 = {
        multiname: "/type/child3",
        from: sourceChild2.multiname,
        hash: mockHash
      };
      const sourceChild4a = {
        multiname: "/type/child4a",
        from: sourceChild3.multiname,
        hash: mockHash
      };
      const sourceChild4b = {
        multiname: "/type/child4b",
        from: sourceChild3.multiname,
        hash: mockHash
      };
      const sourceOther = {
        multiname: "/type/other",
        from: "another-source",
        hash: mockHash
      };
      const assetOfMain = {
        multiname: "/type2/ofMain",
        from: sourceMain.multiname,
        hash: "Qm"
      };
      const assetOfChild = {
        multiname: "/type2/ofChild",
        from: sourceChild4b.multiname,
        hash: "Qm"
      };
      const duplicatedAsset = {
        multiname: "/type2/ofChild",
        from: sourceChild4a.multiname,
        hash: "Qm"
      };

      const stateChange: StateChange = {
        sourcesToAdd: [],
        sourcesToRemove: [sourceMain],
        assetsToAdd: [],
        assetsToRemove: [],
        cacheChange: {}
      };

      const state: State = {
        sources: [
          sourceMain,
          sourceChild1,
          sourceChild2,
          sourceChild3,
          sourceChild4a,
          sourceChild4b,
          sourceOther
        ],
        assets: [assetOfMain, assetOfChild, duplicatedAsset],
        cache: {}
      };

      const expectedResult: StateChange = {
        sourcesToAdd: [],
        sourcesToRemove: [
          sourceMain,
          sourceChild1,
          sourceChild2,
          sourceChild3,
          sourceChild4a,
          sourceChild4b
        ],
        assetsToAdd: [],
        assetsToRemove: [assetOfMain, assetOfChild],
        cacheChange: {}
      };

      expect(addChildNodesToRemove(stateChange, state)).to.deep.equal(
        expectedResult
      );
    });
  });
});
