const Controller = artifacts.require("Controller");
const Coin = artifacts.require("Coin");
const Discount = artifacts.require("Discount");
const _constants = require("../constants/constants.js");

const NEW = false;
const LIVE = true;

contract("System Test", async accounts => {

  var MERCHANT;
  var BUSINESS;
  var PRODUCT;
  var ACTIVE;
  var DISCOUNT;
  var JOINTIME;
  var MINMEMBERS;
  var MAXMEMBERS;
  var PRICE;
  var EMPTY;
  var BUYERS;
  var MEMBERGOAL;
  var BALANCE;

  var discount;
  var coin;
  var controller;

  before(async () => {

    var constants = _constants(accounts);
    MERCHANT = constants.MERCHANT;
    BUSINESS = constants.BUSINESS;
    PRODUCT = constants.PRODUCT;
    ACTIVE = constants.ACTIVE;
    DISCOUNT = constants.DISCOUNT;
    JOINTIME = constants.JOINTIME;
    MINMEMBERS = constants.MINMEMBERS;
    MAXMEMBERS = constants.MAXMEMBERS;
    PRICE = constants.PRICE;
    EMPTY = constants.EMPTY;
    BUYERS = constants.BUYERS;
    MEMBERGOAL = constants.MEMBERGOAL;
    BALANCE = constants.BALANCE;

    if (LIVE) {
      discount = await Discount.at(constants.DISCOUNTX);
      coin = await Coin.at(constants.COINX);
      controller = await Controller.at(constants.CONTROLLERX);
    }
    else {
      discount = await Discount.deployed();
      coin = await Coin.deployed();
      controller = await Controller.deployed(coin.address, discount.address);
    }

  });

  it("should add controller as coin minter", async () => {
    if (NEW) {
      let addMinter = await coin.addMinter(controller.address);
      let isMinter = await coin.isMinter(controller.address);
      assert(addMinter.logs[0].event == "MinterAdded");
      assert(addMinter.logs[0].args.account == controller.address);
      assert(isMinter);
    }
  });

  it("should add controller as discount minter", async () => {
    if (NEW) {
      let addMinter = await discount.addMinter(controller.address);
      let isMinter = await discount.isMinter(controller.address);
      assert(addMinter.logs[0].event == "MinterAdded");
      assert(addMinter.logs[0].args.account == controller.address);
      assert(isMinter);
    }
  });

  it("should set merchant as owner of business", async () => {
    if (NEW) {
      let setOwner = await controller.setOwner(MERCHANT, BUSINESS);
      let business = await controller.businesses(MERCHANT);
      assert(setOwner.logs[0].event == "OwnerSet");
      assert(setOwner.logs[0].args.account == MERCHANT);
      assert(setOwner.logs[0].args.business == BUSINESS);
      assert(business == BUSINESS);
    }
  });

  it("should delete merchant as owner of business", async () => {
    let deleteOwner = await controller.deleteOwner(MERCHANT);
    let business = await controller.businesses(MERCHANT);
    assert(deleteOwner.logs[0].event == "OwnerSet");
    assert(deleteOwner.logs[0].args.account == MERCHANT);
    assert(deleteOwner.logs[0].args.business == EMPTY);
    assert(business == EMPTY);
  });

  it("should re-set merchant as owner of business", async () => {
    let setOwner = await controller.setOwner(MERCHANT, BUSINESS);
    let business = await controller.businesses(MERCHANT);
    assert(setOwner.logs[0].event == "OwnerSet");
    assert(setOwner.logs[0].args.account == MERCHANT);
    assert(setOwner.logs[0].args.business == BUSINESS);
    assert(business == BUSINESS);
  });

  it("should set rule for business", async () => {
    if (NEW) {
      let setRule = await controller.setRule(
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
      let rule = await controller.rules(
        BUSINESS,
        PRODUCT
      );
      assert(setRule.logs[0].event == "RuleSet");
      assert(setRule.logs[0].args.business == BUSINESS);
      assert(setRule.logs[0].args.product == PRODUCT);
      assert(setRule.logs[0].args.active == ACTIVE);
      assert(setRule.logs[0].args.discount == DISCOUNT);
      assert(setRule.logs[0].args.joinTime == JOINTIME);
      assert(setRule.logs[0].args.minMembers == MINMEMBERS);
      assert(setRule.logs[0].args.maxMembers == MAXMEMBERS);
      assert(setRule.logs[0].args.price == PRICE);
      assert(rule.active == ACTIVE);
      assert(rule.discount == DISCOUNT);
      assert(rule.joinTime == JOINTIME);
      assert(rule.minMembers == MINMEMBERS);
      assert(rule.maxMembers == MAXMEMBERS);
      assert(rule.price == PRICE);
    }
  });

  it("should delete rule for business", async () => {
    let deleteRule = await controller.deleteRule(MERCHANT, BUSINESS, PRODUCT);
    let rule = await controller.rules(BUSINESS, PRODUCT);
    assert(deleteRule.logs[0].event == "RuleSet");
    assert(deleteRule.logs[0].args.business = BUSINESS);
    assert(deleteRule.logs[0].args.product == PRODUCT);
    assert(rule.active == EMPTY);
    assert(rule.discount == EMPTY);
    assert(rule.joinTime == EMPTY);
    assert(rule.minMembers == EMPTY);
    assert(rule.maxMembers == EMPTY);
    assert(rule.price == EMPTY);
  });

  it("should re-set rule for business", async () => {
    let setRule = await controller.setRule(
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
    let rule = await controller.rules(
      BUSINESS,
      PRODUCT
    );
    assert(setRule.logs[0].event == "RuleSet");
    assert(setRule.logs[0].args.business == BUSINESS);
    assert(setRule.logs[0].args.product == PRODUCT);
    assert(setRule.logs[0].args.active == ACTIVE);
    assert(setRule.logs[0].args.discount == DISCOUNT);
    assert(setRule.logs[0].args.joinTime == JOINTIME);
    assert(setRule.logs[0].args.minMembers == MINMEMBERS);
    assert(setRule.logs[0].args.maxMembers == MAXMEMBERS);
    assert(setRule.logs[0].args.price == PRICE);
    assert(rule.active == ACTIVE);
    assert(rule.discount == DISCOUNT);
    assert(rule.joinTime == JOINTIME);
    assert(rule.minMembers == MINMEMBERS);
    assert(rule.maxMembers == MAXMEMBERS);
    assert(rule.price == PRICE);
  });

  it("should mint coins to a buyer", async () => {
    mintCoin = await coin.mint(BUYERS[0], BALANCE);
    balance = await coin.balanceOf(BUYERS[0]);
    assert(mintCoin.logs[0].event == "Transfer");
    assert(mintCoin.logs[0].args.to == BUYERS[0]);
    assert(mintCoin.logs[0].args.value == BALANCE);
    if (NEW) {
      assert(balance == BALANCE);
    }
  });

  it("should escrow coins of a buyer", async () => {
    let escrowCoin = await coin.escrow(BUYERS[0], BALANCE);
    let balance = await coin.balanceOf(BUYERS[0]);
    let escrow = await coin.escrowOf(BUYERS[0]);
    assert(escrowCoin.logs[0].event == "Transfer");
    assert(escrowCoin.logs[0].args.from == BUYERS[0]);
    assert(escrowCoin.logs[0].args.value == BALANCE);
    assert(escrowCoin.logs[1].event == "EscrowCoin");
    assert(escrowCoin.logs[1].args.from == BUYERS[0]);
    assert(escrowCoin.logs[1].args.value == BALANCE);
    if (NEW) {
      assert(balance == EMPTY);
      assert(escrow == BALANCE);
    }
  });

  it("should unescrow buyer coins to merchant", async () => {
    let unescrowCoin = await coin.unescrow(BUYERS[0], MERCHANT, BALANCE);
    let merchantBalance = await coin.balanceOf(MERCHANT);
    let buyerEscrow = await coin.escrowOf(BUYERS[0]);
    assert(unescrowCoin.logs[0].event == "Transfer");
    assert(unescrowCoin.logs[0].args.to == MERCHANT);
    assert(unescrowCoin.logs[0].args.value == BALANCE);
    assert(unescrowCoin.logs[1].event == "UnescrowCoin");
    assert(unescrowCoin.logs[1].args.from == BUYERS[0]);
    assert(unescrowCoin.logs[1].args.to == MERCHANT);
    assert(unescrowCoin.logs[1].args.value == BALANCE);
    if (NEW) {
      assert(merchantBalance == BALANCE);
      assert(buyerEscrow == EMPTY);
    }
  });

  it("should burn coins of merchant", async () => {
    let burnCoin = await coin.burn(MERCHANT, BALANCE);
    let balance = await coin.balanceOf(MERCHANT);
    assert(burnCoin.logs[0].event == "Transfer");
    assert(burnCoin.logs[0].args.from == MERCHANT);
    assert(burnCoin.logs[0].args.value == BALANCE);
    if (NEW) {
      assert(balance == EMPTY);
    }
  });

  it("should mint coins to 3 buyers", async () => {
    let mintCoin;
    let balance;
    for (let i = 0; i < MEMBERGOAL; i++) {
      mintCoin = await coin.mint(BUYERS[i], BALANCE);
      balance = await coin.balanceOf(BUYERS[i]);
      assert(mintCoin.logs[0].event == "Transfer");
      assert(mintCoin.logs[0].args.to == BUYERS[i]);
      assert(mintCoin.logs[0].args.value == BALANCE);
      if (NEW) {
        assert(balance == BALANCE);
      }
    }
  });

  it("should burn discounts of buyers", async () => {
    for (var i = 0; i < 3; i++) {
      let encoding = web3.eth.abi.encodeParameters(["address", "string", "uint256"], [BUYERS[i], BUSINESS, PRODUCT]);
      let tokenId = web3.utils.soliditySha3(encoding);
      mintCoin = await discount.burn(BUYERS[i], tokenId);
      assert(mintCoin.logs[0].event == "Transfer");
      assert(mintCoin.logs[0].args.from == BUYERS[i]);
      assert(mintCoin.logs[0].args.value == tokenId);
      if (NEW) {
        assert(balance == BALANCE);
      }
    }
  });

  it("should start group for a buyer", async () => {
    let startGroup = await controller.startGroup(
      BUYERS[0],
      BUSINESS,
      PRODUCT,
      MEMBERGOAL
    );
    let group = await controller.groups.call(BUSINESS, PRODUCT);
    assert(startGroup.logs[0].event == "EscrowCoin");
    assert(startGroup.logs[0].args.from == BUYERS[0]);
    assert(startGroup.logs[0].args.value == BALANCE);
    assert(startGroup.logs[1].event == "GroupStarted");
    assert(startGroup.logs[1].args.business == BUSINESS);
    assert(startGroup.logs[1].args.product == PRODUCT);
    assert(startGroup.logs[1].args.numMembers == 1);
    assert(startGroup.logs[1].args.memberGoal == MEMBERGOAL);
  });

  it("should allow other buyers to join group", async () => {
    let joinGroup1 = await controller.joinGroup(
      BUYERS[1],
      BUSINESS,
      PRODUCT
    );
    let joinGroup2 = await controller.joinGroup(
      BUYERS[2],
      BUSINESS,
      PRODUCT
    );
    let joinGroups = [joinGroup1, joinGroup2];
    let group = await controller.groups(BUSINESS, PRODUCT);
    for (let i = 0; i < joinGroups.length; i++) {
      assert(joinGroups[i].logs[0].event == "EscrowCoin");
      assert(joinGroups[i].logs[0].args.from == BUYERS[i+1]);
      assert(joinGroups[i].logs[0].args.value == BALANCE);
      assert(joinGroups[i].logs[1].event == "GroupJoined");
      assert(joinGroups[i].logs[1].args.business == BUSINESS);
      assert(joinGroups[i].logs[1].args.product == PRODUCT);
      assert(joinGroups[i].logs[1].args.numMembers == (i+2));
      assert(joinGroups[i].logs[1].args.memberGoal == MEMBERGOAL);
    }
  });

  it("should evaluate group", async () => {
    let groupSize = await controller.getGroupSize(BUSINESS, PRODUCT);
    let evaluateGroup = await controller.evaluateGroup(BUSINESS, PRODUCT);

    for (let i = 0; i < groupSize; i++) {
      assert(evaluateGroup.logs[i].event == "UnescrowCoin");
      assert(evaluateGroup.logs[i].args.to == MERCHANT);
      assert(evaluateGroup.logs[i].args.value == BALANCE);
    }
    assert(evaluateGroup.logs[groupSize].event == "GroupEvaluated");
    assert(evaluateGroup.logs[groupSize].args.business == BUSINESS);
    assert(evaluateGroup.logs[groupSize].args.product == PRODUCT);
  });

  it("should end successful group", async () => {
    let groupSize = await controller.getGroupSize(BUSINESS, PRODUCT);
    let endGroup = await controller.endGroup(BUSINESS, PRODUCT);

    for (let i = 0; i < groupSize; i++) {
      let encoding = web3.eth.abi.encodeParameters(["address", "string", "uint256"], [BUYERS[i], BUSINESS, PRODUCT]);
      web3.eth.abi.encodeParameters(["address", "string", "uint256"], [accounts[2], "potluck-store.myshopify.com", 1779673727047])
      let tokenId = web3.utils.soliditySha3(encoding);
      assert(endGroup.logs[i].event == "MintDiscount");
      assert(endGroup.logs[i].args.to == BUYERS[i]);
      assert(web3.utils.padLeft(web3.utils.toHex(endGroup.logs[i].args.tokenId), 64) == tokenId);
    }

    assert(endGroup.logs[groupSize].event == "GroupEnded");
    assert(endGroup.logs[groupSize].args.business == BUSINESS);
    assert(endGroup.logs[groupSize].args.product == PRODUCT);
    assert(endGroup.logs[groupSize].args.numMembers == MEMBERGOAL);
    assert(endGroup.logs[groupSize].args.memberGoal == MEMBERGOAL);
    assert(endGroup.logs[groupSize].args.success == true);
    assert(endGroup.logs[groupSize.toNumber() + 1].event == "GroupReset");
    assert(endGroup.logs[groupSize.toNumber() + 1].args.business == BUSINESS);
    assert(endGroup.logs[groupSize.toNumber() + 1].args.product == PRODUCT);
  });

  it("should mint coins to 3 buyers", async () => {
    let mintCoin;
    let balance;
    for (let i = 0; i < 3; i++) {
      mintCoin = await coin.mint(BUYERS[i], BALANCE);
      balance = await coin.balanceOf(BUYERS[i]);
      assert(mintCoin.logs[0].event == "Transfer");
      assert(mintCoin.logs[0].args.to == BUYERS[i]);
      assert(mintCoin.logs[0].args.value == BALANCE);
      if (NEW) {
        assert(balance == BALANCE);
      }
    }
  });

  it("should start group for a buyer", async () => {
    let startGroup = await controller.startGroup(
      BUYERS[0],
      BUSINESS,
      PRODUCT,
      MEMBERGOAL
    );
    assert(startGroup.logs[0].event == "EscrowCoin");
    assert(startGroup.logs[0].args.from == BUYERS[0]);
    assert(startGroup.logs[0].args.value == BALANCE);
    assert(startGroup.logs[1].event == "GroupStarted");
    assert(startGroup.logs[1].args.business == BUSINESS);
    assert(startGroup.logs[1].args.product == PRODUCT);
    assert(startGroup.logs[1].args.numMembers == 1);
    assert(startGroup.logs[1].args.memberGoal == MEMBERGOAL);
  });

  it("should allow other buyers to join group", async () => {
    let joinGroup1 = await controller.joinGroup(
      BUYERS[1],
      BUSINESS,
      PRODUCT
    );
    var now = new Date().getTime();
    while (new Date().getTime() < (now + 1000 * JOINTIME + 3000)) {
      let i = 5;
    }
    try {
      var joinGroup2 = await controller.joinGroup(
        BUYERS[2],
        BUSINESS,
        PRODUCT
      );
      var joinGroups = [joinGroup1, joinGroup2];
    }
    catch(err) {
      var joinGroups = [joinGroup1];
    }
    for (let i = 0; i < joinGroups.length; i++) {
      assert(joinGroups[i].logs[0].event == "EscrowCoin");
      assert(joinGroups[i].logs[0].args.from == BUYERS[i+1]);
      assert(joinGroups[i].logs[0].args.value == BALANCE);
      assert(joinGroups[i].logs[1].event == "GroupJoined");
      assert(joinGroups[i].logs[1].args.business == BUSINESS);
      assert(joinGroups[i].logs[1].args.product == PRODUCT);
      assert(joinGroups[i].logs[1].args.numMembers == (i+2));
      assert(joinGroups[i].logs[1].args.memberGoal == MEMBERGOAL);
    }
  });

  it("should evaluate group", async () => {
    let groupSize = await controller.getGroupSize(BUSINESS, PRODUCT);
    let evaluateGroup = await controller.evaluateGroup(BUSINESS, PRODUCT);

    for (let i = 0; i < groupSize; i++) {
      assert(evaluateGroup.logs[i].event == "UnescrowCoin");
      assert(evaluateGroup.logs[i].args.to == BUYERS[i]);
      assert(evaluateGroup.logs[i].args.value == BALANCE);
    }
    assert(evaluateGroup.logs[groupSize].event == "GroupEvaluated");
    assert(evaluateGroup.logs[groupSize].args.business == BUSINESS);
    assert(evaluateGroup.logs[groupSize].args.product == PRODUCT);
  });

  it("should end unsuccessful group", async () => {
    let endGroup = await controller.endGroup(BUSINESS, PRODUCT);

    assert(endGroup.logs[0].event == "GroupEnded");
    assert(endGroup.logs[0].args.business == BUSINESS);
    assert(endGroup.logs[0].args.product == PRODUCT);
    assert(endGroup.logs[0].args.numMembers == 2);
    assert(endGroup.logs[0].args.memberGoal == MEMBERGOAL);
    assert(endGroup.logs[1].event == "GroupReset");
    assert(endGroup.logs[1].args.business == BUSINESS);
    assert(endGroup.logs[1].args.product == PRODUCT);
  });
});
