#!/bin/bash

# Script para testar a API de Debêntures
# Certifique-se de que a API está rodando em http://localhost:3000

BASE_URL="http://localhost:3000"

echo "🧪 Testando API de Debêntures"
echo "================================"

# Pagamento (mock)
echo "1. Processar Pagamento (Mock)"
curl -s -X POST "$BASE_URL/payments" \
-H "Content-Type: application/json" \
-d '{"bond_id": 1, "amount": "100.0", "investor_address": "0x1234567890123456789012345678901234567890"}' | jq '.'
echo ""

echo "✅ Testes concluídos!"
