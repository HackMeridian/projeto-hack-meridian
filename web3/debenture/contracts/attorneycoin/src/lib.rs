#![no_std]

pub mod attorneycoin;

use soroban_sdk::{contracterror, contracttype, Address, Symbol};

#[contracttype]
pub struct TransferEvent {
    pub from: Address,
    pub to: Address,
    pub amount: i128,
}

#[contracttype]
pub struct ApproveEvent {
    pub from: Address,
    pub to: Address,
    pub amount: i128,
}

#[contracttype]
pub struct MintEvent {
    pub to: Address,
    pub amount: i128,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    InsufficientBalance = 1,
    InsufficientAllowance = 2,
    MintingCapped = 3,
    DailyMintingReached = 4,
    AdminOnly = 5,
}



