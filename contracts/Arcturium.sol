//SPDX-License-Identifier: Unlicense
// Art by @walshe_steve // Copyright © Steve Walshe
// Code by @0xGeeLoko


pragma solidity ^0.8.4;

import "./ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";


contract Arcturium is ERC721A, Ownable, ReentrancyGuard {
    using Strings for string;
    
    uint256 public maxSupply = 10;
    uint256 public maxPublic = 6;
    
    address payable private founderWallet = payable(0xe03064F8fB12B6457A04166e1462889b98323931);
    address payable private artistWallet = payable(0x7fF7549e6594B24c88c4f08BCBb67Aa6fC549175);

    string internal baseTokenUri;

    
    

    
    constructor() ERC721A('Arcturium','Arc') {}


    modifier ableToMint(uint256 numberOfTokens) {
        require(totalSupply() + numberOfTokens <= maxSupply, 'Purchase would exceed Max Token Supply');
        _;
    }

    


    /**
     * tokens
     */
    function setBaseTokenUri(string calldata baseTokenUri_) external onlyOwner {
        baseTokenUri = baseTokenUri_;
    }
    

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), 'Token does not exist!');
        return string(abi.encodePacked(baseTokenUri, Strings.toString(tokenId), '.json'));
    }





    function publicMint(uint256 numberOfTokens) 
    external
    ableToMint(numberOfTokens)
    nonReentrant
    {
        require(numberOfTokens > 0, "Must mint at least one");
        require(numberOfTokens <= maxPublic, 'Exceeded max token purchase');
       
        _safeMint(msg.sender, numberOfTokens);

    }

    /**
     * withdraw
     */

    function withdraw() external onlyOwner nonReentrant
    {
        
        (bool success, ) = owner().call{value: address(this).balance}(""); 
        require(success, "Transfer failed");
    }
    
}