require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config(); 

module.exports = {
    solidity: "0.8.28",
    networks: {
        educhain: {
            url: "https://rpc.open-campus-codex.gelato.digital",  // EDU Chain Testnet RPC
            accounts: [process.env.WALLET_PRIVATE_KEY],
            chainId: 656476, // Correct EDU Chain Testnet Chain ID
            gasPrice: "auto",
            timeout: 120000, // 120 seconds
            httpHeaders: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            verify: {
                etherscan: {
                    apiUrl: "https://testnet-explorer.educhain.io"
                }
            }
        }
    },
    etherscan: {
        apiKey: {
            sepolia: process.env.ETHERSCAN_API_KEY
        }
    },
    mocha: {
        timeout: 120000
    }
};
