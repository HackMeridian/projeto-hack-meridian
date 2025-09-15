import {
  Server,
  Keypair,
  Contract,
  TransactionBuilder,
  BASE_FEE,
  Networks,
  scValToNative,
} from "soroban-client";

/**
 * Service para consultar getters do BondStorage no Soroban.
 * - Modo online: usa import.meta.env.VITE_CONTRACT_ID e VITE_SECRET_KEY (opcional).
 * - Modo offline: retorna mocks para não quebrar a UI.
 */

// RPC (fallback pro testnet)
function getRpcUrl(): string {
  return import.meta.env.VITE_RPC_URL ?? "https://soroban-testnet.stellar.org";
}

function getServer(): Server {
  return new Server(getRpcUrl());
}

function getPayer(): Keypair | null {
  const secret = import.meta.env.VITE_SECRET_KEY;
  if (!secret) return null;
  try {
    return Keypair.fromSecret(secret);
  } catch (e) {
    console.warn("Keypair.fromSecret falhou:", e);
    return null;
  }
}

function getContractId(): string | null {
  return import.meta.env.VITE_BONDSTORAGE_ID ?? import.meta.env.VITE_CONTRACT_ID ?? null;
}

/** Helper que converte scValToNative em string legível */
function scValToString(scVal: any): string {
  try {
    const native = scValToNative(scVal);
    if (native === null || typeof native === "undefined") return String(native);
    // Arrays/objects -> stringify
    if (typeof native === "object") return JSON.stringify(native, null, 2);
    return String(native);
  } catch (e) {
    // fallback
    try {
      return JSON.stringify(scVal);
    } catch {
      return String(scVal);
    }
  }
}

/**
 * Consulta um getter simples do contrato que não precisa de assinatura.
 * Retorna string (representação legível).
 */
export async function getBondField(fieldName: string): Promise<string> {
  const contractId = getContractId();
  const payer = getPayer();

  // modo mock/fallback se envs não configuradas
  if (!contractId || !payer) {
    console.warn("getBondField: modo offline (envs ausentes). Retornando mock.");
    const mocks: Record<string, string> = {
      isin: "BREMISDEB5H2",
      name: "1ª Emissão - Série Única",
      symbol: "BREMIS",
      currency: "G... (endereço mock)",
      denomination: "1000000", // 1.000000 (considerando 6 casas)
      frequency: "8",
      interestRate: "4",
      _name: "Emissora XYZ",
      institution: "G... (endereço emissora)",
    };
    return mocks[fieldName] ?? "MOCK_VALUE";
  }

  const server = getServer();
  try {
    const account = await server.getAccount(payer.publicKey());
    const contract = new Contract(contractId);

    // monta operação de chamada do getter
    const op = contract.call(fieldName);

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(op)
      .setTimeout(30)
      .build();

    // simula (não precisa assinar para ler)
    const simulation = await server.simulateTransaction(tx);
    // Segurança no acesso ao result
    if ("result" in simulation && simulation.result && simulation.result.retval) {
      return scValToString(simulation.result.retval);
    }

    throw new Error("Simulação não retornou retval");
  } catch (err) {
    console.error("Erro em getBondField:", err);
    throw err;
  }
}

/**
 * Consulta múltiplos campos em paralelo.
 * Retorna um mapa { fieldName: string }
 */
export async function getBondFields(fieldNames: string[]): Promise<Record<string, string>> {
  // executa em paralelo com Promise.allSettled para tolerância a erros
  const promises = fieldNames.map((f) =>
    getBondField(f)
      .then((v) => ({ name: f, value: v }))
      .catch((e) => ({ name: f, value: `ERROR: ${String(e?.message ?? e)}` }))
  );
  const settled = await Promise.all(promises);
  const result: Record<string, string> = {};
  settled.forEach((s) => {
    result[s.name] = s.value;
  });
  return result;
}
