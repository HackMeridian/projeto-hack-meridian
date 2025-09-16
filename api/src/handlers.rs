use axum::{
    extract::State,
    http::StatusCode,
    response::Json,
};
use std::sync::Arc;
use crate::blockchain::BlockchainClient;
use crate::models::{
    ApiResponse, PaymentRequest, PaymentConfirmation
};

/// Estado compartilhado da aplicação
pub struct AppState {
    pub blockchain_client: Arc<BlockchainClient>,
}

/// Handler para processar um pagamento (mock)
pub async fn process_payment(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<PaymentRequest>,
) -> Result<Json<ApiResponse<PaymentConfirmation>>, StatusCode> {
    match state.blockchain_client.process_payment(&payload).await {
        Ok(confirmation) => Ok(Json(ApiResponse::success(confirmation))),
        Err(e) => {
            tracing::error!("Erro ao processar pagamento: {}", e);
            Ok(Json(ApiResponse::error(format!(
                "Erro ao processar pagamento: {}",
                e
            ))))
        }
    }
}
