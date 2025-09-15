use soroban_sdk::{contract, contractimpl, contracttype, Env, Address, Vec, Symbol, vec, IntoVal, String};

// Definições das structs diretamente no arquivo (sem dependência externa)
#[contracttype]
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

#[contracttype]
#[derive(Clone)]
pub struct IssueData {
    pub investor: Address,
    pub principal: u64,
}

#[contracttype]
#[derive(Clone, Copy)]
pub enum BondStatus {
    Offered,
    Issued,
    Matured,
    Redeemed,
}

#[contracttype]
#[derive(Clone)]
pub struct TokenMinting {
    custody_contract: Address,
    max_total_supply: u64,
}

#[contract]
pub struct TokenMintingContract;

#[contractimpl]
impl TokenMintingContract {
    pub fn initialize(env: Env, custody_contract: Address) {
        env.storage().instance().set(&Symbol::new(&env, "custody_contract"), &custody_contract);
    }
    
    pub fn mint_tokens(env: Env, payer: Address, number_of_debentures: u64) {
        payer.require_auth();
        assert!(number_of_debentures > 0, "Quantidade inválida");
        
        let mut max_supply: u64 = env.storage().persistent().get(&Symbol::new(&env, "max_total_supply")).unwrap_or(40000);
        assert!(number_of_debentures <= max_supply, "MAX_SUPPLY_EXCEEDED");

        // Atualiza investorData
        let issue_data = IssueData {
            investor: payer.clone(),
            principal: number_of_debentures,
        };
        let issue_data_key = (payer.clone(), Symbol::new(&env, "issue_data"));
        env.storage().persistent().set(&issue_data_key, &issue_data);

        let mut issue_number: u64 = env.storage().persistent().get(&Symbol::new(&env, "issue_number")).unwrap_or(1);

        for _ in 0..number_of_debentures {
            let bond_id = issue_number;
            issue_number += 1;
            env.storage().persistent().set(&Symbol::new(&env, "issue_number"), &issue_number);

            // Pega dados do BondStorage
            let bond_template: Bond = env.storage().persistent().get(&Symbol::new(&env, "bond_template")).unwrap();

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

            let bond_key = (bond_id, Symbol::new(&env, "bond"));
            env.storage().persistent().set(&bond_key, &bond);

            // Atualiza investorBonds
            let mut bonds: Vec<u64> = env.storage().persistent().get(&payer).unwrap_or(Vec::new(&env));
            bonds.push_back(bond_id);
            env.storage().persistent().set(&payer, &bonds);

            // Atualiza bondToInvestor
            let owner_key = (bond_id, Symbol::new(&env, "owner"));
            env.storage().persistent().set(&owner_key, &payer);

            // Reduz supply
            max_supply -= 1;
            env.storage().persistent().set(&Symbol::new(&env, "max_total_supply"), &max_supply);

            // Chama TokenCustody - corrigido
            let custody_contract_address: Address = env.storage().instance()
                .get(&Symbol::new(&env, "custody_contract")).unwrap();

            let _: () = env.invoke_contract(
                &custody_contract_address,
                &Symbol::new(&env, "deposit_bond"),
                vec![&env, payer.clone().into_val(&env), bond_id.into_val(&env)]
            );

            env.events().publish((Symbol::new(&env, "BondIssued"),), bond_id);
        }
    }

    pub fn transfer_bond_ownership(env: Env, bond_id: u64, new_investor: Address) {
        // Validação básica do novo investidor
        assert!(!new_investor.to_string().is_empty(), "Novo investidor inválido");

        let owner_key = (bond_id, Symbol::new(&env, "owner"));
        let current_owner: Address = env.storage().persistent().get(&owner_key).unwrap();
        
        // Validação do dono atual
        assert!(!current_owner.to_string().is_empty(), "Bond não possui dono");

        // Atualiza novo dono
        env.storage().persistent().set(&owner_key, &new_investor);

        // Remove bond do investidor anterior
        let old_bonds: Vec<u64> = env.storage().persistent().get(&current_owner).unwrap_or(Vec::new(&env));
        
        // Cria um novo Vec filtrando o bond removido
        let mut filtered_bonds = Vec::new(&env);
        for bond in old_bonds.iter() {
            if bond != bond_id {
                filtered_bonds.push_back(bond);
            }
        }
        env.storage().persistent().set(&current_owner, &filtered_bonds);

        // Adiciona ao novo investidor
        let mut new_bonds: Vec<u64> = env.storage().persistent().get(&new_investor).unwrap_or(Vec::new(&env));
        new_bonds.push_back(bond_id);
        env.storage().persistent().set(&new_investor, &new_bonds);
    }

    pub fn get_bond_details(env: Env, bond_id: u64) -> Bond {
        let bond_key = (bond_id, Symbol::new(&env, "bond"));
        env.storage().persistent().get(&bond_key).unwrap()
    }

    pub fn get_investor_bonds(env: Env, investor: Address) -> Vec<u64> {
        env.storage().persistent().get(&investor).unwrap_or(Vec::new(&env))
    }

    pub fn get_investor_by_bond_id(env: Env, bond_id: u64) -> Address {
        let owner_key = (bond_id, Symbol::new(&env, "owner"));
        env.storage().persistent().get(&owner_key).unwrap()
    }

    pub fn issue_volume(env: Env) -> u64 {
        let issue_number: u64 = env.storage().persistent().get(&Symbol::new(&env, "issue_number")).unwrap_or(1);
        issue_number - 1
    }

    pub fn set_bond_template(env: Env, bond_template: Bond) {
        // Função para definir o template do bond
        env.storage().persistent().set(&Symbol::new(&env, "bond_template"), &bond_template);
    }
}