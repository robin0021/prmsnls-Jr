import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "../components/ui/button";
import { ethers } from 'ethers';
import poolabi from '../../artifacts/contracts/pool.sol/pool.json';
import { usePoolContext } from '@/context/PoolContext';

const contractAddress = '0x0121Bc9b7E7a89197434f520Fa2df0501D1046Cd';
const rpcUrl = 'https://polygon-mainnet.g.alchemy.com/v2/SyOFb3S3_TNhX25e1YzZklZPdVzQO-VO'; // Replace with your RPC URL

// Function to deposit funds
async function depositFunds(amount: string, signer: ethers.Signer): Promise<ethers.ContractTransaction> {
    try {
        const contract = new ethers.Contract(contractAddress, poolabi.abi, signer);
        const amountInWei = ethers.utils.parseEther(amount);

        const tx = await contract.deposit({ value: amountInWei });

        console.log('Transaction sent:', tx.hash);

        await tx.wait();

        console.log('Deposit confirmed');
        return tx;
    } catch (error) {
        console.error('Error depositing funds:', error);
        throw error;
    }
}

export function PoolPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [balance, setBalance] = useState<number>(0);
    const [provider, setProvider] = useState<ethers.providers.JsonRpcProvider | null>(null);
    const [signer, setSigner] = useState<ethers.Signer | null>(null);
    const [account, setAccount] = useState<string | null>(null);
    const { addBid, loadBids } = usePoolContext(); // Make sure addBid is available

    const initEthers = async () => {
        if (window.ethereum) {
            try {
                const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
                const accounts = await web3Provider.send("eth_accounts", []);
                if (accounts.length === 0) {
                    console.error("No accounts found. Please connect your wallet.");
                    return;
                }

                const newProvider = new ethers.providers.JsonRpcProvider(rpcUrl);
                setProvider(newProvider);

                const newSigner = await web3Provider.getSigner();
                setSigner(newSigner);
                setAccount(accounts[0]);

                console.log("Provider initialized:", newProvider);
                console.log("Signer initialized:", newSigner);
                console.log("Account initialized:", accounts[0]);

                loadBids(web3Provider); // Ensure this depends on signer being available
                fetchTotalAmount(newSigner); // Fetch total amount after signer is set
            } catch (error) {
                console.error("Error initializing Ethers.js:", error);
            }
        } else {
            console.error("No Ethereum provider found. Please install MetaMask.");
        }
    };

    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', function (accounts: any) {
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                    initEthers(); // Re-initialize if the account changes
                } else {
                    console.error("No accounts found. Please connect your wallet.");
                }
            });
        }
    }, []);

    const fetchTotalAmount = async (signer: ethers.Signer) => {
        try {
            setIsLoading(true);
            const contract = new ethers.Contract(contractAddress, poolabi.abi, signer);
            const total = await contract.getTotal();
            setBalance(Number(total));
        } catch (error) {
            console.error('Error fetching total amount:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDepositClick = async () => {
        if (!signer || !provider || !account) {
            console.error("Signer, provider, or account not available. Please connect your wallet.");
            console.log('Signer:', signer);
            console.log('Provider:', provider);
            console.log('Account:', account);
            return;
        }

        setIsLoading(true);
        try {
            const tx = await depositFunds("0.0001", signer);

            if (provider && account && signer) {
                const balanceInWei = await provider.getBalance(account);
                const balanceInMatic = ethers.utils.formatEther(balanceInWei);
                setBalance(parseFloat(balanceInMatic));
                fetchTotalAmount(signer);

                // Add the bid with transaction hash to the context
                addBid({
                    user: account,
                    amount: "0.0001",
                    transactionHash: tx.hash,
                    timestamp: new Date().toLocaleString()
                });

                console.log("Deposit successful");
            }

        } catch (error) {
            console.error("Error depositing funds:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex w-full flex-col bg-muted/40">
            <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
                    <Card x-chunk="dashboard-05-chunk-1">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-4xl font-medium">
                                POLYGON
                            </CardDescription>
                            <CardTitle className="text-4xl text-black font-semibold">
                                {`$${(balance * 0.1).toFixed(2)}`}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xs text-muted-foreground">
                                {typeof balance === 'number' ? balance.toFixed(2) : 'N/A'} MATIC
                            </div>
                        </CardContent>
                    </Card>
                    <Card x-chunk="dashboard-05-chunk-2" className="h-full">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-4xl font-medium text-center">
                                Coming Soon....
                            </CardDescription>
                        </CardHeader>
                    </Card>
                    <div className="mt-4">
                        <Button
                            onClick={handleDepositClick}
                            variant="default"
                            size="default"
                            disabled={isLoading}
                        >
                            {isLoading ? "Depositing..." : "Deposit to Win"}
                        </Button>
                    </div>
                </main>
            </div>
        </div>
    );
}
