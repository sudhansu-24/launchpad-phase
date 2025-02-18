import React, { useState } from "react";
import { getEthereumContract } from "./web3";

function MintNFT() {
    const [tokenURI, setTokenURI] = useState("");
    const [status, setStatus] = useState("");

    const processIPFSInput = (input) => {
        // Remove any leading/trailing whitespace
        const trimmedInput = input.trim();
        
        // If input already starts with ipfs://, use it as is
        if (trimmedInput.startsWith("ipfs://")) {
            return trimmedInput;
        }
        
        // Otherwise, add the ipfs:// prefix
        return `ipfs://${trimmedInput}`;
    };

    const mintNFT = async () => {
        try {
            const contract = await getEthereumContract();
            const processedURI = processIPFSInput(tokenURI);
            const transaction = await contract.mintNFT(processedURI);
            await transaction.wait();
            setStatus("✅ NFT Minted Successfully!");
        } catch (error) {
            console.error(error);
            setStatus("❌ Failed to mint NFT");
        }
    };

    return (
        <div>
            <h2>Mint NFT</h2>
            <input 
                type="text" 
                placeholder="Enter IPFS CID or full IPFS URL" 
                onChange={(e) => setTokenURI(e.target.value)} 
            />
            <button onClick={mintNFT}>Mint NFT</button>
            <p>{status}</p>
        </div>
    );
}

export default MintNFT;
