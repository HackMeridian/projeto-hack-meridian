use anyhow::{Result, anyhow};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use num_bigint::BigUint;
use crate::models::{TokenBalances, SubscriptionInfo, BondDetails, AmortizationInfo};

/// Estrutura para requisições JSON-RPC
#[derive(Debug, Serialize, Deserialize)]
struct JsonRpcRequest {
    jsonrpc: String,
    method: String,
    params: Vec<serde_json::Value>,
    id: u64,
}

#[derive(Debug, Serialize, Deserialize)]
struct JsonRpcResponse {
    jsonrpc: String,
    result: Option<serde_json::Value>,
    error: Option<JsonRpcError>,
    id: u64,
}

#[derive(Debug, Serialize, Deserialize)]
struct JsonRpcError {
    code: i32,
    message: String,
}

/// Cliente para interação com blockchain
pub struct BlockchainClient {
    client: Client,
    pub rpc_url: String,
    pub wallet_address: String,
    pub link_token_address: String,
    pub pol_token_address: String,
    pub atc_token_address: String,
    pub subscription_address: String,
    pub mock_mode: bool,
}

impl BlockchainClient {
    pub fn new(
        rpc_url: String,
        wallet_address: String,
        link_token_address: String,
        pol_token_address: String,
        atc_token_address: String,
        subscription_address: String,
        mock_mode: bool,
    ) -> Self {
        Self {
            client: Client::new(),
            rpc_url,
            wallet_address,
            link_token_address,
            pol_token_address,
            atc_token_address,
            subscription_address,
            mock_mode,
        }
    }

    /// Faz uma chamada JSON-RPC para o blockchain
    async fn call_rpc(&self, method: &str, params: Vec<serde_json::Value>) -> Result<serde_json::Value> {
        let request = JsonRpcRequest {
            jsonrpc: "2.0".to_string(),
            method: method.to_string(),
            params,
            id: 1,
        };

        let response = self.client
            .post(&self.rpc_url)
            .json(&request)
            .send()
            .await?;

        let json_response: JsonRpcResponse = response.json().await?;

        if let Some(error) = json_response.error {
            return Err(anyhow!("RPC Error: {}", error.message));
        }

        json_response.result
            .ok_or_else(|| anyhow!("No result in RPC response"))
    }

    /// Converte hex string para BigUint
    fn hex_to_biguint(hex: &str) -> Result<BigUint> {
        let hex = hex.trim_start_matches("0x");
        BigUint::parse_bytes(hex.as_bytes(), 16)
            .ok_or_else(|| anyhow!("Invalid hex string: {}", hex))
    }

    /// Formata BigUint para string com casas decimais
    fn format_token_amount(amount: &BigUint, decimals: u32) -> String {
        let divisor = BigUint::from(10u32).pow(decimals);
        let integer_part = amount / &divisor;
        let fractional_part = amount % &divisor;
        
        if fractional_part == BigUint::from(0u32) {
            integer_part.to_string()
        } else {
            format!("{}.{}", integer_part, fractional_part)
        }
    }

    /// Obtém saldo de um token ERC20
    async fn get_erc20_balance(&self, token_address: &str, wallet_address: &str) -> Result<String> {
        // balanceOf(address) - função ERC20
        let data = format!("0x70a08231000000000000000000000000{}", 
                          wallet_address.trim_start_matches("0x"));
        
        let params = vec![
            serde_json::json!({
                "to": token_address,
                "data": data
            }),
            serde_json::json!("latest")
        ];

        let result = self.call_rpc("eth_call", params).await?;
        let hex_result = result.as_str()
            .ok_or_else(|| anyhow!("Invalid result format"))?;

        let balance = Self::hex_to_biguint(hex_result)?;
        Ok(Self::format_token_amount(&balance, 18))
    }

    /// Obtém saldo nativo (POL)
    async fn get_native_balance(&self, wallet_address: &str) -> Result<String> {
        let params = vec![
            serde_json::json!(wallet_address),
            serde_json::json!("latest")
        ];

        let result = self.call_rpc("eth_getBalance", params).await?;
        let hex_result = result.as_str()
            .ok_or_else(|| anyhow!("Invalid result format"))?;

        let balance = Self::hex_to_biguint(hex_result)?;
        Ok(Self::format_token_amount(&balance, 18))
    }

    /// Obtém todos os saldos de tokens
    pub async fn get_token_balances(&self) -> Result<TokenBalances> {
        if self.mock_mode {
            return Ok(TokenBalances {
                pol_balance: "1.23".to_string(),
                link_balance: "5.00".to_string(),
                atc_balance: "100.0".to_string(),
                wallet_address: self.wallet_address.clone(),
            });
        }
        let pol_balance = self.get_native_balance(&self.wallet_address).await?;
        let link_balance = self.get_erc20_balance(&self.link_token_address, &self.wallet_address).await?;
        let atc_balance = self.get_erc20_balance(&self.atc_token_address, &self.wallet_address).await?;

        Ok(TokenBalances {
            pol_balance,
            link_balance,
            atc_balance,
            wallet_address: self.wallet_address.clone(),
        })
    }

    /// Verifica status de uma subscrição
    pub async fn check_subscription(&self, subscription_id: u64) -> Result<SubscriptionInfo> {
        if self.mock_mode {
            return Ok(SubscriptionInfo {
                subscription_id,
                is_active: true,
                balance_link: "2.50".to_string(),
                owner: self.wallet_address.clone(),
            });
        }
        // getSubscription(uint64) - função do contrato de subscrição
        let data = format!("0x8a0ba37b{:064x}", subscription_id);
        
        let params = vec![
            serde_json::json!({
                "to": self.subscription_address,
                "data": data
            }),
            serde_json::json!("latest")
        ];

        let result = self.call_rpc("eth_call", params).await?;
        let hex_result = result.as_str()
            .ok_or_else(|| anyhow!("Invalid result format"))?;

        // Parse da resposta (owner + balance)
        if hex_result.len() < 130 {
            return Err(anyhow!("Invalid subscription response"));
        }

        let owner = format!("0x{}", &hex_result[26..66]);
        let balance_hex = &hex_result[66..130];
        let balance = Self::hex_to_biguint(balance_hex)?;
        let balance_link = Self::format_token_amount(&balance, 18);

        let is_active = balance > BigUint::from(0u32) && owner != "0x0000000000000000000000000000000000000000";

        Ok(SubscriptionInfo {
            subscription_id,
            is_active,
            balance_link,
            owner,
        })
    }

    /// Obtém detalhes de uma debênture
    pub async fn get_bond_details(&self, bond_id: u64) -> Result<BondDetails> {
        if self.mock_mode {
            return Ok(BondDetails {
                bond_id,
                investor: self.wallet_address.clone(),
                issue_date: 1704067200, // 2024-01-01
                maturity_date: 1735689600, // 2025-01-01
                frequency: 12,
                principal_amount: "1000.0".to_string(),
                interest_rate: "0.05".to_string(),
            });
        }
        // getBondDetails(uint256) - função do contrato de minting
        let _data = format!("0x{:08x}{:064x}", 0x12345678, bond_id); // Placeholder para função real
        
        // Esta é uma implementação simplificada
        // Em produção, você precisaria dos ABIs reais dos contratos
        Ok(BondDetails {
            bond_id,
            investor: self.wallet_address.clone(),
            issue_date: 1640995200, // 2022-01-01
            maturity_date: 1672531200, // 2023-01-01
            frequency: 12, // mensal
            principal_amount: "1000.0".to_string(),
            interest_rate: "0.05".to_string(), // 5%
        })
    }

    /// Obtém amortizações pendentes
    pub async fn get_upcoming_amortizations(&self) -> Result<Vec<AmortizationInfo>> {
        // Implementação simplificada
        // Em produção, você precisaria iterar pelos bonds e verificar pagamentos
        let now_plus_1h = chrono::Utc::now() + chrono::Duration::hours(1);
        Ok(vec![
            AmortizationInfo {
                bond_id: 1,
                investor: self.wallet_address.clone(),
                time_left: 3600, // 1 hora
                next_due_date: now_plus_1h,
                payments_made: 5,
                total_payments: 12,
            }
        ])
    }
}
