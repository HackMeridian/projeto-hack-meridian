use axum::{
    routing::get,
    Router,
};
use crate::handlers::{AppState, get_balances, check_subscription, check_all_subscriptions, 
                     get_bond_details, get_upcoming_amortizations, get_bot_status, 
                     get_ipca_info, health_check, get_system_info};

/// Configura todas as rotas da API
pub fn create_router(state: AppState) -> Router {
    Router::new()
        // Health check
        .route("/health", get(health_check))
        
        // Informações do sistema
        .route("/system/info", get(get_system_info))
        
        // Saldos e tokens
        .route("/balances", get(get_balances))
        
        // Subscrições
        .route("/subscriptions", get(check_all_subscriptions))
        .route("/subscriptions/:id", get(check_subscription))
        
        // Debêntures
        .route("/bonds/:id", get(get_bond_details))
        .route("/amortizations", get(get_upcoming_amortizations))
        
        // Status do bot
        .route("/bot/status", get(get_bot_status))
        
        // IPCA
        .route("/ipca", get(get_ipca_info))
        
        .with_state(std::sync::Arc::new(state))
}
