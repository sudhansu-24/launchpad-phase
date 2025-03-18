const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LaunchPadNFT", function () {
  let LaunchPadNFT;
  let launchPadNFT;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    LaunchPadNFT = await ethers.getContractFactory("LaunchPadNFT");
    launchPadNFT = await LaunchPadNFT.deploy();
    await launchPadNFT.waitForDeployment();
  });

  describe("NFT Minting", function () {
    it("Should mint NFT with correct rarity", async function () {
      const rarity = 2; // Rare
      const tokenURI = "ipfs://QmTest";
      
      await launchPadNFT.mintNFT(addr1.address, tokenURI, rarity);
      expect(await launchPadNFT.ownerOf(1)).to.equal(addr1.address);
      expect(await launchPadNFT.tokenRarity(1)).to.equal(rarity);
    });

    it("Should fail minting with invalid rarity", async function () {
      const invalidRarity = 5;
      const tokenURI = "ipfs://QmTest";
      
      await expect(
        launchPadNFT.mintNFT(addr1.address, tokenURI, invalidRarity)
      ).to.be.revertedWith("Invalid rarity level");
    });
  });

  describe("Staking", function () {
    beforeEach(async function () {
      // Mint NFT for testing
      await launchPadNFT.mintNFT(addr1.address, "ipfs://QmTest", 2);
    });

    it("Should stake NFT correctly", async function () {
      await launchPadNFT.connect(addr1).stake(1);
      const stakeInfo = await launchPadNFT.getStakeInfo(1);
      expect(stakeInfo.isStaked).to.be.true;
      expect(stakeInfo.stakedBy).to.equal(addr1.address);
    });

    it("Should not allow staking of already staked NFT", async function () {
      await launchPadNFT.connect(addr1).stake(1);
      await expect(
        launchPadNFT.connect(addr1).stake(1)
      ).to.be.revertedWith("NFT is already staked");
    });

    it("Should calculate rewards correctly", async function () {
      await launchPadNFT.connect(addr1).stake(1);
      
      // Simulate time passing (1 day)
      await ethers.provider.send("evm_increaseTime", [86400]);
      await ethers.provider.send("evm_mine");

      const rewards = await launchPadNFT.calculateRewards(1);
      const expectedRewards = await launchPadNFT.rewardRates(2); // Rare NFT rate
      expect(rewards).to.equal(expectedRewards);
    });

    it("Should claim rewards correctly", async function () {
      await launchPadNFT.connect(addr1).stake(1);
      
      // Simulate time passing (1 day)
      await ethers.provider.send("evm_increaseTime", [86400]);
      await ethers.provider.send("evm_mine");

      const beforeBalance = await launchPadNFT.rewardBalance(addr1.address);
      await launchPadNFT.connect(addr1).claimRewards(1);
      const afterBalance = await launchPadNFT.rewardBalance(addr1.address);
      
      expect(afterBalance).to.be.gt(beforeBalance);
    });

    it("Should unstake NFT correctly", async function () {
      await launchPadNFT.connect(addr1).stake(1);
      await launchPadNFT.connect(addr1).unstake(1);
      
      const stakeInfo = await launchPadNFT.getStakeInfo(1);
      expect(stakeInfo.isStaked).to.be.false;
      expect(await launchPadNFT.ownerOf(1)).to.equal(addr1.address);
    });
  });
}); 