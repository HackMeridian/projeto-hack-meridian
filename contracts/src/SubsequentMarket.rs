#![no_std]

use soroban_sdk::{contractimpl, contracttype, Address, Env, Symbol, Vec, Map, panic_with_error, BytesN};

mod attorneycoin_interface {
    use soroban_sdk::{Address, Env, Symbol, BytesN};

    pub fn transfer_from(env: &Env, token: &BytesN<32>, from: &Address, to: &Address, amount: &i128) {
        let _: () = env.invoke_contract(
            token,
            &Symbol::short("transfer_from"),
            (from, to, amount),
        );
    }

    pub fn balance_of(env: &Env, token: &BytesN<32>, account: &Address) -> i128 {
        env.invoke_contract(token, &Symbol::short("balance_of"), (account,))
    }
}

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    InvestorOfferings(Address),
    OfferingPrice(u32),
    OfferingInvestorList,
    OfferingInvestorPresence(Address),
    Manager,
    BondSeizureContract,
    TokenContract,
    AmortContract,
    AttorneycoinContract,
}

#[derive(Clone)]
#[contracttype]
pub struct Bond {
    pub issue_number: u32,
    pub denomination: i128,
    pub interest_rate: u32,
    pub frequency: u32,
    pub issue_date: u64,
    pub maturity_date: u64,
}

pub struct SubsequentMarket;

#[contractimpl]
impl SubsequentMarket {
    pub fn initialize(env: Env, token_contract: BytesN<32>, amort_contract: BytesN<32>, attorneycoin_contract: BytesN<32>, manager: Address) {
        env.storage().set(&DataKey::Manager, &manager);
        env.storage().set(&DataKey::OfferingInvestorList, &Vec::<Address>::new(&env));
        env.storage().set(&DataKey::TokenContract, &token_contract);
        env.storage().set(&DataKey::AmortContract, &amort_contract);
        env.storage().set(&DataKey::AttorneycoinContract, &attorneycoin_contract);
    }

    pub fn offering_pool(env: Env, bond_id: u32, price: u128) -> (Bond, u128) {
        let caller = env.invoker();
        let token_contract: BytesN<32> = env.storage().get_unchecked(&DataKey::TokenContract).unwrap();

        if price == 0 {
            panic_with_error!(&env, "Price must be > 0");
        }

        let bond: Bond = env.invoke_contract(
            &token_contract,
            &Symbol::short("get_bond_details"),
            (&bond_id,),
        );

        if bond.issue_number == 0 {
            panic_with_error!(&env, "Bond not found");
        }

        let investor: Address = env.invoke_contract(
            &token_contract,
            &Symbol::short("get_investor_by_bond_id"),
            (&bond_id,),
        );

        if investor != caller {
            panic_with_error!(&env, "You're not the investor");
        }

        let mut list = env.storage().get::<_, Vec<Address>>(&DataKey::OfferingInvestorList).unwrap_or(Vec::new(&env));

        let already_listed = env.storage().get::<_, bool>(&DataKey::OfferingInvestorPresence(caller.clone())).unwrap_or(false);
        if !already_listed {
            list.push_back(caller.clone());
            env.storage().set(&DataKey::OfferingInvestorList, &list);
            env.storage().set(&DataKey::OfferingInvestorPresence(caller.clone()), &true);
        }

        let mut bonds = env.storage().get::<_, Vec<u32>>(&DataKey::InvestorOfferings(caller.clone())).unwrap_or(Vec::new(&env));
        bonds.push_back(bond_id);
        env.storage().set(&DataKey::InvestorOfferings(caller.clone()), &bonds);
        env.storage().set(&DataKey::OfferingPrice(bond_id), &price);

        (bond, price)
    }

    pub fn buy_bonds(env: Env, bond_ids: Vec<u32>, deposit: i128) -> bool {
        let caller = env.invoker();
        let token_contract: BytesN<32> = env.storage().get_unchecked(&DataKey::TokenContract).unwrap();
        let amort_contract: BytesN<32> = env.storage().get_unchecked(&DataKey::AmortContract).unwrap();
        let atc_token: BytesN<32> = env.storage().get_unchecked(&DataKey::AttorneycoinContract).unwrap();

        if deposit <= 0 {
            panic_with_error!(&env, "Deposit must be > 0");
        }

        let balance = attorneycoin_interface::balance_of(&env, &atc_token, &caller);
        if balance < deposit {
            panic_with_error!(&env, "Insufficient ATC balance");
        }

        let mut total_price = 0i128;

        for bond_id in bond_ids.iter() {
            let seller: Address = env.invoke_contract(
                &token_contract,
                &Symbol::short("bond_to_investor"),
                (&bond_id,),
            );

            let price = env.storage().get::<_, u128>(&DataKey::OfferingPrice(bond_id)).unwrap_or(0);
            if price == 0 {
                panic_with_error!(&env, "Bond not listed for sale");
            }

            total_price += price as i128;

            // Remove bond from seller offerings
            let mut seller_bonds = env
                .storage()
                .get::<_, Vec<u32>>(&DataKey::InvestorOfferings(seller.clone()))
                .unwrap_or(Vec::new(&env));

            let idx = seller_bonds.iter().position(|b| b == bond_id);
            if let Some(i) = idx {
                seller_bonds.swap_remove(i);
                env.storage().set(&DataKey::InvestorOfferings(seller.clone()), &seller_bonds);
            }

            // Transfer bond ownership
            let _res: () = env.invoke_contract(
                &token_contract,
                &Symbol::short("transfer_bond_ownership"),
                (&bond_id, &caller),
            );

            // Transfer amortization state
            let _res: () = env.invoke_contract(
                &amort_contract,
                &Symbol::short("_transfer_amortization_state"),
                (&bond_id, &seller, &caller),
            );

            // Transfer Attorneycoin
            attorneycoin_interface::transfer_from(&env, &atc_token, &caller, &seller, &(price as i128));

            // Remove price
            env.storage().remove(&DataKey::OfferingPrice(bond_id));
        }

        if deposit < total_price {
            panic_with_error!(&env, "Deposit too low");
        }

        true
    }

    pub fn cancel_offering(env: Env, bond_id: u32) {
        let caller = env.invoker();
        let token_contract: BytesN<32> = env.storage().get_unchecked(&DataKey::TokenContract).unwrap();
        let seizure_contract = env.storage().get::<_, Address>(&DataKey::BondSeizureContract).unwrap_or(Address::from_contract_id(&BytesN::from_array(&env, &[0; 32])));

        let investor: Address = env.invoke_contract(
            &token_contract,
            &Symbol::short("get_investor_by_bond_id"),
            (&bond_id,),
        );

        if caller != investor && caller != seizure_contract {
            panic_with_error!(&env, "Not authorized");
        }

        let mut offerings = env
            .storage()
            .get::<_, Vec<u32>>(&DataKey::InvestorOfferings(investor.clone()))
            .unwrap_or(Vec::new(&env));

        let idx = offerings.iter().position(|b| *b == bond_id);
        if let Some(i) = idx {
            offerings.swap_remove(i);
            env.storage().set(&DataKey::InvestorOfferings(investor.clone()), &offerings);
        }

        env.storage().remove(&DataKey::OfferingPrice(bond_id));
    }

    pub fn get_all_offered_bonds(env: Env) -> Vec<u32> {
        let mut all = Vec::new(&env);
        let investors = env.storage().get::<_, Vec<Address>>(&DataKey::OfferingInvestorList).unwrap_or(Vec::new(&env));

        for addr in investors.iter() {
            let bonds = env.storage().get::<_, Vec<u32>>(&DataKey::InvestorOfferings(addr.clone())).unwrap_or(Vec::new(&env));
            for bond in bonds.iter() {
                all.push_back(bond.clone());
            }
        }

        all
    }

    pub fn get_investor_offerings(env: Env, investor: Address) -> Vec<u32> {
        env.storage()
            .get::<_, Vec<u32>>(&DataKey::InvestorOfferings(investor))
            .unwrap_or(Vec::new(&env))
    }

    pub fn set_bond_seizure_sender(env: Env, sender: Address) {
        let manager = env.storage().get::<_, Address>(&DataKey::Manager).unwrap();
        if env.invoker() != manager {
            panic_with_error!(&env, "You're not the manager");
        }
        env.storage().set(&DataKey::BondSeizureContract, &sender);
    }
}