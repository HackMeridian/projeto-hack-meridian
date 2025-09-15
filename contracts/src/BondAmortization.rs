#![no_std]

use soroban_sdk::{contractimpl, contracttype, Address, Env, Symbol, Vec, Map, panic_with_error, BytesN};

#[derive(Clone)]
#[contracttype]
pub enum BondStatus {
    ISSUED,
    MATURED,
    REDEEMED,
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
    pub bond_status: BondStatus,
}

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    PaymentsMade(Address, u32),
    LastPaymentTimestamp(Address, u32),
    Balance(Address),
}

pub struct BondAmortization;

#[contractimpl]
impl BondAmortization {
    pub fn transfer_amortization(
        env: Env,
        bond_id: u32,
        token_contract: BytesN<32>,
        bond_storage_contract: BytesN<32>,
        accumulated_contract: BytesN<32>,
    ) {
        let caller = env.invoker();

        let institution: Address = env.invoke_contract(
            &bond_storage_contract,
            &Symbol::short("institution"),
            (),
        );
        if caller != institution {
            panic_with_error!(&env, "You're not the issuer");
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
        if investor == Address::from_contract_id(&BytesN::from_array(&env, &[0; 32])) {
            panic_with_error!(&env, "Invalid investor address");
        }

        let payments = Self::get_payments_made(env.clone(), investor.clone(), bond_id);
        if payments >= bond.frequency {
            panic_with_error!(&env, "All amortizations already paid");
        }

        let principal_per_period = bond.denomination / bond.frequency as i128;
        let period_duration = (bond.maturity_date - bond.issue_date) / bond.frequency as u64;

        Self::deadline_count(
            env,
            bond,
            investor,
            bond_id,
            payments,
            period_duration,
            principal_per_period,
            accumulated_contract,
        );
    }

    fn deadline_count(
        env: Env,
        bond: Bond,
        investor: Address,
        bond_id: u32,
        payments: u32,
        period_duration: u64,
        principal_per_period: i128,
        accumulated_contract: BytesN<32>,
    ) {
        let key = DataKey::LastPaymentTimestamp(investor.clone(), bond_id);
        if env.storage().get::<_, u64>(&key).is_none() {
            env.storage().set(&key, &bond.issue_date);
        }

        let last_payment = env.storage().get::<_, u64>(&key).unwrap();
        let now = env.ledger().timestamp();
        let elapsed = now - last_payment;
        let mut periods_passed = (elapsed / period_duration) as u32;
        let remaining = bond.frequency - payments;

        if periods_passed > remaining {
            periods_passed = remaining;
        }

        if periods_passed == 0 {
            panic_with_error!(&env, "No amortization period has passed yet");
        }

        let new_last = last_payment + (periods_passed as u64 * period_duration);
        env.storage().set(&DataKey::LastPaymentTimestamp(investor.clone(), bond_id), &new_last);

        let mut total_remuneration: i128 = 0;
        for i in 0..periods_passed {
            total_remuneration += Self::calculate_remuneration(
                &env,
                &bond,
                &investor,
                principal_per_period,
                payments + i,
                &accumulated_contract,
            );
        }

        let old_balance = env.storage().get(&DataKey::Balance(investor.clone())).unwrap_or(Ok(0)).unwrap();
        env.storage().set(&DataKey::Balance(investor.clone()), &(old_balance + total_remuneration));

        let updated = payments + periods_passed;
        env.storage().set(&DataKey::PaymentsMade(investor.clone(), bond_id), &updated);
    }

    fn calculate_remuneration(
        env: &Env,
        bond: &Bond,
        _investor: &Address,
        principal_per_period: i128,
        payments: u32,
        accumulated_contract: &BytesN<32>,
    ) -> i128 {
        let remaining_principal = bond.denomination - (payments as i128 * principal_per_period);

        let latest_ipca: i128 = env.invoke_contract(
            accumulated_contract,
            &Symbol::short("get_ipca_accumulated"),
            (),
        );

        let correction_period = (principal_per_period * latest_ipca) / 1_000_000;
        let rate_period = (correction_period * bond.interest_rate as i128) / 100;

        let now = env.ledger().timestamp();
        let issue = bond.issue_date;

        let interest_after_tax = if now < issue + 180 * 86400 {
            rate_period - ((rate_period * 225) / 1000)
        } else if now <= issue + 360 * 86400 {
            rate_period - ((rate_period * 20) / 100)
        } else if now <= issue + 720 * 86400 {
            rate_period - ((rate_period * 175) / 1000)
        } else {
            rate_period - ((rate_period * 15) / 100)
        };

        correction_period + interest_after_tax
    }

    pub fn early_redemption(
        env: Env,
        bond_id: u32,
        token_contract: BytesN<32>,
        bond_storage_contract: BytesN<32>,
        monthly_contract: BytesN<32>,
    ) {
        let caller = env.invoker();

        let institution: Address = env.invoke_contract(
            &bond_storage_contract,
            &Symbol::short("institution"),
            (),
        );
        if caller != institution {
            panic_with_error!(&env, "You're not the issuer");
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
        if investor == Address::from_contract_id(&BytesN::from_array(&env, &[0; 32])) {
            panic_with_error!(&env, "Invalid investor address");
        }

        let key = DataKey::LastPaymentTimestamp(investor.clone(), bond_id);
        if env.storage().get::<_, u64>(&key).is_none() {
            env.storage().set(&key, &bond.issue_date);
        }

        let payments = Self::get_payments_made(env.clone(), investor.clone(), bond_id);
        if payments >= bond.frequency {
            panic_with_error!(&env, "Bond already fully amortized");
        }

        let principal_per_period = bond.denomination / bond.frequency as i128;
        let last_payment = env.storage().get::<_, u64>(&key).unwrap();
        let now = env.ledger().timestamp();

        if now <= last_payment {
            panic_with_error!(&env, "Invalid redemption time");
        }

        let redemption = Self::calculate_proportional_interest(
            &env,
            &bond,
            &investor,
            principal_per_period,
            payments,
            last_payment,
            &monthly_contract,
        );

        let old_balance = env.storage().get(&DataKey::Balance(investor.clone())).unwrap_or(Ok(0)).unwrap();
        env.storage().set(&DataKey::Balance(investor.clone()), &(old_balance + redemption));
        env.storage().set(&DataKey::PaymentsMade(investor.clone(), bond_id), &bond.frequency);
    }

    fn calculate_proportional_interest(
        env: &Env,
        bond: &Bond,
        investor: &Address,
        principal_per_period: i128,
        payments: u32,
        last_payment: u64,
        monthly_contract: &BytesN<32>,
    ) -> i128 {
        let remaining_principal = bond.denomination - (payments as i128 * principal_per_period);

        let now = env.ledger().timestamp();
        if now < last_payment {
            panic_with_error!(env, "Last payment timestamp is ahead of block timestamp");
        }

        let time_elapsed = now - last_payment;

        let correction_factor: i128 = env.invoke_contract(
            monthly_contract,
            &Symbol::short("get_ipca_factor"),
            (&last_payment, &now),
        );

        let correction_amount = ((principal_per_period * correction_factor) / 1_000_000) - principal_per_period;

        let period_duration = (bond.maturity_date - bond.issue_date) / bond.frequency as u64;

        let proportional_percentage = (time_elapsed as i128 * bond.interest_rate as i128) / period_duration as i128;
        let due_rate = ((remaining_principal + correction_amount) * proportional_percentage) / 100;

        let interest_after_tax = if now < bond.issue_date + 180 * 86400 {
            due_rate - ((due_rate * 225) / 1000)
        } else if now <= bond.issue_date + 360 * 86400 {
            due_rate - ((due_rate * 20) / 100)
        } else if now <= bond.issue_date + 720 * 86400 {
            due_rate - ((due_rate * 175) / 1000)
        } else {
            due_rate - ((due_rate * 15) / 100)
        };

        remaining_principal + correction_amount + interest_after_tax
    }

    pub fn get_payments_made(env: Env, investor: Address, bond_id: u32) -> u32 {
        env.storage()
            .get(&DataKey::PaymentsMade(investor, bond_id))
            .unwrap_or(Ok(0))
            .unwrap()
    }

    pub fn get_time_left(env: Env, investor: Address, bond_id: u32) -> u64 {
        env.storage()
            .get(&DataKey::LastPaymentTimestamp(investor, bond_id))
            .unwrap_or(Ok(0))
            .unwrap()
    }

    pub fn transfer_amortization_state(env: Env, bond_id: u32, from: Address, to: Address) {
        let payments = Self::get_payments_made(env.clone(), from.clone(), bond_id);
        let time = Self::get_time_left(env.clone(), from.clone(), bond_id);

        env.storage().set(&DataKey::PaymentsMade(to.clone(), bond_id), &payments);
        env.storage().set(&DataKey::LastPaymentTimestamp(to.clone(), bond_id), &env.ledger().timestamp());

        env.storage().remove(&DataKey::PaymentsMade(from, bond_id));
        env.storage().remove(&DataKey::LastPaymentTimestamp(from, bond_id));
    }
}
