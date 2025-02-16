// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LaunchPadNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;
    mapping(uint256 => uint256) public nftPrices;

    event NFTListed(address indexed owner, uint256 indexed tokenId, uint256 price);
    event NFTPurchased(address indexed buyer, uint256 indexed tokenId, uint256 price);
    event NFTDelisted(address indexed owner, uint256 indexed tokenId);

    constructor() ERC721("LaunchPadNFT", "LPNFT") Ownable(msg.sender) {
        _tokenIdCounter = 0;
    }

    function mintNFT(string memory tokenURI) public onlyOwner returns (uint256) {
        uint256 newTokenId = _tokenIdCounter;
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        _tokenIdCounter++;
        return newTokenId;
    }

    function listNFT(uint256 tokenId, uint256 price) public {
        require(ownerOf(tokenId) == msg.sender, "You are not the owner");
        require(price > 0, "Price must be greater than zero");

        nftPrices[tokenId] = price;
        emit NFTListed(msg.sender, tokenId, price);
    }

    function delistNFT(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "You are not the owner");
        require(nftPrices[tokenId] > 0, "NFT is not listed for sale");

        delete nftPrices[tokenId];
        emit NFTDelisted(msg.sender, tokenId);
    }

    function buyNFT(uint256 tokenId) public payable {
        uint256 price = nftPrices[tokenId];
        require(price > 0, "NFT not for sale");
        require(msg.value == price, "Incorrect price");

        address seller = ownerOf(tokenId);
        _transfer(seller, msg.sender, tokenId);
        payable(seller).transfer(msg.value);

        delete nftPrices[tokenId];
        emit NFTPurchased(msg.sender, tokenId, price);
    }

    // ✅ Function to get all listed NFTs
    function getAllListedNFTs() public view returns (uint256[] memory, uint256[] memory) {
        uint256 totalTokens = _tokenIdCounter;
        uint256 listedCount = 0;

        for (uint256 i = 0; i < totalTokens; i++) {
            if (nftPrices[i] > 0) {
                listedCount++;
            }
        }

        uint256[] memory listedTokens = new uint256[](listedCount);
        uint256[] memory prices = new uint256[](listedCount);
        uint256 index = 0;

        for (uint256 i = 0; i < totalTokens; i++) {
            if (nftPrices[i] > 0) {
                listedTokens[index] = i;
                prices[index] = nftPrices[i];
                index++;
            }
        }

        return (listedTokens, prices);
    }
}
