# Exemplos de Uso da API de Debêntures

Este documento contém exemplos práticos de como usar a API de Debêntures em Rust.

## 🚀 Iniciando a API

```bash
# 1. Configure as variáveis de ambiente
cp env.example .env
# Edite o arquivo .env com suas configurações

# 2. Execute a API
cargo run

# Ou em modo desenvolvimento com logs detalhados
RUST_LOG=debug cargo run
```

## 📡 Exemplos de Requisições

### 1. Health Check

```bash
curl http://localhost:3000/health
```

**Resposta:**

```json
{
  "success": true,
  "data": "API está funcionando",
  "error": null,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### 2. Consultar Saldos

```bash
curl http://localhost:3000/balances
```

**Resposta:**

```json
{
  "success": true,
  "data": {
    "pol_balance": "1.5",
    "link_balance": "10.0",
    "atc_balance": "100.0",
    "wallet_address": "0x1234567890123456789012345678901234567890"
  },
  "error": null,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### 3. Verificar Subscrições

```bash
# Todas as subscrições
curl http://localhost:3000/subscriptions

# Subscrição específica
curl http://localhost:3000/subscriptions/434
```

**Resposta:**

```json
{
  "success": true,
  "data": [
    {
      "subscription_id": 434,
      "is_active": true,
      "balance_link": "2.5",
      "owner": "0x1234567890123456789012345678901234567890"
    },
    {
      "subscription_id": 438,
      "is_active": true,
      "balance_link": "2.5",
      "owner": "0x1234567890123456789012345678901234567890"
    }
  ],
  "error": null,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### 4. Detalhes de Debênture

```bash
curl http://localhost:3000/bonds/1
```

**Resposta:**

```json
{
  "success": true,
  "data": {
    "bond_id": 1,
    "investor": "0x1234567890123456789012345678901234567890",
    "issue_date": 1640995200,
    "maturity_date": 1672531200,
    "frequency": 12,
    "principal_amount": "1000.0",
    "interest_rate": "0.05"
  },
  "error": null,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### 5. Amortizações Pendentes

```bash
curl http://localhost:3000/amortizations
```

**Resposta:**

```json
{
  "success": true,
  "data": [
    {
      "bond_id": 1,
      "investor": "0x1234567890123456789012345678901234567890",
      "time_left": 3600,
      "next_due_date": "2024-01-01T13:00:00Z",
      "payments_made": 5,
      "total_payments": 12
    }
  ],
  "error": null,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### 6. Status do Bot

```bash
curl http://localhost:3000/bot/status
```

**Resposta:**

```json
{
  "success": true,
  "data": {
    "is_running": true,
    "last_execution": "2024-01-01T11:30:00Z",
    "next_execution": "2024-01-01T12:30:00Z",
    "current_cycle": "Verificando saldos e subscrições",
    "errors": []
  },
  "error": null,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### 7. Informações do IPCA

```bash
curl http://localhost:3000/ipca
```

**Resposta:**

```json
{
  "success": true,
  "data": {
    "accumulated_value": "5.25",
    "monthly_value": "0.44",
    "last_update": "2023-12-31T12:00:00Z",
    "is_updated": true
  },
  "error": null,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### 8. Informações do Sistema

```bash
curl http://localhost:3000/system/info
```

**Resposta:**

```json
{
  "success": true,
  "data": {
    "wallet_address": "0x1234567890123456789012345678901234567890",
    "rpc_url": "https://polygon-mainnet.infura.io/v3/...",
    "link_token": "0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39",
    "pol_token": "0x0000000000000000000000000000000000000000",
    "atc_token": "0x1234567890123456789012345678901234567890",
    "subscription_address": "0x1234567890123456789012345678901234567890",
    "version": "1.0.0",
    "uptime": "Running"
  },
  "error": null,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## 🧪 Testando com o Script

Execute o script de teste para verificar todos os endpoints:

```bash
./test_api.sh
```

## 🔧 Integração com Frontend

### JavaScript/TypeScript

```javascript
const API_BASE = 'http://localhost:3000'

// Função para fazer requisições
async function apiRequest(endpoint) {
  const response = await fetch(`${API_BASE}${endpoint}`)
  return await response.json()
}

// Exemplos de uso
const balances = await apiRequest('/balances')
const subscriptions = await apiRequest('/subscriptions')
const botStatus = await apiRequest('/bot/status')
```

### Python

```python
import requests

API_BASE = 'http://localhost:3000'

def api_request(endpoint):
    response = requests.get(f'{API_BASE}{endpoint}')
    return response.json()

# Exemplos de uso
balances = api_request('/balances')
subscriptions = api_request('/subscriptions')
bot_status = api_request('/bot/status')
```

## 🐳 Docker

```bash
# Construir a imagem
docker build -t debentures-api .

# Executar o container
docker run -p 3000:3000 --env-file .env debentures-api
```

## 📊 Monitoramento

A API inclui logs estruturados que podem ser monitorados:

```bash
# Logs em tempo real
RUST_LOG=debug cargo run

# Logs com filtro específico
RUST_LOG=debentures_api=info,tower_http=debug cargo run
```

## 🚨 Tratamento de Erros

Todos os endpoints retornam uma estrutura consistente:

```json
{
  "success": false,
  "data": null,
  "error": "Descrição do erro",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

Códigos de status HTTP:

- `200`: Sucesso
- `400`: Erro de requisição
- `500`: Erro interno do servidor
