import "mocha";
import { expect } from "chai";

import { joinMultiname, splitMultiname } from "../../src/utils/multiname";

describe("Utils > multiname", () => {
  it("Should get and parse a multiname", () => {
    const parts = ["admin.dnp.dappnode.eth", "0.2.4", "manifest"];
    const expectedMultiname = "admin.dnp.dappnode.eth/0.2.4/manifest";
    const multiname = joinMultiname(parts);
    expect(multiname).to.equal(expectedMultiname, "Wrong multiname");
    expect(splitMultiname(multiname)).to.deep.equal(
      parts,
      "Wrong parsed multiname parts"
    );
  });

  it("Should deal with fields with backslashes", () => {
    const parts = ["admin.dnp.dappnode///.eth//", "0.2.4", "/manifest/"];
    const expectedMultiname = "admin.dnp.dappnode.eth/0.2.4/manifest";
    const multiname = joinMultiname(parts);
    expect(multiname).to.equal(expectedMultiname, "Wrong multiname");
  });
});
