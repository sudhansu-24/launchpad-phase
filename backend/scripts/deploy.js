const hre = require("hardhat");

async function main() {
    console.log("Deploying LaunchPadNFT contract...");

    // Deploy LaunchPadNFT
    const LaunchPadNFT = await hre.ethers.getContractFactory("LaunchPadNFT");
    const launchPadNFT = await LaunchPadNFT.deploy();
    await launchPadNFT.waitForDeployment();

    const address = await launchPadNFT.getAddress();
    console.log("LaunchPadNFT deployed to:", address);

    // Verify contract on EduChain Explorer (if supported)
    try {
        await hre.run("verify:verify", {
            address: address,
            constructorArguments: [],
        });
        console.log("Contract verified successfully");
    } catch (error) {
        console.log("Contract verification failed:", error.message);
    }

    // Test initial setup
    console.log("\nTesting initial setup...");
    
    // Get reward rates
    const commonRate = await launchPadNFT.rewardRates(1);
    const rareRate = await launchPadNFT.rewardRates(2);
    const epicRate = await launchPadNFT.rewardRates(3);
    const legendaryRate = await launchPadNFT.rewardRates(4);

    console.log("\nReward rates:");
    console.log("Common:", commonRate.toString(), "tokens/day");
    console.log("Rare:", rareRate.toString(), "tokens/day");
    console.log("Epic:", epicRate.toString(), "tokens/day");
    console.log("Legendary:", legendaryRate.toString(), "tokens/day");
}

// Run the script and catch errors
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
