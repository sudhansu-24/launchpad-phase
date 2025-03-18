// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract LaunchPadNFT is ERC721URIStorage, Ownable, ReentrancyGuard {
    uint256 private _tokenIdCounter;
    mapping(uint256 => uint256) public nftPrices;
    mapping(uint256 => bool) public isStaked;
    mapping(uint256 => uint256) public stakingStartTime;
    mapping(uint256 => uint256) public lastRewardClaim;
    mapping(uint256 => uint256) public nftRarity; // 1: Common, 2: Rare, 3: Epic, 4: Legendary
    mapping(uint256 => uint256) public rewardRates;

    event NFTListed(address indexed owner, uint256 indexed tokenId, uint256 price);
    event NFTPurchased(address indexed buyer, uint256 indexed tokenId, uint256 price);
    event NFTDelisted(address indexed owner, uint256 indexed tokenId);
    event NFTStaked(address indexed owner, uint256 indexed tokenId);
    event NFTUnstaked(address indexed owner, uint256 indexed tokenId);
    event RewardClaimed(address indexed owner, uint256 indexed tokenId, uint256 amount);

    constructor() ERC721("LaunchPadNFT", "LPNFT") {
        _tokenIdCounter = 0;
        
        // Initialize reward rates for different rarities
        rewardRates[1] = 10; // Common: 10 tokens per day
        rewardRates[2] = 25; // Rare: 25 tokens per day
        rewardRates[3] = 50; // Epic: 50 tokens per day
        rewardRates[4] = 100; // Legendary: 100 tokens per day
    }

    function mintNFT(string memory tokenURI, uint256 rarity) public onlyOwner returns (uint256) {
        require(rarity >= 1 && rarity <= 4, "Invalid rarity level");
        
        uint256 newTokenId = _tokenIdCounter;
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        nftRarity[newTokenId] = rarity;
        _tokenIdCounter++;
        return newTokenId;
    }

    function listNFT(uint256 tokenId, uint256 price) public {
        require(ownerOf(tokenId) == msg.sender, "You are not the owner");
        require(price > 0, "Price must be greater than zero");
        require(!isStaked[tokenId], "Cannot list staked NFT");

        nftPrices[tokenId] = price;
        emit NFTListed(msg.sender, tokenId, price);
    }

    function delistNFT(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "You are not the owner");
        require(nftPrices[tokenId] > 0, "NFT is not listed for sale");

        delete nftPrices[tokenId];
        emit NFTDelisted(msg.sender, tokenId);
    }

    function buyNFT(uint256 tokenId) public payable nonReentrant {
        uint256 price = nftPrices[tokenId];
        require(price > 0, "NFT not for sale");
        require(msg.value == price, "Incorrect price");
        require(!isStaked[tokenId], "Cannot buy staked NFT");

        address seller = ownerOf(tokenId);
        _transfer(seller, msg.sender, tokenId);
        payable(seller).transfer(msg.value);

        delete nftPrices[tokenId];
        emit NFTPurchased(msg.sender, tokenId, price);
    }

    function stakeNFT(uint256 tokenId) public nonReentrant {
        require(ownerOf(tokenId) == msg.sender, "You are not the owner");
        require(!isStaked[tokenId], "NFT already staked");
        require(nftPrices[tokenId] == 0, "Cannot stake listed NFT");

        isStaked[tokenId] = true;
        stakingStartTime[tokenId] = block.timestamp;
        lastRewardClaim[tokenId] = block.timestamp;
        
        emit NFTStaked(msg.sender, tokenId);
    }

    function unstakeNFT(uint256 tokenId) public nonReentrant {
        require(ownerOf(tokenId) == msg.sender, "You are not the owner");
        require(isStaked[tokenId], "NFT not staked");

        // Claim any pending rewards before unstaking
        uint256 pendingRewards = calculateRewards(tokenId);
        if (pendingRewards > 0) {
            // Here you would transfer the rewards to the user
            // This is a placeholder - implement your reward token transfer logic
            emit RewardClaimed(msg.sender, tokenId, pendingRewards);
        }

        isStaked[tokenId] = false;
        stakingStartTime[tokenId] = 0;
        lastRewardClaim[tokenId] = 0;
        
        emit NFTUnstaked(msg.sender, tokenId);
    }

    function calculateRewards(uint256 tokenId) public view returns (uint256) {
        require(isStaked[tokenId], "NFT not staked");
        
        uint256 lastClaim = lastRewardClaim[tokenId];
        uint256 timeStaked = block.timestamp - lastClaim;
        uint256 rewardRate = rewardRates[nftRarity[tokenId]];
        
        // Calculate rewards based on time staked and rarity
        return (timeStaked * rewardRate) / 86400; // Convert to daily rate
    }

    function claimRewards(uint256 tokenId) public nonReentrant {
        require(ownerOf(tokenId) == msg.sender, "You are not the owner");
        require(isStaked[tokenId], "NFT not staked");
        
        uint256 pendingRewards = calculateRewards(tokenId);
        require(pendingRewards > 0, "No rewards to claim");
        
        // Here you would transfer the rewards to the user
        // This is a placeholder - implement your reward token transfer logic
        lastRewardClaim[tokenId] = block.timestamp;
        
        emit RewardClaimed(msg.sender, tokenId, pendingRewards);
    }

    // Function to get all listed NFTs
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

    // Function to get NFT metadata including staking info
    function getNFTMetadata(uint256 tokenId) public view returns (
        string memory uri,
        uint256 price,
        bool staked,
        uint256 rarity,
        uint256 stakingStart,
        uint256 lastClaim,
        uint256 pendingRewards
    ) {
        require(_exists(tokenId), "NFT does not exist");
        
        return (
            super.tokenURI(tokenId),
            nftPrices[tokenId],
            isStaked[tokenId],
            nftRarity[tokenId],
            stakingStartTime[tokenId],
            lastRewardClaim[tokenId],
            isStaked[tokenId] ? calculateRewards(tokenId) : 0
        );
    }

    // Override transfer functionality to handle staking status
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal virtual override {
        require(!isStaked[tokenId], "Cannot transfer staked NFT");
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
}
