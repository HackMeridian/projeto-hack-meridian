use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

/// Representa os saldos de diferentes tokens
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TokenBalances {
    pub pol_balance: String,
    pub link_balance: String,
    pub atc_balance: String,
    pub wallet_address: String,
}

/// Informações sobre uma subscrição
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SubscriptionInfo {
    pub subscription_id: u64,
    pub is_active: bool,
    pub balance_link: String,
    pub owner: String,
}

/// Detalhes de uma debênture
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BondDetails {
    pub bond_id: u64,
    pub investor: String,
    pub issue_date: u64,
    pub maturity_date: u64,
    pub frequency: u64,
    pub principal_amount: String,
    pub interest_rate: String,
}

/// Informações sobre amortizações pendentes
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AmortizationInfo {
    pub bond_id: u64,
    pub investor: String,
    pub time_left: u64,
    pub next_due_date: DateTime<Utc>,
    pub payments_made: u64,
    pub total_payments: u64,
}

/// Resposta de status da API
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
    pub timestamp: DateTime<Utc>,
}

impl<T> ApiResponse<T> {
    pub fn success(data: T) -> Self {
        Self {
            success: true,
            data: Some(data),
            error: None,
            timestamp: Utc::now(),
        }
    }

    pub fn error(error: String) -> Self {
        Self {
            success: false,
            data: None,
            error: Some(error),
            timestamp: Utc::now(),
        }
    }
}

/// Configuração do sistema
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemConfig {
    pub rpc_url: String,
    pub wallet_address: String,
    pub link_token_address: String,
    pub pol_token_address: String,
    pub atc_token_address: String,
    pub subscription_address: String,
    pub accumulated_subscription_id: u64,
    pub monthly_subscription_id: u64,
}

/// Status do bot runner
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BotStatus {
    pub is_running: bool,
    pub last_execution: Option<DateTime<Utc>>,
    pub next_execution: Option<DateTime<Utc>>,
    pub current_cycle: String,
    pub errors: Vec<String>,
}

/// Informações sobre IPCA
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IPCAInfo {
    pub accumulated_value: String,
    pub monthly_value: String,
    pub last_update: DateTime<Utc>,
    pub is_updated: bool,
}
