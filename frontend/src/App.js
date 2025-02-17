import React, { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { getEthereumContract, getListedNFTs, buyNFT, delistNFT, listNFT, getTransactionHistory } from "./web3";
import "./App.css";
import ethIcon from './assets/eth-icon.svg';
import launchpadLogo from './assets/launchpad-logo.svg';

function App() {
    const [price, setPrice] = useState("");
    const [account, setAccount] = useState("");
    const [tokenId, setTokenId] = useState("");
    const [nftData, setNftData] = useState(null);
    const [listedNFTs, setListedNFTs] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [ipfsUrl, setIpfsUrl] = useState("");
    const [isConnecting, setIsConnecting] = useState(false);
    const [fetchTokenId, setFetchTokenId] = useState("");
    const [theme, setTheme] = useState('dark');

    // Define these callbacks first
    const fetchListedNFTs = useCallback(async () => {
        try {
            const nfts = await getListedNFTs();
            setListedNFTs(nfts);
        } catch (error) {
            console.error("Error fetching listed NFTs:", error);
        }
    }, []);

    const fetchTransactionHistory = useCallback(async () => {
        try {
            const history = await getTransactionHistory();
            setTransactions(history.reverse());
        } catch (error) {
            console.error("Error fetching transaction history:", error);
        }
    }, []);

    // Then use them in fetchInitialData
    const fetchInitialData = useCallback(async () => {
        try {
            await fetchListedNFTs();
            await fetchTransactionHistory();
        } catch (error) {
            console.error("Error fetching initial data:", error);
        }
    }, [fetchListedNFTs, fetchTransactionHistory]);

    // Connect MetaMask
    const connectWallet = async () => {
        if (!window.ethereum) {
            alert("Please install MetaMask.");
            return;
        }
        
        if (isConnecting) return;

        try {
            setIsConnecting(true);
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            setAccount(accounts[0]);
            await fetchInitialData();
        } catch (error) {
            console.error("Connection error:", error);
            alert("Failed to connect wallet.");
        } finally {
            setIsConnecting(false);
        }
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
        if (!fetchTokenId) {
            alert("Please enter a Token ID");
            return;
        }

        try {
            const contract = await getEthereumContract();
            const metadataURI = await contract.tokenURI(fetchTokenId);
            
            // Convert IPFS URI to HTTP URL if needed
            const url = metadataURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
            
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch metadata');
            
            const metadata = await response.json();
            
            // Convert IPFS image URL if needed
            if (metadata.image && metadata.image.startsWith('ipfs://')) {
                metadata.image = metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/');
            }
            
            setNftData(metadata);
        } catch (error) {
            console.error("Error fetching NFT:", error);
            alert("Failed to fetch NFT. Make sure the Token ID exists.");
            setNftData(null);
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

    const handleBuyNFT = async (tokenId, price) => {
        if (!account) {
            alert("Please connect your wallet first");
            return;
        }

        try {
            const success = await buyNFT(tokenId, price);
            if (success) {
                alert(`Successfully purchased NFT #${tokenId}!`);
                // Refresh the listings and transaction history
                await fetchListedNFTs();
                await fetchTransactionHistory();
            }
        } catch (error) {
            console.error("Error buying NFT:", error);
            alert(error.message || "Failed to buy NFT. Please try again.");
        }
    };

    // Add disconnectWallet function
    const disconnectWallet = () => {
        setAccount("");
    };

    // Update useEffect to only fetch data when connected
    useEffect(() => {
        const checkConnection = async () => {
            if (window.ethereum) {
                try {
                    const accounts = await window.ethereum.request({ method: "eth_accounts" });
                    if (accounts.length > 0) {
                        setAccount(accounts[0]);
                        await fetchInitialData();
                    }
                } catch (error) {
                    console.error("Error checking connection:", error);
                }
            }
        };

        checkConnection();

        // Listen for account changes
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                    fetchInitialData();
                } else {
                    setAccount('');
                }
            });
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', () => {});
            }
        };
    }, [fetchInitialData]);

    // Add theme toggle function
    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    return (
        <div>
            <div className="space-bg">
                <div className="stars"></div>
            </div>
            <header>
                <div className="header-content">
                    <div className="logo">
                        <img src={launchpadLogo} alt="LaunchPad" />
                        <span>LaunchPad</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <button 
                            className="theme-toggle" 
                            onClick={toggleTheme}
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? '☀️' : '🌙'}
                        </button>
                        <button 
                            className="connect-btn"
                            onClick={account ? disconnectWallet : connectWallet}
                            disabled={isConnecting}
                        >
                            {account ? 
                                `${account.slice(0, 6)}...${account.slice(-4)}` : 
                                isConnecting ? 'Connecting...' : 'Connect Wallet'
                            }
                        </button>
                    </div>
                </div>
            </header>

            <div className="app-container">
                <div className="filters">
                    <button className="filter-btn active">All</button>
                    <button className="filter-btn">Art</button>
                    <button className="filter-btn">Collectibles</button>
                    <button className="filter-btn">Games</button>
                </div>

                <section className="mint-section">
                    <h2>Create New NFT</h2>
                    <div className="mint-form">
                        <input
                            type="text"
                            className="mint-input"
                            value={ipfsUrl}
                            onChange={(e) => setIpfsUrl(e.target.value)}
                            placeholder="Enter IPFS URL"
                        />
                        <div className="button-container">
                            <button className="buy-btn" onClick={mintNFT}>Mint NFT</button>
                        </div>
                    </div>
                </section>

                <section className="mint-section">
                    <h2>List Your NFT</h2>
                    <div className="mint-form list-form">
                        <input
                            type="text"
                            className="mint-input"
                            value={tokenId}
                            onChange={(e) => setTokenId(e.target.value)}
                            placeholder="Enter Token ID"
                        />
                        <input
                            type="number"
                            step="0.01"
                            className="mint-input"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="Enter Price in ETH"
                        />
                        <div className="button-container" style={{ gridColumn: "1 / -1" }}>
                            <button className="list-btn" onClick={handleListNFT}>List for Sale</button>
                        </div>
                    </div>
                </section>

                <section className="mint-section">
                    <h2>Fetch NFT Details</h2>
                    <div className="mint-form">
                        <input
                            type="text"
                            className="mint-input"
                            value={fetchTokenId}
                            onChange={(e) => setFetchTokenId(e.target.value)}
                            placeholder="Enter Token ID to fetch"
                        />
                        <div className="button-container">
                            <button className="fetch-btn" onClick={fetchNFT}>Fetch NFT</button>
                        </div>
                    </div>
                    {/* Display fetched NFT details */}
                    {nftData && (
                        <div className="fetched-nft">
                            <h3>NFT #{fetchTokenId}</h3>
                            <div className="nft-details">
                                <img src={nftData.image} alt={nftData.name} />
                                <div className="nft-info">
                                    <h4>{nftData.name}</h4>
                                    <p>{nftData.description}</p>
                                    {nftData.attributes?.map((attr, index) => (
                                        <div key={index} className="nft-attribute">
                                            <span>{attr.trait_type}:</span>
                                            <span>{attr.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                <section className="marketplace">
                    <h2>Featured LaunchPad NFTs</h2>
                    <div className="nft-grid">
                        {listedNFTs.map((nft) => (
                            <div key={nft.tokenId} className="nft-card">
                                <img 
                                    src={nft.image || '/assets/space-placeholder.svg'} 
                                    alt={nft.name}
                                    onError={(e) => {
                                        e.target.src = '/assets/space-placeholder.svg';
                                        e.target.onerror = null;
                                    }}
                                />
                                <div className="nft-info">
                                    <h3 className="nft-name">{nft.name || `Space NFT #${nft.tokenId}`}</h3>
                                    <div className="price-container">
                                        <div className="eth-price">
                                            <img src={ethIcon} alt="ETH" className="eth-icon" />
                                            <span>{nft.price} ETH</span>
                                        </div>
                                        {account && account.toLowerCase() === nft.owner?.toLowerCase() ? (
                                            <button className="delist-btn" onClick={() => handleDelistNFT(nft.tokenId)}>
                                                Delist
                                            </button>
                                        ) : (
                                            <button 
                                                className="buy-btn"
                                                onClick={() => {
                                                    if (!account) {
                                                        alert("Please connect your wallet first");
                                                        return;
                                                    }
                                                    handleBuyNFT(nft.tokenId, nft.price);
                                                }}
                                            >
                                                Buy Now
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="transaction-history">
                    <h2>Recent Activity</h2>
                    {transactions.map((tx, index) => (
                        <div key={index} className="tx-item">
                            <div className="tx-info">
                                <span className="tx-type">{tx.type}</span>
                                <span className="tx-id">Token #{tx.tokenId}</span>
                            </div>
                            <div className="tx-price">
                                {tx.price && `Ξ ${tx.price} ETH`}
                            </div>
                        </div>
                    ))}
                </section>
            </div>
        </div>
    );
}

export default App;
