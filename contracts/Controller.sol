pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./Base.sol";
import "./Coin.sol";
import "./Discount.sol";

contract Controller is Base {

    using SafeMath for uint256;

    struct Rule {
        bool active;
        uint256 discount;
        uint256 joinTime;
        uint256 minMembers;
        uint256 maxMembers;
        uint256 price;
    }

    struct Group {
        bool evaluated;
        address[] members;
        uint256 numMembers;
        uint256 memberGoal;
        uint256 startTime;
    }

    Coin private _coin;
    Discount private _discount;

    // _owners[business] => owner;
    // businesses[owner] => business;
    // rules[business][product] => rule
    // groups[business][product] => group
    mapping(string => address) private _owners;
    mapping(address => string) public businesses;
    mapping(string => mapping(uint256 => Rule)) public rules;
    mapping(string => mapping(uint256 => Group)) public groups;

    event OwnerSet(
        address indexed account,
        string business
    );
    event RuleSet(
        string business,
        uint256 indexed product,
        bool active,
        uint256 discount,
        uint256 joinTime,
        uint256 minMembers,
        uint256 maxMembers,
        uint256 price
    );
    event GroupStarted(
        string business,
        uint256 indexed product,
        uint256 numMembers,
        uint256 memberGoal,
        uint256 startTime,
        uint256 joinTime
    );
    event GroupJoined(
        string business,
        uint256 indexed product,
        uint256 numMembers,
        uint256 memberGoal
    );
    event GroupEvaluated(
        string business,
        uint256 indexed product
    );
    event GroupEnded(
        string business,
        uint256 indexed product,
        uint256 numMembers,
        uint256 memberGoal,
        bool success
    );
    event GroupReset(
        string business,
        uint256 indexed product
    );
    event EscrowCoin(
        address indexed from,
        uint256 value
    );
    event UnescrowCoin(
        address indexed from,
        address indexed to,
        uint256 value
    );
    event MintDiscount(
        address indexed to,
        uint256 indexed tokenId
    );

    constructor(address payable coin, address payable discount)
        public
        addressIsNotContract(msg.sender)
    {
        _coin = Coin(coin);
        _discount = Discount(discount);
    }

    modifier isAuthorized(address account, string memory business) {
        require(_owners[business] == account, "Account is not the owner!");
        _;
    }

    modifier isNotOwner(address account) {
        string memory business = businesses[account];
        string memory empty = "";
        bytes32 businessBytes = keccak256(abi.encodePacked(business));
        bytes32 emptyBytes = keccak256(abi.encodePacked(""));
        require(businessBytes == emptyBytes, "Account is an owner!");
        _;
    }

    function getGroupSize(
        string memory business,
        uint256 product
    )
        public
        view
        onlyOwner
        returns (uint256)
    {
        return groups[business][product].members.length;
    }

    function setOwner(
        address account,
        string memory business
    )
        public
        onlyOwner
        nonReentrant
        addressIsNotContract(account)
        isNotOwner(account)
        returns (bool)
    {
        _owners[business] = account;
        businesses[account] = business;
        emit OwnerSet(account, business);
        return true;
    }

    function deleteOwner(
        address account
    )
        public
        onlyOwner
        nonReentrant
        addressIsNotContract(account)
        returns (bool)
    {
        delete _owners[businesses[account]];
        businesses[account] = "";
        emit OwnerSet(account, "");
        return true;
    }

    function setRule(
        address account,
        string memory business,
        uint256 product,
        bool active,
        uint256 discount,
        uint256 joinTime,
        uint256 minMembers,
        uint256 maxMembers,
        uint256 price
    )
        public
        onlyOwner
        nonReentrant
        isAuthorized(account, business)
        returns (bool)
    {
        require(groups[business][product].members.length == 0, "Group is not empty!");
        Rule storage rule = rules[business][product];
        rule.active = active;
        rule.discount = discount;
        rule.joinTime = joinTime;
        rule.minMembers = minMembers;
        rule.maxMembers = maxMembers;
        rule.price = price;
        emit RuleSet(
            business,
            product,
            active,
            discount,
            joinTime,
            minMembers,
            maxMembers,
            price
        );
        return true;
    }

    function deleteRule(
        address account,
        string memory business,
        uint256 product
    )
        public
        onlyOwner
        nonReentrant
        isAuthorized(account, business)
        returns (bool)
    {
      require(groups[business][product].members.length == 0, "Group is not empty!");
      Rule storage rule = rules[business][product];
      rule.active = false;
      rule.discount = 0;
      rule.joinTime = 0;
      rule.minMembers = 0;
      rule.maxMembers = 0;
      rule.price = 0;
      emit RuleSet(
          business,
          product,
          false,
          0,
          0,
          0,
          0,
          0
      );
      return true;
    }

    function startGroup(
        address account,
        string memory business,
        uint256 product,
        uint256 memberGoal
    )
        public
        nonReentrant
        onlyOwner
        addressIsNotContract(account)
        returns (bool)
    {
        Rule storage rule = rules[business][product];
        Group storage group = groups[business][product];
        require(rule.active, "Rule is not active!");
        require(memberGoal >= rule.minMembers, "Goal is too low!");
        require(memberGoal <= rule.maxMembers, "Goal is too high!");
        require(group.members.length == 0, "Group is not empty!");
        require(_owners[business] != account, "Account is owner of this business!");
        _sufficientFunds(account, business, product, memberGoal);
        _startGroup(account, business, product, memberGoal);
        return true;
    }

    function joinGroup(
        address account,
        string memory business,
        uint256 product
    )
        public
        nonReentrant
        onlyOwner
        addressIsNotContract(account)
        returns (bool)
    {
        Group storage group = groups[business][product];
        require(group.members.length > 0, "Group is not empty!");
        require(group.members.length < group.memberGoal, "Group is full!");
        require(_isLive(business, product), "Group has expired!");
        require(_owners[business] != account, "Account is owner of this business!");
        _notMember(account, business, product);
        _sufficientFunds(account, business, product, group.memberGoal);
        _joinGroup(account, business, product);
        return true;
    }

    function evaluateGroup(
        string memory business,
        uint256 product
    )
        public
        onlyOwner
        nonReentrant
        returns (bool)
    {
        if (_isFull(business, product)) {
            _evaluateGroup(business, product, true);
        } else if (!(_isLive(business, product))) {
            _evaluateGroup(business, product, false);
        } else {
            revert("Group is still live!");
        }
        return true;
    }

    function endGroup(
        string memory business,
        uint256 product
    )
        public
        onlyOwner
        nonReentrant
        returns (bool)
    {
        if (_isEvaluated(business, product)) {
            if (_isFull(business, product)) {
                _endGroup(business, product, true);
            } else {
                _endGroup(business, product, false);
            }
        } else {
            revert("Group is still live!");
        }
        return true;
    }

    function _startGroup(
        address account,
        string memory business,
        uint256 product,
        uint256 memberGoal
    )
        internal
    {
        Group storage group = groups[business][product];
        Rule storage rule = rules[business][product];
        group.startTime = now;
        group.numMembers = 1;
        group.memberGoal = memberGoal;
        group.members.push(account);
        uint256 discountedPrice = _discountedPrice(business, product);
        _coin.escrow(account, discountedPrice);

        emit GroupStarted(
            business,
            product,
            group.numMembers,
            memberGoal,
            group.startTime,
            rule.joinTime
        );
    }

    function _joinGroup(
        address account,
        string memory business,
        uint256 product
    )
        internal
    {
        Group storage group = groups[business][product];
        group.members.push(account);
        group.numMembers++;
        uint256 discountedPrice = _discountedPrice(business, product);
        _coin.escrow(account, discountedPrice);

        emit GroupJoined(
            business,
            product,
            group.members.length,
            group.memberGoal
        );
    }

    function _evaluateGroup(
        string memory business,
        uint256 product,
        bool success
    )
        internal
    {
        Group storage group = groups[business][product];
        address merchant = _owners[business];
        uint256 discountedPrice = _discountedPrice(business, product);
        for (uint256 i = 0; i < group.members.length; i++) {
            address buyer = group.members[i];
            if (success) {
                _coin.unescrow(buyer, merchant, discountedPrice);
            } else {
                _coin.unescrow(buyer, buyer, discountedPrice);
            }
        }
        group.evaluated = true;
        emit GroupEvaluated(business, product);
    }

    function _endGroup(
        string memory business,
        uint256 product,
        bool success
    )
        internal
    {
        Group storage group = groups[business][product];
        if (success) {
            for (uint256 i = 0; i < group.memberGoal; i++) {
                address buyer = group.members[i];
                bytes memory encoded = abi.encode(buyer, business, product);
                bytes32 hashed = keccak256(encoded);
                uint256 tokenId = uint256(hashed);
                _discount.controllerMint(buyer, tokenId);
            }
        }
        emit GroupEnded(
            business,
            product,
            group.members.length,
            group.memberGoal,
            success
        );
        group.evaluated = false;
        group.startTime = 0;
        group.numMembers = 0;
        group.memberGoal = 0;
        group.members.length = 0;
        emit GroupReset(business, product);
    }

    function _discountedPrice(
        string memory business,
        uint256 product
    )
        internal
        view
        returns (uint256)
    {
        Rule storage rule = rules[business][product];
        Group storage group = groups[business][product];
        return (rule.price - (rule.discount * group.memberGoal));
    }

    function _isLive(
        string memory business,
        uint256 product
    )
        internal
        view
        returns (bool)
    {
        Rule storage rule = rules[business][product];
        Group storage group = groups[business][product];
        return ((now - group.startTime) <= rule.joinTime);
    }

    function _isFull(
        string memory business,
        uint256 product
    )
        internal
        view
        returns (bool)
    {
        Group storage group = groups[business][product];
        return (group.members.length == group.memberGoal);
    }

    function _isEvaluated(
        string memory business,
        uint256 product
    )
        internal
        view
        returns (bool)
    {
        return groups[business][product].evaluated;
    }

    function _sufficientFunds(
        address account,
        string memory business,
        uint256 product,
        uint256 memberGoal
    )
        internal
        view
    {
        Rule storage rule = rules[business][product];
        uint256 discountedPrice = (rule.price - (rule.discount * memberGoal));
        require(_coin.balanceOf(account) >= discountedPrice, "Insufficient funds!");
    }

    function _notMember(
        address account,
        string memory business,
        uint256 product
    )
        internal
        view
        returns (bool)
    {
        Group storage group = groups[business][product];
        bool exists = false;
        for (uint256 i = 0; i < group.members.length; i++) {
            if (exists)
                break;
            exists = (account == group.members[i]);
        }
        require(!(exists), "Already in group!");
    }
}
