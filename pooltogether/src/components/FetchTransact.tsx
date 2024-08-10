import { ethers } from 'ethers';
import abi from '../abi.json';

// Connect to a Polygon node
const provider = new ethers.JsonRpcProvider('https://polygon-mainnet.g.alchemy.com/v2/SyOFb3S3_TNhX25e1YzZklZPdVzQO-VO');

// Your deployed contract address
const contractAddress = '0x96A09A090a83198A6E08E2882DEce9C0057779F3';

// Function to connect to the contract and deposit funds
async function depositFunds(amount: string): Promise<void> {
    try {
        if (typeof window.ethereum === 'undefined') {
            throw new Error('MetaMask is not installed. Please install it to use this feature.');
        }

        // Connect to the user's wallet
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await web3Provider.getSigner();

        // Create a contract instance with the signer
        const contract = new ethers.Contract(contractAddress, abi, signer);

        // Convert amount to Wei (1 Ether = 10^18 Wei)
        const amountInWei = ethers.parseEther(amount);

        // Call the deposit function on the contract
        const tx = await contract.deposit({ value: amountInWei });

        console.log('Transaction sent:', tx.hash);

        // Wait for the transaction to be mined
        await tx.wait();

        console.log('Deposit confirmed');
    } catch (error) {
        console.error('Error depositing funds:', error);
    }
}

// The function should only be called when you need it, e.g., on a button click
// Example: attach this to an onClick event
// document.getElementById('depositButton').addEventListener('click', () => depositFunds('0.1'));

export { depositFunds };
