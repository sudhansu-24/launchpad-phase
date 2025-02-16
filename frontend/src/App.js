import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import MintNFT from "./MintNFT";
import { getEthereumContract, getListedNFTs, buyNFT, delistNFT, listNFT, getTransactionHistory } from "./web3";
import "./App.css";

function App() {
    const [price, setPrice] = useState("");
    const [account, setAccount] = useState("");
    const [tokenId, setTokenId] = useState("");
    const [nftData, setNftData] = useState(null);
    const [listedNFTs, setListedNFTs] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [ipfsUrl, setIpfsUrl] = useState("");

    // Connect MetaMask
    const connectWallet = async () => {
        if (!window.ethereum) return alert("Please install MetaMask.");
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);
    };

    // Mint NFT
    const mintNFT = async () => {
        if (!ipfsUrl) return alert("Please enter an IPFS URL.");
        try {
            const contract = await getEthereumContract();
            const tx = await contract.mintNFT(ipfsUrl);
            await tx.wait();
            alert("NFT Minted Successfully!");
        } catch (error) {
            console.error("Minting error:", error);
            alert("Failed to mint NFT.");
        }
    };

    // Fetch NFT Metadata
    const fetchNFT = async () => {
        if (!tokenId) return alert("Please enter a Token ID.");
        try {
            const contract = await getEthereumContract();
            const metadataURI = await contract.tokenURI(tokenId);
            const ipfsGateway = "https://ipfs.io/ipfs/";
            const metadataURL = metadataURI.replace("ipfs://", ipfsGateway);
            const response = await fetch(metadataURL);
            const metadata = await response.json();
            metadata.image = metadata.image.replace("ipfs://", ipfsGateway);
            setNftData(metadata);
        } catch (error) {
            console.error("Error fetching NFT:", error);
            alert("NFT not found or error fetching metadata.");
        }
    };

    // List NFT
    const handleListNFT = async () => {
        if (!tokenId || !price) return alert("Enter Token ID and Price.");
        try {
            await listNFT(tokenId, price);
            alert(`NFT ${tokenId} listed for ${price} ETH!`);
            fetchListedNFTs();
            fetchTransactionHistory(); // Refresh transactions
        } catch (error) {
            console.error("Listing error:", error);
            alert("Failed to list NFT.");
        }
    };

    // Delist NFT
    const handleDelistNFT = async (tokenId) => {
        try {
            await delistNFT(tokenId);
            alert(`NFT ${tokenId} delisted!`);
            fetchListedNFTs();
            fetchTransactionHistory(); // Refresh transactions
        } catch (error) {
            console.error("Delisting error:", error);
            alert("Failed to delist NFT.");
        }
    };

    // Fetch Listed NFTs
    const fetchListedNFTs = async () => {
        try {
            const nfts = await getListedNFTs();
            setListedNFTs(nfts);
        } catch (error) {
            console.error("Error fetching listed NFTs:", error);
        }
    };

    // Fetch Transaction History
    const fetchTransactionHistory = async () => {
        try {
            const history = await getTransactionHistory();
            setTransactions(history.reverse());  // ✅ Reverse so newest transactions show first
        } catch (error) {
            console.error("Error fetching transaction history:", error);
        }
    };




    const handleBuyNFT = async (tokenId, price) => {
        try {
            await buyNFT(tokenId, price);
            alert(`NFT ${tokenId} purchased successfully!`);

            fetchListedNFTs();  // ✅ Remove the bought NFT from listings
            fetchTransactionHistory();  // ✅ Update the transaction history
        } catch (error) {
            console.error("Buying error:", error);
            alert("Failed to buy NFT.");
        }
    };


    // Fetch listed NFTs and transactions on page load
    useEffect(() => {
        fetchListedNFTs();
        fetchTransactionHistory();
    }, []);

    return (
        <div className="app-container">
            <header>
                <h1>LaunchPad NFT Marketplace</h1>
                {account ? (
                    <p>Connected: {account}</p>
                ) : (
                    <button className="connect-btn" onClick={connectWallet}>Connect MetaMask</button>
                )}
            </header>

            <main>
                <section className="nft-mint">
                    <h2>Mint NFT</h2>
                    <input
                        type="text"
                        value={ipfsUrl}
                        onChange={(e) => setIpfsUrl(e.target.value)}
                        placeholder="Enter IPFS URL"
                    />
                    <button onClick={mintNFT}>Mint NFT</button>
                </section>

                <section className="nft-fetch">
                    <h2>Fetch NFT</h2>
                    <input type="number" value={tokenId} onChange={(e) => setTokenId(e.target.value)} placeholder="Enter Token ID" />
                    <button onClick={fetchNFT}>Fetch NFT</button>
                </section>

                {nftData && (
                    <section className="nft-details">
                        <h2>{nftData.name}</h2>
                        <p>{nftData.description}</p>
                        <img src={nftData.image} alt={`NFT ${nftData.name}`} />
                        {nftData.price && (
                            <button onClick={() => handleBuyNFT(tokenId, nftData.price)}>Buy for {nftData.price} ETH</button>
                        )}
                    </section>
                )}

                <section className="nft-listing">
                    <h2>List NFT for Sale</h2>
                    <input type="number" value={tokenId} onChange={(e) => setTokenId(e.target.value)} placeholder="Enter Token ID" />
                    <input type="text" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Enter Price in ETH" />
                    <button onClick={handleListNFT}>List NFT</button>

                    <div className="nft-grid">
                        {listedNFTs.map((nft) => (
                            <div key={nft.tokenId} className="nft-card">
                                <p><strong>Token ID:</strong> {nft.tokenId}</p>
                                <p><strong>Price:</strong> {nft.price} ETH</p>

                                {/* ✅ Add Buy NFT Button */}
                                <button onClick={() => handleBuyNFT(nft.tokenId, nft.price)}>Buy NFT</button>

                                {/* ✅ Delist NFT Button */}
                                <button onClick={() => handleDelistNFT(nft.tokenId)}>Delist NFT</button>
                            </div>
                        ))}
                    </div>
                </section>


                {/* ✅ Transaction History Section */}
                <section className="transaction-history">
                    <h2>Transaction History</h2>
                    {transactions.length === 0 ? (
                        <p>No transactions yet.</p>
                    ) : (
                        <ul>
                            {transactions.map((tx, index) => (
                                <li key={index} className={`tx-${tx.type.toLowerCase()}`}>
                                    <strong>{tx.type}</strong> - Token ID: {tx.tokenId} | Price: {tx.price || "N/A"} ETH | From: {tx.from}
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </main>
        </div>
    );
}

export default App;
