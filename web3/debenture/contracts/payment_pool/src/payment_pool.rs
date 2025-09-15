use soroban_sdk::{contract, contractimpl, Env, Address, Symbol, IntoVal, vec};

#[contract]
pub struct PaymentPoolContract;

#[contractimpl]
impl PaymentPoolContract {
    pub fn initialize(env: Env, minting_contract: Address) {
        env.storage().instance().set(&"minting_contract", &minting_contract);
    }

    pub fn deposit_usdc(env: Env, payer: Address, usdc_amount: i128, denomination: i128) {
        payer.require_auth();

        let number_of_bonds = usdc_amount / denomination;
        assert!(number_of_bonds > 0, "Número de bonds inválido");

        // Aqui no frontend deve ser feita a transferência USDC antes
        // Este contrato apenas chama a mintagem
        let minting_contract: Address = env.storage().instance().get(&"minting_contract").unwrap();

        env.invoke_contract::<()>(
            &minting_contract,
            &Symbol::new(&env, "mint_tokens"),
            vec![&env, payer.into_val(&env), (number_of_bonds as u64).into_val(&env)],
        );

        //env.events().publish((Symbol::new(&env, "PaymentReceived"),), usdc_amount);
    }
}
