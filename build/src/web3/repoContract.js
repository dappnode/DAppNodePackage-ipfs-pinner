const eth = require("./eth");
const repositoryAbi = require("../contracts/repositoryAbi.json");
const hexToAscii = require("./utils/hexToAscii");

const Repo = eth.contract(repositoryAbi);

function repo(repoAddress) {
  const repo = Repo.at(repoAddress);

  async function getVersionsCount() {
    const res = await repo.getVersionsCount();
    return res[0].toNumber();
  }

  async function getVersionById(versionId) {
    const res = await repo.getByVersionId(versionId);

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

module.exports = repo;
