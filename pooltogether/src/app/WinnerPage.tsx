"use client";

import { NextPage } from 'next';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Button } from "@/components/ui/button";
import Link from 'next/link';

interface Winner {
    walletAddress: string;
    amountWon: number;
}

const WinnersPage: NextPage = () => {
    const [winners, setWinners] = useState<Winner[]>([]);
    const [userWallet, setUserWallet] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState<boolean>(false); // State to track if the user is the admin
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== 'undefined') { // Ensure this code only runs on the client
            checkWallet();
        }
    }, [router]);

    // Check the user's wallet address
    const checkWallet = async () => {
        try {
            const userAddress = await getUserWalletAddress();
            setUserWallet(userAddress);

            const authorizedWallet = '0x95ee486935f4a076aec425E1A6135cF2Fc462180';

            if (userAddress !== authorizedWallet) {
                router.push('/');
            } else {
                setIsAdmin(true); // Set isAdmin to true if the user is the authorized wallet
                fetchWinnerData();
            }
        } catch (error) {
            console.error('Error checking wallet:', error);
        }
    };

    const fetchWinnerData = () => {
        const winners: Winner[] = [
            {
                walletAddress: '0x1234567890123456789012345678901234567890',
                amountWon: 1000,
            },
            {
                walletAddress: '0x0987654321098765432109876543210987654321',
                amountWon: 500,
            },
            {
                walletAddress: '0x1111222233334444555566667777888899990000',
                amountWon: 250,
            },
        ];

        setWinners(winners);
    };

    const handleDetermineWinnerClick = async () => {
        try {
            // Call API to determine the winner
            const response = await fetch('https://localhost:8000/run-lottery', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userWallet }),
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
            // Handle error (e.g., show an error message to the user)
        }
    };

    return (
        <div className="p-8">
            <Link href="/" className="text-blue-500 hover:underline mb-4 inline-block">
                Back to Home
            </Link>
            <h1 className="text-2xl font-bold mb-4">Leaderboard</h1>
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
                                    <span className="text-gray-500 truncate">{winner.walletAddress}</span>
                                    <button
                                        className="text-blue-500 hover:text-blue-700 focus:outline-none"
                                        onClick={() => navigator.clipboard.writeText(winner.walletAddress)}
                                    >
                                        Copy
                                    </button>
                                </div>
                            </TableCell>
                            <TableCell>{winner.amountWon} ETH</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {isAdmin && (
                <div className="mt-4">
                    <Button onClick={handleDetermineWinnerClick}>Determine Winner</Button>
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
            return '0x0987654321098765432109876543210987654321';
        }
    } catch (error) {
        console.error('Error getting wallet address:', error);
        return '0x0987654321098765432109876543210987654321';
    }
}
