const eth = require("./eth");
const repositoryAbi = require("../contracts/repositoryAbi.json");
import hexToAscii from "./utils/hexToAscii";

const Repo = eth.contract(repositoryAbi);

export default function repo(repoAddress: string) {
  const repo = Repo.at(repoAddress);

  async function getVersionsCount(): Promise<number> {
    const res = await repo.getVersionsCount();
    return res[0].toNumber();
  }

  async function getVersionById(
    versionId: number
  ): Promise<{ version: string; contentUri: string }> {
    const res: {
      semanticVersion: string[];
      contentURI: string;
    } = await repo.getByVersionId(versionId);
    return {
      version: res.semanticVersion.map(v => v.toString()).join("."),
      contentUri: hexToAscii(res.contentURI)
    };
  }

  return {
    getVersionsCount,
    getVersionById
  };
}
