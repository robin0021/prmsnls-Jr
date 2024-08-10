from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from web3 import Web3
import asyncio
from nillion_client import get_random_number
from typing import List
import os
from dotenv import load_dotenv

app = FastAPI()

# Load environment variables
load_dotenv()

# Ethereum network configuration
INFURA_URL = os.getenv("INFURA_URL")
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS")
ADMIN_PRIVATE_KEY = os.getenv("ADMIN_PRIVATE_KEY")

# Ensure critical environment variables are set
if not all([INFURA_URL, CONTRACT_ADDRESS, ADMIN_PRIVATE_KEY]):
    raise ValueError("Missing required environment variables")

# Connect to Ethereum network
w3 = Web3(Web3.HTTPProvider(INFURA_URL))

# Create contract instance
CONTRACT_ABI = [
    {
        "inputs": [],
        "name": "getTotal",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "index", "type": "uint256"},
            {"internalType": "address", "name": "winner", "type": "address"}
        ],
        "name": "closeRound",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]
contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=CONTRACT_ABI)

# Set up admin account
admin_account = w3.eth.account.from_key(ADMIN_PRIVATE_KEY)

class LotteryResult(BaseModel):
    success: bool
    winner_address: str
    winning_number: int
    total_participants: int
    transaction_hash: str

@app.post("/run_lottery", response_model=LotteryResult)
async def run_lottery():
    try:
        # Get random number from Nillion
        nillion_result = await get_random_number()
        random_number = int(nillion_result['Winning Number'])

        # Get total participants from Solidity contract
        total_participants = contract.functions.getTotal().call()

        # Calculate winning number
        winning_number = random_number % total_participants

        # Get list of participants (you need to implement this function)
        participants = get_participants()

        # Select winner
        winner_address = participants[winning_number]

        # Prepare transaction
        nonce = w3.eth.get_transaction_count(admin_account.address)
        tx = contract.functions.closeRound(winning_number, winner_address).build_transaction({
            'chainId': w3.eth.chain_id,
            'gas': 2000000,  # Adjust as needed
            'gasPrice': w3.eth.gas_price,
            'nonce': nonce,
        })

        # Sign and send transaction
        signed_tx = admin_account.sign_transaction(tx)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)

        # Wait for transaction receipt
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

        if receipt.status == 1:
            return LotteryResult(
                success=True,
                winner_address=winner_address,
                winning_number=winning_number,
                total_participants=total_participants,
                transaction_hash=tx_hash.hex()
            )
        else:
            raise HTTPException(status_code=500, detail="Transaction failed")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def get_participants() -> List[str]:
    # Implement this function to return a list of participant addresses
    # You might need to call a contract function or query a database
    pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)