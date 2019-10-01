import "mocha";
import { expect } from "chai";

import { getApmFileId, parseFileId } from "../../src/utils/fileId";

describe("Utils > fileId", () => {
  it("Should get and parse an APM fileId", () => {
    const apmFileIdFields = {
      name: "admin.dnp.dappnode.eth",
      version: "0.2.4",
      file: "manifest"
    };
    const expectedFileId = "apm/admin.dnp.dappnode.eth/0.2.4/manifest";

    const fileId = getApmFileId(apmFileIdFields);
    expect(fileId).to.equal(expectedFileId, "Wrong fileId");
    expect(parseFileId(fileId)).to.deep.equal(
      apmFileIdFields,
      "Wrong parsed fileId fields"
    );
  });

  it("Should deal with fields with backslashes", () => {
    const apmFileIdFields = {
      name: "admin.dnp.dappnode///.eth//",
      version: "0.2.4",
      file: "/manifest/"
    };
    const expectedFileId = "apm/admin.dnp.dappnode.eth/0.2.4/manifest";

    const fileId = getApmFileId(apmFileIdFields);
    expect(fileId).to.equal(expectedFileId, "Wrong fileId");
  });
});
