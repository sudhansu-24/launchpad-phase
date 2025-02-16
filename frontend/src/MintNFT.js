import React, { useState } from "react";
import { getEthereumContract } from "./web3";

function MintNFT() {
    const [tokenURI, setTokenURI] = useState("");
    const [status, setStatus] = useState("");

    const mintNFT = async () => {
        try {
            const contract = await getEthereumContract();
            const transaction = await contract.mintNFT(tokenURI);
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
            <input type="text" placeholder="Enter IPFS URL" onChange={(e) => setTokenURI(e.target.value)} />
            <button onClick={mintNFT}>Mint NFT</button>
            <p>{status}</p>
        </div>
    );
}

export default MintNFT;
