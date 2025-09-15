#![no_std]
use soroban_sdk::{contract, contractimpl, Env, Address, Vec};
use crate::bond_storage::{Bond, BondStatus, IssueData};

#[contract]
pub struct TokenMinting {
    custody_contract: Address,
    max_total_supply: u64,
}

#[contractimpl]
impl TokenMinting {
    pub fn initialize(_env: Env, custody_contract: Address) -> Self {
        Self { custody_contract, max_total_supply: 40000 }
    }

    pub fn mint_tokens(env: Env, payer: Address, number_of_debentures: u64) {
        payer.require_auth();
        assert!(number_of_debentures > 0, "Quantidade inválida");
        
        let mut max_supply: u64 = env.storage().get(&"max_total_supply").unwrap_or(40000);
        assert!(number_of_debentures <= max_supply, "MAX_SUPPLY_EXCEEDED");

        // Atualiza investorData
        let issue_data = IssueData {
            investor: payer.clone(),
            principal: number_of_debentures,
        };
        env.storage().set(&(payer.clone(), "issue_data"), &issue_data);

        let mut issue_number: u64 = env.storage().get(&"issue_number").unwrap_or(1);

        for _ in 0..number_of_debentures {
            let bond_id = issue_number;
            issue_number += 1;
            env.storage().set(&"issue_number", &issue_number);

            // Pega dados do BondStorage
            let bond_template: Bond = env.storage().get(&"bond_template").unwrap();

            // Cria bond novo
            let bond = Bond {
                currency: bond_template.currency.clone(),
                denomination: bond_template.denomination,
                interest_rate: bond_template.interest_rate,
                frequency: bond_template.frequency,
                issue_number: bond_id,
                issue_date: env.ledger().timestamp(),
                maturity_date: env.ledger().timestamp() + 47260800, // 547 dias
                bond_status: BondStatus::Issued,
            };

            env.storage().set(&(bond_id, "bond"), &bond);

            // Atualiza investorBonds
            let mut bonds: Vec<u64> = env.storage().get(&payer).unwrap_or(Vec::new(&env));
            bonds.push_back(bond_id);
            env.storage().set(&payer, &bonds);

            // Atualiza bondToInvestor
            env.storage().set(&(bond_id, "owner"), &payer);

            // Reduz supply
            max_supply -= 1;
            env.storage().set(&"max_total_supply", &max_supply);

            // Chama TokenCustody
            env.invoke_contract(&self.custody_contract, &"deposit_bond", (payer.clone(), bond_id));

            env.events().publish(("BondIssued",), bond_id);
        }
    }

    pub fn transfer_bond_ownership(env: Env, bond_id: u64, new_investor: Address) {
        assert!(new_investor != Address::generate(&env), "Novo investidor inválido");

        let current_owner: Address = env.storage().get(&(bond_id, "owner")).unwrap();
        assert!(current_owner != Address::generate(&env), "Bond não possui dono");

        // Atualiza novo dono
        env.storage().set(&(bond_id, "owner"), &new_investor);

        // Remove bond do investidor anterior
        let mut old_bonds: Vec<u64> = env.storage().get(&current_owner).unwrap();
        old_bonds.retain(|id| *id != bond_id);
        env.storage().set(&current_owner, &old_bonds);

        // Adiciona ao novo investidor
        let mut new_bonds: Vec<u64> = env.storage().get(&new_investor).unwrap_or(Vec::new(&env));
        new_bonds.push_back(bond_id);
        env.storage().set(&new_investor, &new_bonds);
    }

    pub fn get_bond_details(env: Env, bond_id: u64) -> Bond {
        env.storage().get(&(bond_id, "bond")).unwrap()
    }

    pub fn get_investor_bonds(env: Env, investor: Address) -> Vec<u64> {
        env.storage().get(&investor).unwrap_or(Vec::new(&env))
    }

    pub fn get_investor_by_bond_id(env: Env, bond_id: u64) -> Address {
        env.storage().get(&(bond_id, "owner")).unwrap()
    }

    pub fn issue_volume(env: Env) -> u64 {
        let issue_number: u64 = env.storage().get(&"issue_number").unwrap_or(1);
        issue_number - 1
    }
}
