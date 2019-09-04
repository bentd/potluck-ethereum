pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";
import "./Base.sol";

contract Coin is ERC20, ERC20Detailed, Base {

    mapping (address => uint256) private _escrow;

    event EscrowCoin(
        address indexed from,
        uint256 value
    );
    event UnescrowCoin(
        address indexed from,
        address indexed to,
        uint256 value
    );

    constructor()
        public
        ERC20Detailed("Potluck Coin", "POTC", 2)
    {
    }

    function approve(address, uint256)
        public
        returns (bool)
    {
        revert("Allowances not allowed!");
    }

    function increaseAllowance(address, uint256)
        public
        returns (bool)
    {
        revert("Allowances not allowed!");
    }

    function decreaseAllowance(address, uint256)
        public
        returns (bool)
    {
        revert("Allowances not allowed!");
    }

    function transfer(address, uint256)
        public
        returns (bool)
    {
        revert("Transfers not allowed!");
    }

    function transferFrom(address, address, uint256)
        public
        returns (bool)
    {
        revert("Transfers not allowed!");
    }

    function mint(address account, uint256 amount)
        public
        onlyMinter
        nonReentrant
        addressIsNotContract(account)
        returns (bool)
    {
        _mint(account, amount);
        return true;
    }

    function burn(address account, uint256 amount)
        public
        onlyMinter
        nonReentrant
        addressIsNotContract(account)
        returns (bool)
    {
        _burn(account, amount);
        return true;
    }

    function escrow(address account, uint256 amount)
        public
        onlyMinter
        nonReentrant
        addressIsNotContract(account)
        returns (bool)
    {
        _burn(account, amount);
        _escrow[account] = _escrow[account].add(amount);
        emit EscrowCoin(account, amount);
        return true;
    }

    function unescrow(address account, address recipient, uint256 amount)
        public
        onlyMinter
        nonReentrant
        addressIsNotContract(account)
        addressIsNotContract(recipient)
        returns (bool)
    {
        _escrow[account] = _escrow[account].sub(amount);
        _mint(recipient, amount);
        emit UnescrowCoin(account, recipient, amount);
        return true;
    }

    function escrowOf(address account)
        public
        view
        addressIsNotContract(account)
        returns (uint256)
    {
        return _escrow[account];
    }
}
