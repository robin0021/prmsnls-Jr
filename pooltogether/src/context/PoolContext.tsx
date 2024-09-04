import { createContext, useContext, useState } from 'react';
import { ethers } from 'ethers';
import poolabi from '../../artifacts/contracts/pool.sol/pool.json';

const contractAddress = '0x0121Bc9b7E7a89197434f520Fa2df0501D1046Cd'; // Replace with your contract address

type Bid = {
    user: string;
    amount: string;
    transactionHash: string;
    timestamp: string;
};

interface PoolContextType {
    bids: Bid[];
    loading: boolean;
    addBid: (bid: Bid) => void;
    loadBids: (provider: ethers.providers.Web3Provider) => Promise<void>;
}

const PoolContext = createContext<PoolContextType | undefined>(undefined);

export const PoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [bids, setBids] = useState<Bid[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const addBid = (bid: Bid) => {
        setBids((prevBids) => [...prevBids, bid]);
    };

    const loadBids = async (provider: ethers.providers.Web3Provider) => {
        setLoading(true);
        try {
            const contract = new ethers.Contract(contractAddress, poolabi.abi, provider);
            // const bidEvents = await contract.queryFilter('BidPlaced'); // or appropriate event
            const bidEvents = await contract.getActiveRound("BidPlaced");
            const newBids = bidEvents.map((event: any) => ({
                user: event.args.user,
                amount: ethers.utils.formatEther(event.args.amount),
                transactionHash: event.transactionHash,
                timestamp: new Date(event.blockTime * 1000).toLocaleString()
            }));
            setBids(newBids);
        } catch (error) {
            console.error('Error loading bids:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <PoolContext.Provider value={{ bids, loading, addBid, loadBids }}>
            {children}
        </PoolContext.Provider>
    );
};

export const usePoolContext = () => {
    const context = useContext(PoolContext);
    if (context === undefined) {
        throw new Error('usePoolContext must be used within a PoolProvider');
    }
    return context;
};
