const ShareApp = artifacts.require("ShareApp");

module.exports = function(deployer) {
  deployer.deploy(ShareApp);
};
