import { ethers } from "ethers";   

const CONTRACT_ADDRESS = "0xc48Fd5Dd24A12053c50d894f5df598eF0fa713d1";

const ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "ERC721IncorrectOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "ERC721InsufficientApproval",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "approver",
        "type": "address"
      }
    ],
    "name": "ERC721InvalidApprover",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      }
    ],
    "name": "ERC721InvalidOperator",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "ERC721InvalidOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      }
    ],
    "name": "ERC721InvalidReceiver",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "ERC721InvalidSender",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "ERC721NonexistentToken",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "OwnableInvalidOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "OwnableUnauthorizedAccount",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "approved",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "approved",
        "type": "bool"
      }
    ],
    "name": "ApprovalForAll",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_fromTokenId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_toTokenId",
        "type": "uint256"
      }
    ],
    "name": "BatchMetadataUpdate",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_tokenId",
        "type": "uint256"
      }
    ],
    "name": "MetadataUpdate",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "NFTDelisted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      }
    ],
    "name": "NFTListed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "buyer",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      }
    ],
    "name": "NFTPurchased",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "buyNFT",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "delistNFT",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllListedNFTs",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "getApproved",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      }
    ],
    "name": "isApprovedForAll",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      }
    ],
    "name": "listNFT",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "tokenURI",
        "type": "string"
      }
    ],
    "name": "mintNFT",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "nftPrices",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "ownerOf",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "safeTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "safeTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "approved",
        "type": "bool"
      }
    ],
    "name": "setApprovalForAll",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes4",
        "name": "interfaceId",
        "type": "bytes4"
      }
    ],
    "name": "supportsInterface",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "tokenURI",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// IPFS Gateway URLs in order of preference
const IPFS_GATEWAYS = [
    'https://ipfs.io/ipfs/',
    'https://gateway.pinata.cloud/ipfs/',
    'https://cloudflare-ipfs.com/ipfs/',
    'https://gateway.ipfs.io/ipfs/'
];

// Helper function to try different IPFS gateways
const fetchWithFallback = async (ipfsUrl) => {
    // Remove 'ipfs://' prefix if present
    const cid = ipfsUrl.replace('ipfs://', '');
    
    // Try each gateway in sequence
    for (const gateway of IPFS_GATEWAYS) {
        try {
            const response = await fetch(gateway + cid);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const text = await response.text(); // First get the text
            try {
                return JSON.parse(text); // Then try to parse it
            } catch (e) {
                console.warn(`Invalid JSON from ${gateway}:`, text.substring(0, 100));
                throw e;
            }
        } catch (error) {
            console.warn(`Failed to fetch from ${gateway}:`, error);
            continue;
        }
    }
    throw new Error('Failed to fetch from all IPFS gateways');
};

export const getEthereumContract = async () => {
  if (!window.ethereum) throw new Error("Please install MetaMask");
  
  // Check if already connected
  const accounts = await window.ethereum.request({ method: "eth_accounts" });
  if (accounts.length === 0) {
    throw new Error("Please connect your wallet");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
};

export const getNFTMetadata = async (tokenId) => {
    try {
        const contract = await getEthereumContract();
        if (!contract) return null;

        const tokenURI = await contract.tokenURI(tokenId);
        const metadata = await fetchWithFallback(tokenURI);
        
        // Also convert the image URL if it's IPFS
        if (metadata.image && metadata.image.startsWith('ipfs://')) {
            metadata.image = metadata.image.replace('ipfs://', IPFS_GATEWAYS[0]);
        }
        
        return metadata;
    } catch (error) {
        console.error("Error fetching NFT metadata:", error);
        return null;
    }
};

export const getListedNFTs = async () => {
    try {
        const contract = await getEthereumContract();
        const [listedTokens, prices] = await contract.getAllListedNFTs();

        // Fetch metadata for each listed NFT
        const nftsWithMetadata = await Promise.all(
            listedTokens.map(async (tokenId) => {
                try {
                    const metadata = await getNFTMetadata(tokenId);
                    if (!metadata) {
                        throw new Error('Failed to fetch metadata');
                    }

                    // Get the owner of the NFT
                    const owner = await contract.ownerOf(tokenId);

                    return {
                        tokenId: tokenId.toString(),
                        price: ethers.formatEther(prices[listedTokens.indexOf(tokenId)]),
                        image: metadata.image,
                        name: metadata.name,
                        description: metadata.description,
                        owner: owner
                    };
                } catch (error) {
                    console.error(`Error fetching metadata for token ${tokenId}:`, error);
                    return {
                        tokenId: tokenId.toString(),
                        price: ethers.formatEther(prices[listedTokens.indexOf(tokenId)]),
                        image: 'placeholder-image.png',
                        name: `NFT #${tokenId}`,
                        description: 'Metadata unavailable',
                        owner: null
                    };
                }
            })
        );

        return nftsWithMetadata;
    } catch (error) {
        console.error("Error in getListedNFTs:", error);
        return [];
    }
};

export const buyNFT = async (tokenId, price) => {
    if (!window.ethereum) throw new Error("MetaMask not found!");

    try {
        const contract = await getEthereumContract();
        const provider = new ethers.BrowserProvider(window.ethereum);
        // eslint-disable-next-line no-unused-vars
        const signer = await provider.getSigner();

        // First verify if the NFT is actually for sale
        try {
            const [listedTokens, prices] = await contract.getAllListedNFTs();
            const tokenIndex = listedTokens.findIndex(token => token.toString() === tokenId.toString());
            
            if (tokenIndex === -1) {
                throw new Error("NFT is not currently listed for sale");
            }

            // Verify price matches
            const listedPrice = ethers.formatEther(prices[tokenIndex]);
            if (listedPrice !== price.toString()) {
                throw new Error(`Price mismatch. Listed price is ${listedPrice} ETH`);
            }
        } catch (error) {
            console.error("Error checking NFT status:", error);
            if (error.message.includes("NFT is not currently listed")) {
                throw error;
            }
            throw new Error("Failed to verify NFT listing status");
        }

        // Convert price to wei for the transaction
        const priceInWei = ethers.parseEther(price.toString());

        // Attempt to buy
        console.log(`Buying NFT #${tokenId} for ${price} ETH`);
        const tx = await contract.buyNFT(tokenId, { value: priceInWei });
        console.log('Transaction sent:', tx.hash);
        
        // Wait for confirmation
        const receipt = await tx.wait();
        console.log('Transaction confirmed in block:', receipt.blockNumber);
        
        return tx;
    } catch (error) {
        console.error('Error buying NFT:', error);
        
        // Handle specific error cases
        if (error.message.includes("NFT not for sale")) {
            throw new Error("This NFT is not currently listed for sale");
        } else if (error.message.includes("insufficient funds")) {
            throw new Error("Insufficient funds to complete the purchase");
        } else if (error.message.includes("user rejected")) {
            throw new Error("Transaction was rejected");
        }
        
        throw error;
    }
};

export const delistNFT = async (tokenId) => {
    if (!window.ethereum) throw new Error("MetaMask not found!");

    try {
        const contract = await getEthereumContract();
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const userAddress = await signer.getAddress();

        // First check if the NFT exists and is listed
        try {
            const nftOwner = await contract.ownerOf(tokenId);
            if (nftOwner.toLowerCase() !== userAddress.toLowerCase()) {
                throw new Error("You don't own this NFT");
            }
        } catch (error) {
            if (error.message.includes("nonexistent token")) {
                throw new Error("This NFT does not exist");
            }
            throw error;
        }

        // Attempt to delist
        const tx = await contract.delistNFT(tokenId);
        console.log('Delisting transaction sent:', tx.hash);
        
        // Wait for transaction confirmation
        const receipt = await tx.wait();
        console.log('Delisting confirmed in block:', receipt.blockNumber);
        
        return tx;
    } catch (error) {
        console.error("Delisting error:", error);
        
        // Handle specific error cases
        if (error.message.includes("not listed")) {
            throw new Error("This NFT is not currently listed");
        } else if (error.message.includes("You don't own this NFT")) {
            throw new Error("You can only delist NFTs that you own");
        } else if (error.message.includes("user rejected")) {
            throw new Error("Transaction was rejected");
        }
        
        throw error;
    }
};

export const listNFT = async (tokenId, price) => {
    if (!window.ethereum) throw new Error("MetaMask not found!");

    const contract = await getEthereumContract();
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();

    // First verify ownership
    const owner = await contract.ownerOf(tokenId);
    if (owner.toLowerCase() !== userAddress.toLowerCase()) {
        console.error("Ownership verification failed:", { owner, userAddress });
        throw new Error("You can only list NFTs that you own");
    }

    try {
        // Convert price to wei
        const priceInWei = ethers.parseEther(price.toString());

        // Check if NFT is already listed
        const [listedTokens] = await contract.getAllListedNFTs();
        if (listedTokens.some(t => t.toString() === tokenId.toString())) {
            throw new Error("This NFT is already listed");
        }

        // Attempt to list
        console.log(`Listing NFT #${tokenId} for ${price} ETH`);
        const tx = await contract.listNFT(tokenId, priceInWei);
        console.log('Transaction sent:', tx.hash);
        
        // Wait for confirmation
        const receipt = await tx.wait();
        console.log('Transaction confirmed in block:', receipt.blockNumber);
        
        return tx;
    } catch (error) {
        console.error('Error listing NFT:', error);
        
        // Handle specific error cases
        if (error.message.includes("user rejected")) {
            throw new Error("Transaction was rejected");
        }
        
        throw error; // Propagate the error
    }
};

export const getTransactionHistory = async () => {
  try {
      const contract = await getEthereumContract();
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      const listedEvents = await contract.queryFilter(contract.filters.NFTListed());
      const purchasedEvents = await contract.queryFilter(contract.filters.NFTPurchased());
      const delistedEvents = await contract.queryFilter(contract.filters.NFTDelisted());

      // Get block timestamps
      const getBlockTimestamp = async (blockNumber) => {
          const block = await provider.getBlock(blockNumber);
          return block.timestamp * 1000; // Convert to milliseconds
      };

      // Process events with timestamps
      const processEvents = async (events, type) => {
          return Promise.all(events.map(async (event) => ({
              type,
              tokenId: event.args.tokenId.toString(),
              price: type !== 'Delisted' ? ethers.formatEther(event.args.price) : null,
              from: type === 'Purchased' ? event.args.buyer : event.args.owner,
              timestamp: await getBlockTimestamp(event.blockNumber),
              transactionHash: event.transactionHash
          })));
      };

      // Get all transactions with timestamps
      const [listedTxs, purchasedTxs, delistedTxs] = await Promise.all([
          processEvents(listedEvents, 'Listed'),
          processEvents(purchasedEvents, 'Purchased'),
          processEvents(delistedEvents, 'Delisted')
      ]);

      const transactions = [...listedTxs, ...purchasedTxs, ...delistedTxs];

      // Sort by timestamp (newest first)
      return transactions.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
      console.error("Error in getTransactionHistory:", error);
      return [];
  }
};



export async function mintNFT(tokenURI) {
    try {
        const contract = await getEthereumContract();
        const tx = await contract.mintNFT(tokenURI);
        await tx.wait();
        
        // Get the minted token ID from the event
        const receipt = await tx.wait();
        const event = receipt.logs[0];
        const tokenId = event.args[2]; // Transfer event has tokenId as the third argument
        
        return tokenId.toString();
    } catch (error) {
        console.error("Error minting NFT:", error);
        throw error;
    }
}
