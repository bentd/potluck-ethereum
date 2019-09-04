
module.exports = function(accounts) {
  const PRICE = 400;
  const DISCOUNT = 100;
  const BUYERS = [accounts[2], accounts[3], accounts[4]];

  return {
    DISCOUNTX : "0x79C6bC6E813974B34576283E680f68781a4Dd194",
    COINX: "0xB4C7f25d916Dd891978Ec58A15acF60ff83BF820",
    CONTROLLERX: "0x7A72B0Ac6424979bE1ba8EBDC936102D46C4539C",
    MERCHANT : accounts[1],
    BUSINESS : "potluck-store.myshopify.com",
    PRODUCT : 1779673727047,
    ACTIVE : true,
    INACTIVE : false,
    DISCOUNT : DISCOUNT,
    JOINTIME : 5,
    MINMEMBERS : 2,
    MAXMEMBERS : 4,
    PRICE : PRICE,
    EMPTY : 0,
    BUYERS : BUYERS,
    MEMBERGOAL : 3,
    BALANCE : PRICE - (DISCOUNT * BUYERS.length)
  }
};
