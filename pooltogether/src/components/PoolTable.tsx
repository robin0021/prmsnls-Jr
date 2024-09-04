import { useEffect, useState } from 'react';
import { ethers } from "ethers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePoolContext } from '@/context/PoolContext';

export function PoolTable() {
    const { bids, loading, loadBids } = usePoolContext();
    const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);

    useEffect(() => {
        const initEthers = async () => {
            if (window.ethereum) {
                const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
                setProvider(web3Provider);
                await loadBids(web3Provider);
            } else {
                console.error('Please install MetaMask!');
            }
        };
        initEthers();
    }, [loadBids]);

    return (
        <div className="flex h-full w-full flex-col bg-muted/40 p-4">
            <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                <Card x-chunk="dashboard-06-chunk-0">
                    <CardHeader>
                        <CardTitle>Active Bids</CardTitle>
                        <CardDescription>Total Bids active on Daily Basis</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <p>Loading...</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User Public Address</TableHead>
                                        <TableHead>Amount (MATIC)</TableHead>
                                        <TableHead>Transaction Hash</TableHead>
                                        <TableHead>Timestamp</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {bids.map((bid, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{bid.user}</TableCell>
                                            <TableCell className="hidden md:table-cell">{bid.amount} MATIC</TableCell>
                                            <TableCell className="hidden md:table-cell">{bid.transactionHash}</TableCell>
                                            <TableCell className="hidden md:table-cell">{bid.timestamp}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
