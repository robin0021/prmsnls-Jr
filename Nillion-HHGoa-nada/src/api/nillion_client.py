import asyncio
import py_nillion_client as nillion
import os
from py_nillion_client import NodeKey, UserKey, Permissions
from dotenv import load_dotenv
from nillion_python_helpers import (
    get_quote_and_pay,
    create_nillion_client,
    create_payments_config,
)
from cosmpy.aerial.client import LedgerClient
from cosmpy.aerial.wallet import LocalWallet
from cosmpy.crypto.keypairs import PrivateKey

home = os.getenv("HOME")
load_dotenv(f"{home}/.config/nillion/nillion-devnet.env")

async def get_random_number():
    cluster_id = os.getenv("NILLION_CLUSTER_ID")
    grpc_endpoint = os.getenv("NILLION_NILCHAIN_GRPC")
    chain_id = os.getenv("NILLION_NILCHAIN_CHAIN_ID")

    seed = "my_seed"

    userkey = UserKey.from_seed((seed))
    nodekey = NodeKey.from_seed((seed))

    client = create_nillion_client(userkey, nodekey)
    party_id = client.party_id
    user_id = client.user_id

    party_name = "Admin"
    program_name = "main"
    program_mir_path = f"./target/{program_name}.nada.bin"

    payments_config = create_payments_config(chain_id, grpc_endpoint)
    payments_client = LedgerClient(payments_config)
    payments_wallet = LocalWallet(
        PrivateKey(bytes.fromhex(os.getenv("NILLION_NILCHAIN_PRIVATE_KEY_0"))),
        prefix="nillion",
    )

    # Store program (you might want to do this once and reuse the program_id)
    receipt_store_program = await get_quote_and_pay(
        client,
        nillion.Operation.store_program(program_mir_path),
        payments_wallet,
        payments_client,
        cluster_id,
    )

    action_id = await client.store_program(
        cluster_id, program_name, program_mir_path, receipt_store_program
    )

    program_id = f"{user_id}/{program_name}"

    # Compute
    compute_bindings = nillion.ProgramBindings(program_id)
    compute_bindings.add_input_party(party_name, party_id)
    compute_bindings.add_output_party(party_name, party_id)

    computation_time_secrets = nillion.NadaValues(
        {
            "maxRange": nillion.SecretInteger(500),
        }
    )

    receipt_compute = await get_quote_and_pay(
        client,
        nillion.Operation.compute(program_id, computation_time_secrets),
        payments_wallet,
        payments_client,
        cluster_id,
    )

    uuid = await client.compute(
        cluster_id,
        compute_bindings,
        [],
        computation_time_secrets,
        receipt_compute,
    )

    while True:
        compute_event = await client.next_compute_event()
        if isinstance(compute_event, nillion.ComputeFinishedEvent):
            return compute_event.result.value

if __name__ == "__main__":
    result = asyncio.run(get_random_number())
    print(f"Random number: {result}")