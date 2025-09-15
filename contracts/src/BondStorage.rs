#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, Vec};

// -------------------------
//  Definições de Structs
// -------------------------

#[derive(Clone)]
pub struct Bond {
    pub currency: Address,
    pub denomination: i128,
    pub interest_rate: i128,
    pub frequency: u64,
    pub issue_number: u64,
    pub issue_date: u64,
    pub maturity_date: u64,
    pub bond_status: BondStatus,
}

#[derive(Clone)]
pub struct Issuer {
    pub institution: Address,
    pub cnpj: soroban_sdk::String,
    pub lei: soroban_sdk::String,
}

#[derive(Clone)]
pub struct IssueData {
    pub investor: Address,
    pub principal: u64,
}

#[derive(Clone, Copy)]
pub enum BondStatus {
    Offered,
    Issued,
    Matured,
    Redeemed,
}

// -------------------------
//  Contrato BondStorage
// -------------------------

#[contract]
pub struct BondStorage;

#[contractimpl]
impl BondStorage {
    // Inicialização
    pub fn initialize(env: Env, manager: Address) {
        env.storage().set(&"manager", &manager);
        env.storage().set(&"bondISIN", &"BREMISDEB5H2");
        env.storage().set(&"issueNumber", &1u64);
        env.storage().set(&"bondStatus", &BondStatus::Offered);
    }

    // Apenas o manager pode alterar
    fn require_manager(env: &Env) {
        let manager: Address = env.storage().get(&"manager").unwrap();
        manager.require_auth();
    }

    // ------------------------
    //   Funções de SET
    // ------------------------

    pub fn set_bond(env: Env, bond: Bond) {
        Self::require_manager(&env);
        let isin: soroban_sdk::String = env.storage().get(&"bondISIN").unwrap();
        env.storage().set(&(isin.clone(), "bond"), &bond);
    }

    pub fn set_issuer(env: Env, issuer: Issuer) {
        Self::require_manager(&env);
        let isin: soroban_sdk::String = env.storage().get(&"bondISIN").unwrap();
        env.storage().set(&(isin.clone(), "issuer"), &issuer);
    }

    // ------------------------
    //   Funções de GET
    // ------------------------

    pub fn institution(env: Env) -> Address {
        let isin: soroban_sdk::String = env.storage().get(&"bondISIN").unwrap();
        let issuer: Issuer = env.storage().get(&(isin, "issuer")).unwrap();
        issuer.institution
    }

    pub fn cnpj(env: Env) -> soroban_sdk::String {
        let isin: soroban_sdk::String = env.storage().get(&"bondISIN").unwrap();
        let issuer: Issuer = env.storage().get(&(isin, "issuer")).unwrap();
        issuer.cnpj
    }

    pub fn lei(env: Env) -> soroban_sdk::String {
        let isin: soroban_sdk::String = env.storage().get(&"bondISIN").unwrap();
        let issuer: Issuer = env.storage().get(&(isin, "issuer")).unwrap();
        issuer.lei
    }

    pub fn bond_info(env: Env) -> Bond {
        let isin: soroban_sdk::String = env.storage().get(&"bondISIN").unwrap();
        env.storage().get(&(isin, "bond")).unwrap()
    }

    pub fn currency(env: Env) -> Address {
        Self::bond_info(env).currency
    }

    pub fn denomination(env: Env) -> i128 {
        Self::bond_info(env).denomination
    }

    pub fn frequency(env: Env) -> u64 {
        Self::bond_info(env).frequency
    }

    pub fn interest_rate(env: Env) -> i128 {
        Self::bond_info(env).interest_rate
    }

    pub fn issue_date(env: Env) -> u64 {
        Self::bond_info(env).issue_date
    }

    pub fn maturity_date(env: Env) -> u64 {
        Self::bond_info(env).maturity_date
    }

    pub fn issuer_info(env: Env) -> Issuer {
        let isin: soroban_sdk::String = env.storage().get(&"bondISIN").unwrap();
        env.storage().get(&(isin, "issuer")).unwrap()
    }
}
