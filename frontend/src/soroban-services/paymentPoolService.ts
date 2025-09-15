// frontend/src/services/sorobanService.ts
import {
  Server,
  Keypair,
  Contract,
  nativeToScVal,
  scValToNative,
  TransactionBuilder,
  BASE_FEE,
  Networks,
} from "soroban-client";

/**
 * NOTE: Não inicializamos Keypair.fromSecret nem coisas sensíveis no topo.
 * Isso evita erros quando import.meta.env.* for undefined durante o import do módulo.
 */

/** Lê RPC (com fallback) */
function getRpcUrl(): string {
  return import.meta.env.VITE_RPC_URL ?? "https://soroban-testnet.stellar.org";
}

/** Retorna Server (pode ser chamado no topo se preferir) */
function getServer(): Server {
  return new Server(getRpcUrl());
}

/** Retorna Keypair do payer se a VITE_SECRET_KEY estiver definida, senão null */
function getPayer(): Keypair | null {
  const secret = import.meta.env.VITE_SECRET_KEY;
  if (!secret) return null;
  try {
    return Keypair.fromSecret(secret);
  } catch (e) {
    console.error("Chave secreta inválida para Keypair.fromSecret:", e);
    return null;
  }
}

/** Retorna contractId se existir */
function getContractId(): string | null {
  return import.meta.env.VITE_CONTRACT_ID ?? null;
}

/**
 * Busca preço do bond (denomination).
 * - Se variáveis ambientes estiverem ausentes, retorna um mock (1000000n -> 1.00 USDC em micros).
 * - Tenta simular a transação para pegar retorno do contrato.
 */
export async function getBondPrice(): Promise<bigint> {
  const payer = getPayer();
  const contractId = getContractId();

  // modo offline/fallback caso envs não configuradas
  if (!payer || !contractId) {
    console.warn("getBondPrice: modo offline (envs ausentes), retornando valor mock.");
    return 1000000n;
  }

  const server = getServer();
  try {
    const account = await server.getAccount(payer.publicKey());
    const contract = new Contract(contractId);

    // chama a função view 'denomination' (ajuste o nome se for outro)
    const op = contract.call("denomination");

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(op)
      .setTimeout(30)
      .build();

    // simula para obter retval (não precisa assinar para simular)
    const simulation = await server.simulateTransaction(tx);
    console.log("Simulação getBondPrice:", simulation);

    // Segurança: checar se result.retval existe
    if ("result" in simulation && simulation.result && simulation.result.retval) {
      const native = scValToNative(simulation.result.retval);
      // scValToNative pode retornar number|string; convert para BigInt
      return BigInt(native as any);
    }

    throw new Error("Resposta da simulação não continha retval");
  } catch (err) {
    console.error("Erro em getBondPrice (online):", err);
    // fallback
    return 1000000n;
  }
}

/**
 * buyBonds: envia transação de compra.
 * - Em modo offline (envs ausentes) retorna um mock object.
 * - Quando envs presentes, monta tx, assina e envia.
 */
export async function buyBonds(amount: number) {
  const payer = getPayer();
  const contractId = getContractId();

  if (!payer || !contractId) {
    console.warn("buyBonds: modo offline (envs ausentes). Simulando compra.");
    await new Promise((r) => setTimeout(r, 600));
    return {
      success: true,
      txHash: `MOCK_TX_${Date.now()}`,
      message: `Compra simulada de ${amount} debênture(s).`,
    };
  }

  const server = getServer();
  try {
    const account = await server.getAccount(payer.publicKey());

    const amountScVal = nativeToScVal(amount, { type: "i128" });
    const payerScVal = nativeToScVal(payer.publicKey(), { type: "address" });

    const contract = new Contract(contractId);
    const op = contract.call(
      "deposit_usdc", // ajuste se o método no seu contrato difere
      payerScVal,
      amountScVal,
      nativeToScVal(1000000, { type: "i128" }) // denominação fixa; ideal: buscar via getBondPrice()
    );

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(op)
      .setTimeout(30)
      .build();

    tx.sign(payer);
    const result = await server.sendTransaction(tx);

    // result structure has different fields dependendo da versão; retornamos forma útil
    return {
      success: true,
      txHash: (result as any).hash ?? null,
      raw: result,
      message: "Transação enviada (online).",
    };
  } catch (err) {
    console.error("Erro buyBonds (online):", err);
    throw err;
  }
}
