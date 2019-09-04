const Coin = artifacts.require("Coin");

module.exports = function(deployer, network, accounts) {
    deployer.deploy(Coin, {from: accounts[0]});
};
