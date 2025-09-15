#![no_std]
use soroban_sdk::{contract, contractimpl, Env, Address};

#[contract]
pub struct PaymentPool {
    minting_contract: Address,
}

#[contractimpl]
impl PaymentPool {
    pub fn initialize(_env: Env, minting_contract: Address) -> Self {
        Self { minting_contract }
    }

    pub fn deposit_usdc(env: Env, payer: Address, usdc_amount: i128, denomination: i128) {
        payer.require_auth();

        let number_of_bonds = usdc_amount / denomination;
        assert!(number_of_bonds > 0, "Número de bonds inválido");

        // Aqui no frontend deve ser feita a transferência USDC antes
        // Este contrato apenas chama a mintagem

        env.invoke_contract(
            &self.minting_contract,
            &"mint_tokens",
            (payer.clone(), number_of_bonds as u64),
        );

        env.events().publish(("PaymentReceived",), usdc_amount);
    }
}
