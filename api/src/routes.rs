use axum::{
    routing::post,
    Router,
};
use crate::handlers::{self, AppState};

/// Configura todas as rotas da API
pub fn create_router(state: AppState) -> Router {
    Router::new()
        // Rota de pagamento
        .route("/payments", post(handlers::process_payment))
        .with_state(std::sync::Arc::new(state))
}
