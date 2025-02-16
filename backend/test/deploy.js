const { ethers } = require("hardhat");

async function main() {
    const unlockTime = Math.floor(Date.now() / 1000) + 3600; // Unlocks in 1 hour

    console.log("Deploying Lock contract with unlock time:", unlockTime);

    // Get the contract factory
    const Lock = await ethers.getContractFactory("Lock");

    // Deploy the contract
    const lock = await Lock.deploy(unlockTime, { value: ethers.parseEther("0.01") });

    await lock.waitForDeployment();

    console.log(`✅ Lock contract deployed at: ${await lock.getAddress()}`);
}

// Run the script and catch errors
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
