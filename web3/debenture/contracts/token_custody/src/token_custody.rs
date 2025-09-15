use soroban_sdk::{contract, contractimpl, contracttype, Env, Address, Vec};

#[contracttype]
pub enum DataKey {
    Count(Address),
    Bonds(Address),
}

#[contract]
pub struct TokenCustody;

#[contractimpl]
impl TokenCustody {
    pub fn deposit_bond(env: Env, user: Address, bond_id: u64) {
        user.require_auth();

        // Incrementa totalValueLocked
        let count_key = DataKey::Count(user.clone());
        let count: u64 = env.storage().instance().get(&count_key).unwrap_or(0);
        env.storage().instance().set(&count_key, &(count + 1));

        // Adiciona bond na posição de custódia
        let bonds_key = DataKey::Bonds(user);
        let mut bonds: Vec<u64> = env.storage().instance().get(&bonds_key).unwrap_or_else(|| Vec::new(&env));
        bonds.push_back(bond_id);
        env.storage().instance().set(&bonds_key, &bonds);
    }

    pub fn get_total_bonds_deposited(env: Env, user: Address) -> u64 {
        let key = DataKey::Count(user);
        env.storage().instance().get(&key).unwrap_or(0)
    }

    pub fn get_bonds_position_custody(env: Env, user: Address) -> Vec<u64> {
        let key = DataKey::Bonds(user);
        env.storage().instance().get(&key).unwrap_or_else(|| Vec::new(&env))
    }
}
