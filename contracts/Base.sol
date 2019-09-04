pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "openzeppelin-solidity/contracts/access/roles/MinterRole.sol";
import "openzeppelin-solidity/contracts/utils/Address.sol";
import "openzeppelin-solidity/contracts/utils/ReentrancyGuard.sol";

contract Base is Ownable, Pausable, MinterRole, ReentrancyGuard {

    using Address for address;

    modifier addressIsNotContract(address account) {
        require(!account.isContract(), "Account is contract!");
        _;
    }

    function destroy() public onlyOwner {
        address payable account = address(uint160(owner()));
        selfdestruct(account);
    }

}
