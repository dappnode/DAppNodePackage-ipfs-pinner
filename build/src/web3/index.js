module.exports = {
  getBlockNumber: require("./getBlockNumber"),
  getNewReposFromRegistry: require("./getNewReposFromRegistry"),
  repoContract: require("./repoContract"),
  ens: require("./ens"),
  // Expose underlying library for rapid development
  raw: require("./eth")
};
