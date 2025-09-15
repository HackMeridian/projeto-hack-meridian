#![no_std]
use soroban_sdk::{contract, contractimpl, Env, Address, Vec};

#[contract]
pub struct TokenCustody;

#[contractimpl]
impl TokenCustody {
    pub fn deposit_bond(env: Env, user: Address, bond_id: u64) {
        user.require_auth();

        // Incrementa totalValueLocked
        let key = user.clone();
        let count: u64 = env.storage().get(&key).unwrap_or(0);
        env.storage().set(&key, &(count + 1));

        // Adiciona bond na posição de custódia
        let mut bonds: Vec<u64> = env.storage().get(&key).unwrap_or(Vec::new(&env));
        bonds.push_back(bond_id);
        env.storage().set(&key, &bonds);
    }

    pub fn get_total_bonds_deposited(env: Env, user: Address) -> u64 {
        env.storage().get(&user).unwrap_or(0)
    }

    pub fn get_bonds_position_custody(env: Env, user: Address) -> Vec<u64> {
        env.storage().get(&user).unwrap_or(Vec::new(&env))
    }
}
