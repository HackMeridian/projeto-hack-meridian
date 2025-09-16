use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::Json,
};
use std::sync::Arc;
use crate::blockchain::BlockchainClient;
use crate::models::{
    ApiResponse, TokenBalances, SubscriptionInfo, BondDetails, 
    AmortizationInfo, BotStatus, IPCAInfo
};

/// Estado compartilhado da aplicação
pub struct AppState {
    pub blockchain_client: Arc<BlockchainClient>,
}

/// Handler para obter saldos de tokens
pub async fn get_balances(
    State(state): State<Arc<AppState>>,
) -> Result<Json<ApiResponse<TokenBalances>>, StatusCode> {
    match state.blockchain_client.get_token_balances().await {
        Ok(balances) => Ok(Json(ApiResponse::success(balances))),
        Err(e) => {
            tracing::error!("Erro ao obter saldos: {}", e);
            Ok(Json(ApiResponse::error(format!("Erro ao obter saldos: {}", e))))
        }
    }
}

/// Handler para verificar uma subscrição específica
pub async fn check_subscription(
    State(state): State<Arc<AppState>>,
    Path(subscription_id): Path<u64>,
) -> Result<Json<ApiResponse<SubscriptionInfo>>, StatusCode> {
    match state.blockchain_client.check_subscription(subscription_id).await {
        Ok(subscription) => Ok(Json(ApiResponse::success(subscription))),
        Err(e) => {
            tracing::error!("Erro ao verificar subscrição {}: {}", subscription_id, e);
            Ok(Json(ApiResponse::error(format!("Erro ao verificar subscrição: {}", e))))
        }
    }
}

/// Handler para verificar todas as subscrições
pub async fn check_all_subscriptions(
    State(state): State<Arc<AppState>>,
) -> Result<Json<ApiResponse<Vec<SubscriptionInfo>>>, StatusCode> {
    let mut subscriptions = Vec::new();
    
    // Verifica subscrição 434 (Accumulated IPCA)
    match state.blockchain_client.check_subscription(434).await {
        Ok(sub) => subscriptions.push(sub),
        Err(e) => {
            tracing::error!("Erro ao verificar subscrição 434: {}", e);
        }
    }
    
    // Verifica subscrição 438 (Monthly IPCA)
    match state.blockchain_client.check_subscription(438).await {
        Ok(sub) => subscriptions.push(sub),
        Err(e) => {
            tracing::error!("Erro ao verificar subscrição 438: {}", e);
        }
    }
    
    Ok(Json(ApiResponse::success(subscriptions)))
}

/// Handler para obter detalhes de uma debênture
pub async fn get_bond_details(
    State(state): State<Arc<AppState>>,
    Path(bond_id): Path<u64>,
) -> Result<Json<ApiResponse<BondDetails>>, StatusCode> {
    match state.blockchain_client.get_bond_details(bond_id).await {
        Ok(bond) => Ok(Json(ApiResponse::success(bond))),
        Err(e) => {
            tracing::error!("Erro ao obter detalhes da debênture {}: {}", bond_id, e);
            Ok(Json(ApiResponse::error(format!("Erro ao obter detalhes da debênture: {}", e))))
        }
    }
}

/// Handler para obter amortizações pendentes
pub async fn get_upcoming_amortizations(
    State(state): State<Arc<AppState>>,
) -> Result<Json<ApiResponse<Vec<AmortizationInfo>>>, StatusCode> {
    match state.blockchain_client.get_upcoming_amortizations().await {
        Ok(amortizations) => Ok(Json(ApiResponse::success(amortizations))),
        Err(e) => {
            tracing::error!("Erro ao obter amortizações pendentes: {}", e);
            Ok(Json(ApiResponse::error(format!("Erro ao obter amortizações pendentes: {}", e))))
        }
    }
}

/// Handler para obter status do bot
pub async fn get_bot_status(
    State(_state): State<Arc<AppState>>,
) -> Result<Json<ApiResponse<BotStatus>>, StatusCode> {
    // Implementação simplificada - em produção você manteria o estado real
    let status = BotStatus {
        is_running: true,
        last_execution: Some(chrono::Utc::now() - chrono::Duration::minutes(30)),
        next_execution: Some(chrono::Utc::now() + chrono::Duration::minutes(30)),
        current_cycle: "Verificando saldos e subscrições".to_string(),
        errors: vec![],
    };
    
    Ok(Json(ApiResponse::success(status)))
}

/// Handler para obter informações do IPCA
pub async fn get_ipca_info(
    State(_state): State<Arc<AppState>>,
) -> Result<Json<ApiResponse<IPCAInfo>>, StatusCode> {
    // Implementação simplificada - em produção você buscaria dados reais
    let ipca_info = IPCAInfo {
        accumulated_value: "5.25".to_string(),
        monthly_value: "0.44".to_string(),
        last_update: chrono::Utc::now() - chrono::Duration::days(1),
        is_updated: true,
    };
    
    Ok(Json(ApiResponse::success(ipca_info)))
}

/// Handler para health check
pub async fn health_check() -> Result<Json<ApiResponse<String>>, StatusCode> {
    Ok(Json(ApiResponse::success("API está funcionando".to_string())))
}

/// Handler para obter informações do sistema
pub async fn get_system_info(
    State(state): State<Arc<AppState>>,
) -> Result<Json<ApiResponse<serde_json::Value>>, StatusCode> {
    let info = serde_json::json!({
        "wallet_address": state.blockchain_client.wallet_address,
        "rpc_url": state.blockchain_client.rpc_url,
        "link_token": state.blockchain_client.link_token_address,
        "pol_token": state.blockchain_client.pol_token_address,
        "atc_token": state.blockchain_client.atc_token_address,
        "subscription_address": state.blockchain_client.subscription_address,
        "mock_mode": state.blockchain_client.mock_mode,
        "version": "1.0.0",
        "uptime": "Running"
    });
    
    Ok(Json(ApiResponse::success(info)))
}
