#!/bin/bash

# Script para testar a API de Debêntures
# Certifique-se de que a API está rodando em http://localhost:3000

BASE_URL="http://localhost:3000"

echo "🧪 Testando API de Debêntures"
echo "================================"

# Health Check
echo "1. Health Check"
curl -s "$BASE_URL/health" | jq '.'
echo ""

# Informações do Sistema
echo "2. Informações do Sistema"
curl -s "$BASE_URL/system/info" | jq '.'
echo ""

# Saldos
echo "3. Saldos de Tokens"
curl -s "$BASE_URL/balances" | jq '.'
echo ""

# Subscrições
echo "4. Todas as Subscrições"
curl -s "$BASE_URL/subscriptions" | jq '.'
echo ""

# Subscrição específica
echo "5. Subscrição 434"
curl -s "$BASE_URL/subscriptions/434" | jq '.'
echo ""

# Detalhes de debênture
echo "6. Detalhes da Debênture 1"
curl -s "$BASE_URL/bonds/1" | jq '.'
echo ""

# Amortizações pendentes
echo "7. Amortizações Pendentes"
curl -s "$BASE_URL/amortizations" | jq '.'
echo ""

# Status do bot
echo "8. Status do Bot"
curl -s "$BASE_URL/bot/status" | jq '.'
echo ""

# Informações do IPCA
echo "9. Informações do IPCA"
curl -s "$BASE_URL/ipca" | jq '.'
echo ""

echo "✅ Testes concluídos!"
