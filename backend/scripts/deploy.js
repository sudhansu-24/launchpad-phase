const { ethers } = require("hardhat");

async function main() {
    console.log("Deploying LaunchPadNFT contract...");

    // Get the contract factory
    const LaunchPadNFT = await ethers.getContractFactory("LaunchPadNFT");

    // Deploy the contract
    const launchPadNFT = await LaunchPadNFT.deploy();

    await launchPadNFT.waitForDeployment();

    console.log(`✅ LaunchPadNFT contract deployed at: ${await launchPadNFT.getAddress()}`);
}

// Run the script and catch errors
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
