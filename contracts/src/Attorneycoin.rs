#![no_std]

use soroban_sdk::{contractimpl, contracttype, Address, Env, Symbol, Vec, Map, panic_with_error};

pub const DECIMALS: u32 = 6;
pub const MINT_LIMIT: i128 = 10 * 10i128.pow(DECIMALS);

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Name,
    Symbol,
    TotalSupply,
    Balance(Address),
    Allowance(Address, Address),
    Admin,
    UserLastMint(Address),
}

pub struct Attorneycoin;

#[contractimpl]
impl Attorneycoin {
    pub fn init(env: Env, admin: Address) {
        admin.require_auth();

        env.storage().set(&DataKey::Name, &"Attorneycoin");
        env.storage().set(&DataKey::Symbol, &"ATC");
        env.storage().set(&DataKey::Admin, &admin);

        let initial_supply: i128 = 1_000_000 * 10i128.pow(DECIMALS);
        env.storage().set(&DataKey::TotalSupply, &initial_supply);
        env.storage().set(&DataKey::Balance(admin.clone()), &initial_supply);
    }

    pub fn name(env: Env) -> Symbol {
        Symbol::short("Attorneycoin")
    }

    pub fn symbol(env: Env) -> Symbol {
        Symbol::short("ATC")
    }

    pub fn decimals(_env: Env) -> u32 {
        DECIMALS
    }

    pub fn total_supply(env: Env) -> i128 {
        env.storage().get(&DataKey::TotalSupply).unwrap_or(Ok(0)).unwrap()
    }

    pub fn balance_of(env: Env, owner: Address) -> i128 {
        env.storage().get(&DataKey::Balance(owner)).unwrap_or(Ok(0)).unwrap()
    }

    pub fn transfer(env: Env, to: Address, amount: i128) {
        let from = env.invoker();
        from.require_auth();

        let from_balance = Self::balance_of(env.clone(), from.clone());
        if from_balance < amount {
            panic_with_error!(&env, "Insufficient balance");
        }

        env.storage().set(&DataKey::Balance(from.clone()), &(from_balance - amount));

        let to_balance = Self::balance_of(env.clone(), to.clone());
        env.storage().set(&DataKey::Balance(to.clone()), &(to_balance + amount));
    }

    pub fn approve(env: Env, spender: Address, amount: i128) {
        let owner = env.invoker();
        owner.require_auth();
        env.storage().set(&DataKey::Allowance(owner, spender), &amount);
    }

    pub fn allowance(env: Env, owner: Address, spender: Address) -> i128 {
        env.storage().get(&DataKey::Allowance(owner, spender)).unwrap_or(Ok(0)).unwrap()
    }

    pub fn transfer_from(env: Env, from: Address, to: Address, amount: i128) {
        let spender = env.invoker();
        spender.require_auth();

        let allowance = Self::allowance(env.clone(), from.clone(), spender.clone());
        if allowance < amount {
            panic_with_error!(&env, "Insufficient allowance");
        }

        let from_balance = Self::balance_of(env.clone(), from.clone());
        if from_balance < amount {
            panic_with_error!(&env, "Insufficient balance");
        }

        env.storage().set(&DataKey::Allowance(from.clone(), spender.clone()), &(allowance - amount));
        env.storage().set(&DataKey::Balance(from.clone()), &(from_balance - amount));

        let to_balance = Self::balance_of(env.clone(), to.clone());
        env.storage().set(&DataKey::Balance(to), &(to_balance + amount));
    }

    pub fn mint_to_user(env: Env) {
        let user = env.invoker();
        user.require_auth();

        let now = env.ledger().timestamp();
        let last_mint = env.storage().get(&DataKey::UserLastMint(user.clone())).unwrap_or(Ok(0)).unwrap();

        if now - last_mint < 86400 {
            panic_with_error!(&env, "User mint deadline reached");
        }

        let current_balance = Self::balance_of(env.clone(), user.clone());
        if current_balance >= MINT_LIMIT {
            panic_with_error!(&env, "Balance exceeds mint limit");
        }

        let minted = MINT_LIMIT - current_balance;

        env.storage().set(&DataKey::Balance(user.clone()), &(current_balance + minted));
        let total_supply = Self::total_supply(env.clone()) + minted;
        env.storage().set(&DataKey::TotalSupply, &total_supply);
        env.storage().set(&DataKey::UserLastMint(user), &now);
    }

    pub fn admin_mint(env: Env, amount: i128) {
        let caller = env.invoker();
        caller.require_auth();

        let admin: Address = env.storage().get(&DataKey::Admin).unwrap().unwrap();
        if caller != admin {
            panic_with_error!(&env, "Only admin");
        }

        let admin_balance = Self::balance_of(env.clone(), admin.clone());
        env.storage().set(&DataKey::Balance(admin.clone()), &(admin_balance + amount));

        let new_supply = Self::total_supply(env.clone()) + amount;
        env.storage().set(&DataKey::TotalSupply, &new_supply);
    }
}