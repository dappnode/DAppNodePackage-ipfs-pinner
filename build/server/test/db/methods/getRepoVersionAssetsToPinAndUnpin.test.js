const expect = require("chai").expect;
const cleanDb = require("../../cleanDb");

// Modules to test
const db = require("../../../src/db");
const getRepoVersionAssetsToPinAndUnpin = require("../../../src/db/methods/getRepoVersionAssetsToPinAndUnpin");

describe("db > method > getRepoVersionAssetsToPinAndUnpin", () => {
  before("Should clean the db", cleanDb);

  it("should return the correct sorted assets", async () => {
    // Set data
    for (const version of ["0.2.0", "0.2.1", "0.2.2"]) {
      db.addRepoVersion({
        name: "admin.dnp.dappnode.eth",
        version,
        contentUris: { manifest: "Qmabcd" }
      });
    }

    // Get data
    const assets = getRepoVersionAssetsToPinAndUnpin(2);
    console.log(assets);
    expect(assets).to.deep.equal({
      assetsToPin: [
        { id: "admin.dnp.dappnode.eth 0.2.2 manifest", hash: "Qmabcd" },
        { id: "admin.dnp.dappnode.eth 0.2.1 manifest", hash: "Qmabcd" }
      ],
      assetsToUnpin: [
        { id: "admin.dnp.dappnode.eth 0.2.0 manifest", hash: "Qmabcd" }
      ]
    });
  });

  after("Should clean the db", cleanDb);
});
