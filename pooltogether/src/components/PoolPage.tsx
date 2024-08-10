import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "../components/ui/button";
import { ethers } from 'ethers';
import abi from '../abi.json';

const contractAddress = '0x96A09A090a83198A6E08E2882DEce9C0057779F3';
const rpcUrl = 'https://polygon-mainnet.g.alchemy.com/v2/SyOFb3S3_TNhX25e1YzZklZPdVzQO-VO'; // Replace with your RPC URL

// Function to deposit funds
async function depositFunds(amount: string, signer: ethers.Signer): Promise<void> {
    try {
        const contract = new ethers.Contract(contractAddress, abi, signer);
        const amountInWei = ethers.parseEther(amount);

        const tx = await contract.deposit({ value: amountInWei });

        console.log('Transaction sent:', tx.hash);

        await tx.wait();

        console.log('Deposit confirmed');
    } catch (error) {
        console.error('Error depositing funds:', error);
    }
}

export function PoolPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [balance, setBalance] = useState<number>(0);
    const [provider, setProvider] = useState<ethers.JsonRpcProvider | null>(null);
    const [signer, setSigner] = useState<ethers.Signer | null>(null);
    const [account, setAccount] = useState<string | null>(null);

    const initEthers = async () => {
        if (window.ethereum) {
            try {
                const web3Provider = new ethers.BrowserProvider(window.ethereum);
                const accounts = await web3Provider.send("eth_accounts", []);
                const newProvider = new ethers.JsonRpcProvider(rpcUrl);

                setProvider(newProvider);

                if (accounts.length > 0) {
                    const newSigner = await web3Provider.getSigner();
                    setSigner(newSigner);
                    setAccount(accounts[0]);
                } else {
                    console.error("No accounts found. Please connect your wallet.");
                }
            } catch (error) {
                console.error("Error initializing Ethers.js:", error);
            }
        } else {
            console.error("No Ethereum provider found. Please install MetaMask.");
        }
    };

    useEffect(() => {
        initEthers();
    }, []);

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
            await depositFunds("0.001", signer);

            if (provider && account) {
                const balanceInWei = await provider.getBalance(account);
                const balanceInMatic = ethers.formatEther(balanceInWei);
                setBalance(parseFloat(balanceInMatic));
            }

            console.log("Deposit successful");
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
                            <CardTitle className="text-4xl">
                                {`$${(balance * 0.8).toFixed(2)}`}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xs text-muted-foreground">
                                {balance.toFixed(2)} MATIC
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
