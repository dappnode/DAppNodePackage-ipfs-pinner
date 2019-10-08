import "mocha";
import { expect } from "chai";

import { addChildSourcesAndAssetsToRemove } from "../../src/state/utils";
import { SourcesAndAssetsToEdit, Asset, Source } from "../../src/types";

describe("Sources > utils", () => {
  describe("addChildSourcesAndAssetsToRemove", () => {
    it("Should add sources", () => {
      const sourceMain = { multiname: "/type/main", from: "user" };
      const sourceChild1 = {
        multiname: "/type/child1",
        from: sourceMain.multiname
      };

      const stateChange: SourcesAndAssetsToEdit = {
        sourcesToAdd: [],
        sourcesToRemove: [sourceMain],
        assetsToAdd: [],
        assetsToRemove: []
      };
      const currentSources: Source[] = [sourceMain, sourceChild1];
      const currentAssets: Asset[] = [];
      const expectedResult: SourcesAndAssetsToEdit = {
        sourcesToAdd: [],
        sourcesToRemove: [sourceMain, sourceChild1],
        assetsToAdd: [],
        assetsToRemove: []
      };

      expect(
        addChildSourcesAndAssetsToRemove(
          stateChange,
          currentSources,
          currentAssets
        )
      ).to.deep.equal(expectedResult);
    });

    it("Should add assets", () => {
      const sourceMain = { multiname: "/type/main", from: "user" };
      const assetOfMain = {
        multiname: "/type2/ofMain",
        from: sourceMain.multiname,
        hash: "Qm"
      };

      const stateChange: SourcesAndAssetsToEdit = {
        sourcesToAdd: [],
        sourcesToRemove: [sourceMain],
        assetsToAdd: [],
        assetsToRemove: []
      };
      const currentSources: Source[] = [sourceMain];
      const currentAssets: Asset[] = [assetOfMain];
      const expectedResult: SourcesAndAssetsToEdit = {
        sourcesToAdd: [],
        sourcesToRemove: [sourceMain],
        assetsToAdd: [],
        assetsToRemove: [assetOfMain]
      };

      expect(
        addChildSourcesAndAssetsToRemove(
          stateChange,
          currentSources,
          currentAssets
        )
      ).to.deep.equal(expectedResult);
    });

    it("Should recursively add sources, assets and delete duplicates", () => {
      const sourceMain = { multiname: "/type/main", from: "user" };
      const sourceChild1 = {
        multiname: "/type/child1",
        from: sourceMain.multiname
      };
      const sourceChild2 = {
        multiname: "/type/child2",
        from: sourceChild1.multiname
      };
      const sourceChild3 = {
        multiname: "/type/child3",
        from: sourceChild2.multiname
      };
      const sourceChild4a = {
        multiname: "/type/child4a",
        from: sourceChild3.multiname
      };
      const sourceChild4b = {
        multiname: "/type/child4b",
        from: sourceChild3.multiname
      };
      const sourceOther = { multiname: "/type/other", from: "another-source" };
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

      const stateChange: SourcesAndAssetsToEdit = {
        sourcesToAdd: [],
        sourcesToRemove: [sourceMain],
        assetsToAdd: [],
        assetsToRemove: []
      };
      const currentSources: Source[] = [
        sourceMain,
        sourceChild1,
        sourceChild2,
        sourceChild3,
        sourceChild4a,
        sourceChild4b,
        sourceOther
      ];
      const currentAssets: Asset[] = [
        assetOfMain,
        assetOfChild,
        duplicatedAsset
      ];
      const expectedResult: SourcesAndAssetsToEdit = {
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
        assetsToRemove: [assetOfMain, assetOfChild]
      };

      expect(
        addChildSourcesAndAssetsToRemove(
          stateChange,
          currentSources,
          currentAssets
        )
      ).to.deep.equal(expectedResult);
    });
  });
});
