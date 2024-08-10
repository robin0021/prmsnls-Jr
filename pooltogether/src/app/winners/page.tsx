"use client";

import { NextPage } from 'next';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import Link from 'next/link';

interface Winner {
    walletAddress: string;
    amountWon: number;
}

const WinnersPage: NextPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [winners, setWinners] = useState<Winner[]>([]);
    const [userWallet, setUserWallet] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== 'undefined') { // Ensure this code only runs on the client
            checkWalletAndFetchData();
        }
    }, []);

    const checkWalletAndFetchData = async () => {
        try {
            const userAddress = await getUserWalletAddress();
            setUserWallet(userAddress);

            const authorizedWallet = '0x95ee486935f4a076aec425E1A6135cF2Fc462180';

            if (userAddress.toLowerCase() !== authorizedWallet.toLowerCase()) {
                router.push('/');
            } else {
                setIsAdmin(true);
                await fetchWinnerData();
            }
        } catch (error) {
            console.error('Error checking wallet or fetching data:', error);
        }
    };

    const handleDetermineWinnerClick = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/run-lottery', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // body: JSON.stringify({ userWallet }),
            });

            if (!response.ok) {
                throw new Error('Failed to determine winner');
            }

            const result = await response.json();
            console.log('Winner determined:', result);

            // Fetch updated winner data
            await fetchWinnerData();
        } catch (error) {
            console.error('Error determining winner:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchWinnerData = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/run-lottery');
            if (!response.ok) {
                throw new Error('Failed to fetch winners');
            }
            const data = await response.json();
            setWinners(data);
        } catch (error) {
            console.error('Error fetching winner data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-8">
            <Link href="/" className="text-blue-500 hover:underline mb-4 inline-block">
                Back to Home
            </Link>
            <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>
            <div className="rounded-md border">
                {isLoading ? (
                    <div>Loading...</div>
                ) : (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeader>Rank</TableHeader>
                                <TableHeader>Wallet Address</TableHeader>
                                <TableHeader>Amount Won</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {winners.map((winner, index) => (
                                <TableRow key={index}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm text-muted-foreground truncate">{winner.walletAddress}</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => navigator.clipboard.writeText(winner.walletAddress)}
                                            >
                                                Copy
                                            </Button>
                                        </div>
                                    </TableCell>
                                    <TableCell>{winner.amountWon} ETH</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            {isAdmin && (
                <div className="mt-4">
                    <Button onClick={handleDetermineWinnerClick} disabled={isLoading}>
                        {isLoading ? 'Processing...' : 'Determine Winner'}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default WinnersPage;

async function getUserWalletAddress(): Promise<string> {
    try {
        if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            return accounts[0];
        } else {
            throw new Error('Ethereum wallet not found');
        }
    } catch (error) {
        console.error('Error getting wallet address:', error);
        return '';
    }
}
