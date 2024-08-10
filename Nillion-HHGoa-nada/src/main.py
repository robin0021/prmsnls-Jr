from nada_dsl import SecretInteger, Input, Output, Party, Integer


def nada_main():
    # Number of participants
    party = Party(name="Admin")
    maxRange = SecretInteger(Input(name="maxRange", party=party))
    random_int = SecretInteger.random() % (maxRange + Integer(1))

    return [
        Output(random_int, "Winning Number", party),
        
    ]
