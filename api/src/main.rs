use std::sync::Arc;
use tower::ServiceBuilder;
use tower_http::{
    cors::{Any, CorsLayer},
    trace::TraceLayer,
};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod models;
mod blockchain;
mod handlers;
mod routes;

use crate::blockchain::BlockchainClient;
use crate::handlers::AppState;
use crate::routes::create_router;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Inicializa o sistema de logging
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "debentures_api=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    // Carrega variáveis de ambiente
    dotenvy::dotenv().ok();

    // Configuração do blockchain
    let rpc_url = std::env::var("INFURA_URL")
        .expect("INFURA_URL deve estar definida no .env");
    
    let wallet_address = std::env::var("WALLET")
        .expect("WALLET deve estar definida no .env");
    
    let link_token_address = std::env::var("LINK_TOKEN")
        .expect("LINK_TOKEN deve estar definida no .env");
    
    let pol_token_address = std::env::var("POL_TOKEN")
        .expect("POL_TOKEN deve estar definida no .env");
    
    let atc_token_address = std::env::var("PAYMENT_TOKEN_ADDRESS")
        .expect("PAYMENT_TOKEN_ADDRESS deve estar definida no .env");
    
    let subscription_address = std::env::var("SUBSCRIPTION_ADDRESS")
        .expect("SUBSCRIPTION_ADDRESS deve estar definida no .env");

    // Mock mode
    let mock_mode = std::env::var("MOCK").ok().map(|v| v == "true" || v == "1").unwrap_or(false);

    // Cria o cliente blockchain
    let blockchain_client = Arc::new(BlockchainClient::new(
        rpc_url,
        wallet_address,
        link_token_address,
        pol_token_address,
        atc_token_address,
        subscription_address,
        mock_mode,
    ));

    // Cria o estado da aplicação
    let app_state = AppState {
        blockchain_client,
    };

    // Configura CORS
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Cria o router com middleware
    let app = create_router(app_state)
        .layer(
            ServiceBuilder::new()
                .layer(TraceLayer::new_for_http())
                .layer(cors),
        );

    // Obtém a porta do ambiente ou usa 3000 como padrão
    let port = std::env::var("PORT")
        .unwrap_or_else(|_| "3000".to_string())
        .parse::<u16>()
        .expect("PORT deve ser um número válido");

    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{}", port))
        .await
        .expect("Falha ao criar listener");

    tracing::info!("Servidor iniciado na porta {}", port);
    tracing::info!("API de Debêntures disponível em http://localhost:{}", port);
    tracing::info!("Endpoints disponíveis:");
    tracing::info!("GET /health - Health check");
    tracing::info!("GET /system/info - Informações do sistema");
    tracing::info!("GET /balances - Saldos de tokens");
    tracing::info!("GET /subscriptions - Todas as subscrições");
    tracing::info!("GET /subscriptions/:id - Subscrição específica");
    tracing::info!("GET /bonds/:id - Detalhes da debênture");
    tracing::info!("GET /amortizations - Amortizações pendentes");
    tracing::info!("GET /bot/status - Status do bot");
    tracing::info!("GET /ipca - Informações do IPCA");

    // Inicia o servidor
    axum::serve(listener, app).await?;

    Ok(())
}
