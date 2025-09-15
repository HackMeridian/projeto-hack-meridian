#![cfg(test)]

extern crate std;

use super::bond_storage::{Bond, BondStatus, Issuer, BondStorage, BondStorageClient};
use soroban_sdk::testutils::{Address as _, MockAuth, MockAuthInvoke};
use soroban_sdk::{Address, Env, String, IntoVal, Val};

fn deploy_contract<'a>(env: &Env) -> (Address, BondStorageClient<'a>) {
    let contract_id = env.register_contract(None, BondStorage);
    let client = BondStorageClient::new(env, &contract_id);
    (contract_id, client)
}


#[test]
fn test_initialization() {
    let env = Env::default();
    let (_contract_id, client) = deploy_contract(&env);
    let manager = Address::generate(&env);
    client.initialize(&manager);
}

#[test]
fn test_set_and_get_issuer() {
    let env = Env::default();
    let (contract_id, client) = deploy_contract(&env);
    let manager = Address::generate(&env);
    client.initialize(&manager);

    let issuer_institution = Address::generate(&env);
    let issuer_data = Issuer {
        institution: issuer_institution.clone(),
        cnpj: String::from_str(&env, "12345678901234"),
        lei: String::from_str(&env, "LEI12345"),
    };
    
    env.mock_auths(&[
        MockAuth {
            address: &manager,
            invoke: &MockAuthInvoke {
                contract: &contract_id,
                fn_name: "set_issuer",
                args: (&issuer_data,).into_val(&env),
                sub_invokes: &[]
            }
        }
    ]);
    client.set_issuer(&issuer_data);

    let retrieved_issuer = client.issuer_info();
    assert_eq!(retrieved_issuer.institution, issuer_institution);
    assert_eq!(retrieved_issuer.cnpj, issuer_data.cnpj);
    assert_eq!(retrieved_issuer.lei, issuer_data.lei);
}

#[test]
fn test_set_and_get_bond() {
    let env = Env::default();
    let (contract_id, client) = deploy_contract(&env);
    let manager = Address::generate(&env);
    client.initialize(&manager);

    let currency_address = Address::generate(&env);
    let bond_data = Bond {
        currency: currency_address.clone(),
        denomination: 1000,
        interest_rate: 500,
        frequency: 2,
        issue_number: 1,
        issue_date: 1678886400,
        maturity_date: 1710499200,
        bond_status: BondStatus::Offered,
    };
    
    env.mock_auths(&[
        MockAuth {
            address: &manager,
            invoke: &MockAuthInvoke {
                contract: &contract_id,
                fn_name: "set_bond",
                args: (&bond_data,).into_val(&env),
                sub_invokes: &[]
            }
        }
    ]);
    client.set_bond(&bond_data);

    let retrieved_bond = client.bond_info();
    assert_eq!(retrieved_bond.currency, currency_address);
    assert_eq!(retrieved_bond.denomination, 1000);
}

#[test]
#[should_panic(expected = "HostError: Error(Auth, InvalidAction)")]
fn test_unauthorized_set_issuer() {
    let env = Env::default();
    let (_contract_id, client) = deploy_contract(&env);
    let manager = Address::generate(&env);
    client.initialize(&manager);

    let issuer_data = Issuer {
        institution: Address::generate(&env),
        cnpj: String::from_str(&env, "111"),
        lei: String::from_str(&env, "222"),
    };

    client.set_issuer(&issuer_data);
}

#[test]
#[should_panic(expected = "HostError: Error(Auth, InvalidAction)")]
fn test_unauthorized_set_bond() {
    let env = Env::default();
    let (_contract_id, client) = deploy_contract(&env);
    let manager = Address::generate(&env);
    client.initialize(&manager);

    let bond_data = Bond {
        currency: Address::generate(&env),
        denomination: 1, interest_rate: 1, frequency: 1, issue_number: 1,
        issue_date: 1, maturity_date: 1, bond_status: BondStatus::Issued,
    };

    client.set_bond(&bond_data);
}
