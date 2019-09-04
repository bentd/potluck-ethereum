const Discount = artifacts.require("Discount");
const Coin = artifacts.require("Coin");
const Controller = artifacts.require("Controller");

module.exports = function(deployer, network, accounts) {
    deployer.deploy(Controller, Coin.address, Discount.address, {from: accounts[0]});
};
