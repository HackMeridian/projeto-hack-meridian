# Debentures API in Rust

This is a REST API developed in Rust that connects with the debentures backend, providing endpoints to query balances, subscriptions, amortizations, and other system information.

## 🚀 Features

- **Query Balances**: Get POL, LINK, and ATC token balances
- **Check Subscriptions**: Status of Chainlink subscriptions (434 and 438)
- **Debenture Details**: Information about specific debentures
- **Pending Amortizations**: List of amortizations that are due soon
- **Bot Status**: Monitoring of the bot runner
- **IPCA Information**: Updated IPCA data

## 📋 Prerequisites

- Rust 1.70+ installed
- Access to a Polygon RPC node (Infura, Alchemy, etc.)
- Environment variables configured

## 🛠️ Installation

1. Clone the repository and navigate to the API folder:

```bash
cd rust-api
```

2. Copy the example environment variables file:

```bash
cp env.example .env
```

3. Configure the environment variables in the `.env` file:

```bash
# Rust API Configuration
PORT=3000

# Blockchain Configuration
INFURA_URL=https://polygon-mainnet.infura.io/v3/YOUR_INFURA_KEY
WALLET=0x1234567890123456789012345678901234567890
SECRET=your_private_key_here

# Contract Addresses
LINK_TOKEN=0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39
POL_TOKEN=0x0000000000000000000000000000000000000000
PAYMENT_TOKEN_ADDRESS=0x1234567890123456789012345678901234567890
SUBSCRIPTION_ADDRESS=0x1234567890123456789012345678901234567890

# Subscription IDs
ACCUMULATED_SUBSCRIPTION_ID=434
MONTHLY_SUBSCRIPTION_ID=438
```

4. Compile and run the API:

```bash
cargo run
```

## 📡 API Endpoints

### Health Check

```http
GET /health
```

Returns the API status.

### System Information

```http
GET /system/info
```

Returns information about the system configuration.

### Token Balances

```http
GET /balances
```

Returns the POL, LINK, and ATC token balances of the wallet.

**Response:**

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

### Subscriptions

```http
GET /subscriptions
GET /subscriptions/:id
```

Returns information about Chainlink subscriptions.

**Response:**

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

### Debentures

```http
GET /bonds/:id
```

Returns details of a specific debenture.

### Amortizations

```http
GET /amortizations
```

Returns a list of pending amortizations.

### Bot Status

```http
GET /bot/status
```

Returns the current status of the bot runner.

### IPCA Information

```http
GET /ipca
```

Returns updated IPCA information.

## 🔧 Development

### Project Structure

```
src/
├── main.rs          # Application entry point
├── models.rs        # Data models and structures
├── blockchain.rs    # Client for blockchain interaction
├── handlers.rs      # Endpoint handlers
└── routes.rs        # Route configuration
```

### Adding New Endpoints

1. Define the data model in `models.rs`
2. Implement the business logic in `blockchain.rs`
3. Create the handler in `handlers.rs`
4. Add the route in `routes.rs`

### Testing the API

```bash
# Health check
curl http://localhost:3000/health

# Balances
curl http://localhost:3000/balances

# Subscriptions
curl http://localhost:3000/subscriptions
```

## 🚨 Important Notes

- This API is a simplified implementation for demonstration purposes
- In production, you will need to implement the actual ABIs of the contracts
- Configure the environment variables properly
- Implement authentication and authorization as needed
- Add appropriate logging and monitoring

## 📝 License

This project is under the ISC license.
