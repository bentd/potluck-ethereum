const Discount = artifacts.require("Discount");

module.exports = function(deployer, network, accounts) {
    deployer.deploy(Discount, {from: accounts[0]});
};
