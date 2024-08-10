import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ethers } from 'ethers';
import abi from '../abi.json'; // Replace with your ABI

const contractAddress = '0xYourContractAddress'; // Replace with your contract address

interface Bid {
    userAddress: string;
    amount: string;
    transactionId: string;
    timestamp: string;
}

export function PoolTable() {
    const [bids, setBids] = useState<Bid[]>([]);
    const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);

    const fetchBids = async () => {
        if (window.ethereum) {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                setProvider(provider);
                const contract = new ethers.Contract(contractAddress, abi, provider);

                // Fetch active bids
                const bidsData = await contract.getActiveBids(); // Ensure this method matches your smart contract

                // Process bidsData to match your Bid interface
                const formattedBids = bidsData.map((bid: any) => ({
                    userAddress: bid.userAddress,
                    amount: ethers.formatEther(bid.amount),
                    transactionId: bid.transactionId,
                    timestamp: new Date(bid.timestamp.toNumber() * 1000).toLocaleString() // Assuming timestamp is in seconds
                }));

                setBids(formattedBids);
            } catch (error) {
                console.error("Error fetching bids:", error);
            }
        } else {
            console.error("No Ethereum provider found.");
        }
    };
    useEffect(() => {
        fetchBids();
    }, []);

    return (
        <div className="flex h-full w-full flex-col bg-muted/40 p-4">
            <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                <Card x-chunk="dashboard-06-chunk-0">
                    <CardHeader>
                        <CardTitle>Active Bids</CardTitle>
                        <CardDescription>Total Bids active on Daily Basis</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User Public Address</TableHead>
                                    <TableHead className="hidden md:table-cell">Bid Amount</TableHead>
                                    <TableHead className="hidden md:table-cell">Transactions</TableHead>
                                    <TableHead className="hidden md:table-cell">Timestamps</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {bids.map((bid, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">{bid.userAddress}</TableCell>
                                        <TableCell className="hidden md:table-cell">${bid.amount}</TableCell>
                                        <TableCell className="hidden md:table-cell">{bid.transactionId}</TableCell>
                                        <TableCell className="hidden md:table-cell">{bid.timestamp}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
