var Coin = artifacts.require("Coin");
var Discount = artifacts.require("Discount");
var Controller = artifacts.require("Controller");

module.exports = async function(callback) {

  var coin = await Coin.deployed();
  var discount = await Discount.deployed();
  var controller = await Controller.deployed();
  var accounts = await web3.eth.getAccounts();

  var constants = _constants(accounts);
  var MERCHANT = constants.MERCHANT;
  var BUSINESS = constants.BUSINESS;
  var PRODUCT = constants.PRODUCT;
  var ACTIVE = constants.ACTIVE;
  var DISCOUNT = constants.DISCOUNT;
  var JOINTIME = constants.JOINTIME;
  var MINMEMBERS = constants.MINMEMBERS;
  var MAXMEMBERS = constants.MAXMEMBERS;
  var PRICE = constants.PRICE;
  var EMPTY = constants.EMPTY;
  var BUYERS = constants.BUYERS;
  var MEMBERGOAL = constants.MEMBERGOAL;
  var BALANCE = constants.BALANCE;


  controller.endGroup(BUSINESS, PRODUCT);

}
