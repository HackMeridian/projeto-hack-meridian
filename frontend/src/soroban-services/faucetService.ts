// frontend/src/services/faucetService.ts
import {
  Server,
  Keypair,
  Contract,
  nativeToScVal,
  TransactionBuilder,
  BASE_FEE,
  Networks,
} from "soroban-client";

/**
 * Service Soroban para 'mint' do faucet.
 * - Requer VITE_ATC_ADDRESS (ContractId) e VITE_RPC_URL opcionais.
 * - Requer VITE_SECRET_KEY para assinar a transação (dev/test).
 * - Ajuste `fnName` se o contrato usar nome diferente.
 */

/* ---------- helpers de env ---------- */
function getRpcUrl(): string {
  return (import.meta.env.VITE_RPC_URL as string) ?? "https://soroban-testnet.stellar.org";
}
function getServer(): Server {
  return new Server(getRpcUrl());
}
function getPayer(): Keypair | null {
  const secret = import.meta.env.VITE_SECRET_KEY as string | undefined;
  if (!secret) return null;
  try {
    return Keypair.fromSecret(secret);
  } catch (e) {
    console.error("VITE_SECRET_KEY inválida:", e);
    return null;
  }
}
function getContractId(): string | null {
  return (import.meta.env.VITE_ATC_ADDRESS as string) ?? null;
}

/* ---------- função pública: mint ---------- */
/**
 * Executa mint_to_user() no contrato Soroban.
 * Retorna txHash string se sucesso.
 */
export async function mint(): Promise<string> {
  const contractId = getContractId();
  if (!contractId) {
    throw new Error("VITE_ATC_ADDRESS ausente. Defina o endereço do contrato no .env (VITE_ATC_ADDRESS).");
  }

  // Payer obrigatório para construir/assinar tx
  const payer = getPayer();
  if (!payer) {
    throw new Error(
      "VITE_SECRET_KEY ausente. Defina VITE_SECRET_KEY no arquivo .env com a chave secreta da conta dev para assinar a transação."
    );
  }

  const server = getServer();

  try {
    // obtém account (pode lançar se conta não existir na testnet)
    const account = await server.getAccount(payer.publicKey());

    // Constrói operação de chamada ao contrato:
    // Ajuste fnName se o seu contrato tiver nome diferente (ex: mintToUser -> mint_to_user)
    const fnName = "mint_to_user";

    // Se a função precisar de args, adicione aqui usando nativeToScVal com hint
    const contract = new Contract(contractId);
    const op = contract.call(fnName /*, ...args se precisar */);

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(op)
      .setTimeout(30)
      .build();

    // Assina e envia
    tx.sign(payer);
    const result = await server.sendTransaction(tx);

    // Algumas versões retornam { hash } ou { transactionHash }, usamos as duas
    const txHash = (result as any).hash ?? (result as any).transactionHash ?? null;
    if (!txHash) {
      console.warn("Transação enviada, mas não retornou hash (result):", result);
      return JSON.stringify(result);
    }
    return txHash;
  } catch (err: any) {
    console.error("Erro ao executar mint (Soroban):", err);
    // normalize error message
    const msg = err?.message ? String(err.message) : String(err);
    throw new Error(`Erro mint: ${msg}`);
  }
}
