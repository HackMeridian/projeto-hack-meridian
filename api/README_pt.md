# API de Debêntures em Rust

Esta é uma API REST desenvolvida em Rust que se conecta com o backend de debêntures, fornecendo endpoints para consultar saldos, subscrições, amortizações e outras informações do sistema.

## 🚀 Funcionalidades

- **Consultar Saldos**: Obter saldos de POL, LINK e ATC tokens
- **Verificar Subscrições**: Status das subscrições Chainlink (434 e 438)
- **Detalhes de Debêntures**: Informações sobre debêntures específicas
- **Amortizações Pendentes**: Lista de amortizações que vencem em breve
- **Status do Bot**: Monitoramento do bot runner
- **Informações do IPCA**: Dados atualizados do IPCA

## 📋 Pré-requisitos

- Rust 1.70+ instalado
- Acesso a um nó RPC do Polygon (Infura, Alchemy, etc.)
- Variáveis de ambiente configuradas

## 🛠️ Instalação

1. Clone o repositório e navegue até a pasta da API:

```bash
cd rust-api
```

2. Copie o arquivo de exemplo de variáveis de ambiente:

```bash
cp env.example .env
```

3. Configure as variáveis de ambiente no arquivo `.env`:

```bash
# Configuração da API Rust
PORT=3000

# Configuração do Blockchain
INFURA_URL=https://polygon-mainnet.infura.io/v3/YOUR_INFURA_KEY
WALLET=0x1234567890123456789012345678901234567890
SECRET=your_private_key_here

# Endereços dos Contratos
LINK_TOKEN=0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39
POL_TOKEN=0x0000000000000000000000000000000000000000
PAYMENT_TOKEN_ADDRESS=0x1234567890123456789012345678901234567890
SUBSCRIPTION_ADDRESS=0x1234567890123456789012345678901234567890

# IDs das Subscrições
ACCUMULATED_SUBSCRIPTION_ID=434
MONTHLY_SUBSCRIPTION_ID=438
```

4. Compile e execute a API:

```bash
cargo run
```

## 📡 Endpoints da API

### Health Check

```http
GET /health
```

Retorna o status da API.

### Informações do Sistema

```http
GET /system/info
```

Retorna informações sobre a configuração do sistema.

### Saldos de Tokens

```http
GET /balances
```

Retorna os saldos de POL, LINK e ATC tokens da carteira.

**Resposta:**

```json
{
  "success": true,
  "data": {
    "pol_balance": "1.5",
    "link_balance": "10.0",
    "atc_balance": "100.0",
    "wallet_address": "0x1234..."
  },
  "error": null,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Subscrições

```http
GET /subscriptions
GET /subscriptions/:id
```

Retorna informações sobre as subscrições Chainlink.

**Resposta:**

```json
{
  "success": true,
  "data": [
    {
      "subscription_id": 434,
      "is_active": true,
      "balance_link": "2.5",
      "owner": "0x1234..."
    }
  ],
  "error": null,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Debêntures

```http
GET /bonds/:id
```

Retorna detalhes de uma debênture específica.

### Amortizações

```http
GET /amortizations
```

Retorna lista de amortizações pendentes.

### Status do Bot

```http
GET /bot/status
```

Retorna o status atual do bot runner.

### Informações do IPCA

```http
GET /ipca
```

Retorna informações atualizadas do IPCA.

## 🔧 Desenvolvimento

### Estrutura do Projeto

```
src/
├── main.rs          # Ponto de entrada da aplicação
├── models.rs        # Modelos de dados e estruturas
├── blockchain.rs    # Cliente para interação com blockchain
├── handlers.rs      # Handlers dos endpoints
└── routes.rs        # Configuração das rotas
```

### Adicionando Novos Endpoints

1. Defina o modelo de dados em `models.rs`
2. Implemente a lógica de negócio em `blockchain.rs`
3. Crie o handler em `handlers.rs`
4. Adicione a rota em `routes.rs`

### Testando a API

```bash
# Health check
curl http://localhost:3000/health

# Saldos
curl http://localhost:3000/balances

# Subscrições
curl http://localhost:3000/subscriptions
```

## 🚨 Notas Importantes

- Esta API é uma implementação simplificada para demonstração
- Em produção, você precisará implementar os ABIs reais dos contratos
- Configure adequadamente as variáveis de ambiente
- Implemente autenticação e autorização conforme necessário
- Adicione logs e monitoramento apropriados

## 📝 Licença

Este projeto está sob a licença ISC.
