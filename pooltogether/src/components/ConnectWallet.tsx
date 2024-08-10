import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { ethers } from 'ethers';

declare global {
    interface Window {
        ethereum: any;
    }
}

const ConnectWallet: React.FC = () => {
    const [account, setAccount] = useState<string | null>(null);
    const [signer, setSigner] = useState<ethers.Signer | null>(null);
    const [isConnecting, setIsConnecting] = useState<boolean>(false);

    useEffect(() => {
        if (window.ethereum) {
            const handleAccountsChanged = (accounts: string[]) => {
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                } else {
                    setAccount(null);
                    setSigner(null);
                }
            };

            window.ethereum.on('accountsChanged', handleAccountsChanged);

            return () => {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            };
        } else {
            console.error("No Ethereum provider found");
        }
    }, []);

    const connectWallet = async () => {
        if (window.ethereum && !isConnecting) {
            setIsConnecting(true);
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const accounts = await provider.send("eth_requestAccounts", []);
                if (accounts.length > 0) {
                    const signer = await provider.getSigner();
                    const account = await signer.getAddress();
                    setAccount(account);
                    setSigner(signer);
                }
            } catch (error) {
                if (error instanceof Error) {
                    alert("Wallet connection request is already in process. Please check your wallet.");
                } else {
                    console.error("Error connecting to wallet:", error);
                }
            } finally {
                setIsConnecting(false);
            }
        } else if (!window.ethereum) {
            console.error("No Ethereum provider found");
            alert("MetaMask not found. Please install MetaMask to use this feature.");
        }
    };

    const disconnectWallet = () => {
        setAccount(null);
        setSigner(null);
        if (window.ethereum) {
            window.ethereum.request({ method: 'eth_accounts' });
        }
    };

    return (
        <div>
            {account ? (
                <div>
                    <Button onClick={disconnectWallet}>Disconnect Wallet</Button>
                    <p>Connected: {account}</p>
                </div>
            ) : (
                <Button onClick={connectWallet} disabled={isConnecting}>
                    {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </Button>
            )}
        </div>
    );
};

export default ConnectWallet;
