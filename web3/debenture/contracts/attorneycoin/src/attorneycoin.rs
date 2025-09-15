use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Symbol, panic_with_error, Error};
use crate::{Error as AttorneyCoinError, TransferEvent, ApproveEvent, MintEvent};

// Constants
pub const DECIMALS: u32 = 6;
pub const MINT_LIMIT: i128 = 10 * 10i128.pow(DECIMALS);

// DataKey enum for storage
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

// Attorneycoin struct
#[contract]
pub struct Attorneycoin;

// Attorneycoin contract implementation
#[contractimpl]
impl Attorneycoin {
    // Initializes the contract with an admin and initial supply
    pub fn init(env: Env, admin: Address) {
        admin.require_auth();

        env.storage().instance().set(&DataKey::Name, &"Attorneycoin");
        env.storage().instance().set(&DataKey::Symbol, &"ATC");
        env.storage().instance().set(&DataKey::Admin, &admin.clone());

        let initial_supply: i128 = 1_000_000 * 10i128.pow(DECIMALS);
        env.storage().instance().set(&DataKey::TotalSupply, &initial_supply);
        env.storage().instance().set(&DataKey::Balance(admin.clone()), &initial_supply);

        env.events().publish((Symbol::new(&env, "mint"),), MintEvent{to: admin, amount: initial_supply});
    }

    // Returns the token's name
    pub fn name(_env: Env) -> Symbol {
        Symbol::new(&_env, "Attorneycoin")
    }

    // Returns the token's symbol
    pub fn symbol(_env: Env) -> Symbol {
        Symbol::new(&_env, "ATC")
    }

    // Returns the token's decimals
    pub fn decimals(_env: Env) -> u32 {
        DECIMALS
    }

    // Returns the total supply of the token
    pub fn total_supply(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::TotalSupply).unwrap_or(0)
    }

    // Returns the balance of a specific owner
    pub fn balance_of(env: Env, owner: Address) -> i128 {
        env.storage().instance().get(&DataKey::Balance(owner)).unwrap_or(0)
    }

    // Transfers a certain amount of tokens from the invoker to a recipient
    pub fn transfer(env: Env, to: Address, amount: i128) {
        let from = env.current_contract_address();
        from.require_auth();

        let from_balance = Self::balance_of(env.clone(), from.clone());
        if from_balance < amount {
            panic!("{:?}", AttorneyCoinError::InsufficientBalance);
        }

        env.storage().instance().set(&DataKey::Balance(from.clone()), &(from_balance - amount));

        let to_balance = Self::balance_of(env.clone(), to.clone());
        env.storage().instance().set(&DataKey::Balance(to.clone()), &(to_balance + amount));

        env.events().publish((Symbol::new(&env, "transfer"),), TransferEvent{from, to, amount});
    }

    // Approves a spender to withdraw a certain amount of tokens from the invoker's account
    pub fn approve(env: Env, spender: Address, amount: i128) {
        let owner = env.current_contract_address();
        owner.require_auth();
        env.storage().instance().set(&DataKey::Allowance(owner.clone(), spender.clone()), &amount);

        env.events().publish((Symbol::new(&env, "approve"),), ApproveEvent{from: owner, to: spender, amount});
    }

    // Returns the amount of tokens a spender is allowed to withdraw from an owner's account
    pub fn allowance(env: Env, owner: Address, spender: Address) -> i128 {
        env.storage().instance().get(&DataKey::Allowance(owner, spender)).unwrap_or(0)
    }

    // Transfers a certain amount of tokens from a sender to a recipient, authorized by the sender
    pub fn transfer_from(env: Env, from: Address, to: Address, amount: i128) {
        let spender = env.current_contract_address();
        spender.require_auth();

        let allowance = Self::allowance(env.clone(), from.clone(), spender.clone());
        if allowance < amount {
            panic!("{:?}", AttorneyCoinError::InsufficientAllowance);
        }

        let from_balance = Self::balance_of(env.clone(), from.clone());
        if from_balance < amount {
            panic!("{:?}", AttorneyCoinError::InsufficientBalance);
        }

        env.storage().instance().set(&DataKey::Allowance(from.clone(), spender.clone()), &(allowance - amount));
        env.storage().instance().set(&DataKey::Balance(from.clone()), &(from_balance - amount));

        let to_balance = Self::balance_of(env.clone(), to.clone());
        env.storage().instance().set(&DataKey::Balance(to.clone()), &(to_balance + amount));

        env.events().publish((Symbol::new(&env, "transfer"),), TransferEvent{from, to, amount});
    }

    // Mints new tokens to the user, with a daily limit
    pub fn mint_to_user(env: Env) {
        let user = env.current_contract_address();
        user.require_auth();

        let now = env.ledger().timestamp();
        let last_mint = env.storage().instance().get(&DataKey::UserLastMint(user.clone())).unwrap_or(0);

        if now - last_mint < 86400 {
            panic!("{:?}", AttorneyCoinError::DailyMintingReached);
        }

        let current_balance = Self::balance_of(env.clone(), user.clone());
        if current_balance >= MINT_LIMIT {
            panic!("{:?}", AttorneyCoinError::MintingCapped);
        }

        let minted = MINT_LIMIT - current_balance;

        env.storage().instance().set(&DataKey::Balance(user.clone()), &(current_balance + minted));
        let total_supply = Self::total_supply(env.clone()) + minted;
        env.storage().instance().set(&DataKey::TotalSupply, &total_supply);
        env.storage().instance().set(&DataKey::UserLastMint(user.clone()), &now);

        env.events().publish((Symbol::new(&env, "mint"),), MintEvent{to: user, amount: minted});
    }

    // Mints new tokens to the admin, with no limit
    pub fn admin_mint(env: Env, amount: i128) {
        let caller = env.current_contract_address();
        caller.require_auth();

        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        if caller != admin {
            panic!("{:?}", AttorneyCoinError::AdminOnly);
        }

        let admin_balance = Self::balance_of(env.clone(), admin.clone());
        env.storage().instance().set(&DataKey::Balance(admin.clone()), &(admin_balance + amount));

        let new_supply = Self::total_supply(env.clone()) + amount;
        env.storage().instance().set(&DataKey::TotalSupply, &new_supply);

        env.events().publish((Symbol::new(&env, "mint"),), MintEvent{to: admin, amount});
    }
}