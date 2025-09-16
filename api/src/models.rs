use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

/// Requisição para processar um pagamento
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaymentRequest {
    pub bond_id: u64,
    pub amount: String,
    pub investor_address: String,
}

/// Confirmação de um pagamento processado
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaymentConfirmation {
    pub transaction_hash: String,
    pub bond_id: u64,
    pub amount_paid: String,
    pub status: String,
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
