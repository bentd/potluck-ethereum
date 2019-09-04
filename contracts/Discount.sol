pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Full.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Burnable.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Mintable.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "./Base.sol";

contract Discount is ERC721, ERC721Full, ERC721Burnable, ERC721Mintable, Base {

    event MintDiscount(
        address indexed to,
        uint256 indexed tokenId
    );

    constructor() public ERC721Full("Potluck Discount Token", "POTD") {
    }

    function approve(address, uint256) public {
        revert("Approvals not allowed!");
    }

    function setApprovalForAll(address, bool) public {
        revert("Approvals not allowed!");
    }

    function transferFrom(address, address, uint256) public {
        revert("Transfers not allowed!");
    }

    function safeTransferFrom(address, address, uint256) public {
        revert("Transfers not allowed!");
    }

    function safeTransferFrom(address, address, uint256, bytes memory) public {
        revert("Transfers not allowed!");
    }

    function controllerMint(address account, uint256 tokenId)
       public
       onlyMinter
       nonReentrant
       addressIsNotContract(account)
       returns (bool)
    {
       _mint(account, tokenId);
       emit MintDiscount(account, tokenId);
       return true;
    }

}
