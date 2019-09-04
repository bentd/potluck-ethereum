var prompt = require("prompt");

var Coin = artifacts.require("Coin");
var Discount = artifacts.require("Discount");
var Controller = artifacts.require("Controller");

module.exports = async function(callback) {

  var coin = await Coin.deployed();
  var discount = await Discount.deployed();
  var controller = await Controller.deployed();
  var accounts = await web3.eth.getAccounts();

  const MERCHANT = accounts[1];
  const BUSINESS = "potluck-store.myshopify.com";
  const PRODUCT = 17828711170119;
  const ACTIVE = true;
  const INACTIVE = false;
  const DISCOUNT = 100;
  const JOINTIME = 5;
  const MINMEMBERS = 2;
  const MAXMEMBERS = 4;
  const PRICE = 400;
  const EMPTY = 0;
  const BUYERS = [accounts[2], accounts[3], accounts[4]];
  const MEMBERGOAL = 3;
  const BALANCE = PRICE - (DISCOUNT * BUYERS.length);

  coin.addMinter(controller.address);
  discount.addMinter(controller.address);
  controller.setOwner(MERCHANT, BUSINESS);
  controller.setRule(
    MERCHANT,
    BUSINESS,
    PRODUCT,
    ACTIVE,
    DISCOUNT,
    JOINTIME,
    MINMEMBERS,
    MAXMEMBERS,
    PRICE
  );


  for (let i = 0; i < MEMBERGOAL; i++) {
    coin.mint(BUYERS[i], BALANCE);
  }

  controller.startGroup(
    BUYERS[0],
    BUSINESS,
    PRODUCT,
    MEMBERGOAL
  );


  for (let i = 1; i < MEMBERGOAL; i++) {
    controller.joinGroup(
      BUYERS[i],
      BUSINESS,
      PRODUCT
    );
  }

  controller.evaluateGroup(BUSINESS, PRODUCT);

  controller.endGroup(BUSINESS, PRODUCT);

}
