// frontend/src/soroban-service/dashboardService.ts
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

/* ---------- helpers de env e contrato ---------- */
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
    console.error("Chave secreta inválida:", e);
    return null;
  }
}
function getContractId(kind: "minting" | "custody" | "correction" | "monthly"): string | null {
  if (kind === "minting") return (import.meta.env.VITE_TOKENMINTING_ADDRESS as string) ?? null;
  if (kind === "custody") return (import.meta.env.VITE_TOKENCUSTODY_ADDRESS as string) ?? null;
  if (kind === "correction") return (import.meta.env.VITE_ACCUMULATEDCORRECTION_ADDRESS as string) ?? null;
  if (kind === "monthly") return (import.meta.env.VITE_MONTHLYCORRECTION_ADDRESS as string) ?? null;
  return null;
}

/* ---------- conversão JS -> scVal com hint obrigatório ---------- */
function toScValHinted(a: any) {
  if (typeof a === "bigint") return nativeToScVal(a, { type: "i128" });
  if (typeof a === "number") return nativeToScVal(a, { type: "i128" });
  if (typeof a === "boolean") return nativeToScVal(a, { type: "bool" });
  if (typeof a === "string") {
    // heurística: se parecer com public key Stellar (começa com G), marque como address
    if (a.startsWith("G") && a.length > 20) {
      return nativeToScVal(a, { type: "address" });
    }
    // senão trate como símbolo/string
    return nativeToScVal(a, { type: "symbol" });
  }
  if (Array.isArray(a)) {
    // converte cada elemento recursivamente; passa 'vec' como hint
    const vec = a.map((el) => toScValHinted(el));
    return nativeToScVal(vec as any, { type: "vec" });
  }
  // objetos: serializa para string (symbol) - ajuste se seu contrato espera map específico
  try {
    return nativeToScVal(JSON.stringify(a), { type: "symbol" });
  } catch {
    return nativeToScVal(String(a), { type: "symbol" });
  }
}

/* ---------- simulação de chamada view ---------- */
async function simulateContractView(contractId: string, fnName: string, ...args: any[]): Promise<any> {
  const payer = getPayer();
  if (!payer) {
    throw new Error(
      "VITE_SECRET_KEY ausente: não é possível simular chamada. Defina VITE_SECRET_KEY no .env ou ajuste a simulação."
    );
  }

  const server = getServer();

  // pode lançar se a conta não existir — deixamos propagar para o caller tratar
  const account = await server.getAccount(payer.publicKey());

  const scArgs = args.map((a) => toScValHinted(a));

  const contract = new Contract(contractId);
  const op = contract.call(fnName, ...scArgs);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(op)
    .setTimeout(30)
    .build();

  const simulation = await server.simulateTransaction(tx);

  if ("result" in simulation && simulation.result && simulation.result.retval) {
    return scValToNative(simulation.result.retval);
  }
  throw new Error("Simulação retornou sem retval");
}

/* ---------- API pública (mesmos nomes que seu Dashboard espera) ---------- */

export async function callTotalSupply(): Promise<any> {
  const contractId = getContractId("minting");
  if (!contractId) {
    console.warn("callTotalSupply: VITE_TOKENMINTING_ADDRESS ausente — retornando mock.");
    return "1000000000000";
  }
  try {
    const fnName = "max_total_supply"; // <--- ajuste aqui se seu contrato usa outro nome
    const res = await simulateContractView(contractId, fnName);
    return res;
  } catch (e) {
    console.error("callTotalSupply erro:", e);
    return "1000000000000";
  }
}

export async function callTotalValueLocked(): Promise<any> {
  const contractId = getContractId("custody");
  if (!contractId) {
    console.warn("callTotalValueLocked: VITE_TOKENCUSTODY_ADDRESS ausente — retornando mock.");
    return "0";
  }
  try {
    const fnName = "get_total_bonds_deposited"; // <--- ajuste se necessário
    const res = await simulateContractView(contractId, fnName, 0);
    return res;
  } catch (e) {
    console.error("callTotalValueLocked erro:", e);
    return "0";
  }
}

export async function callLatestIPCA(): Promise<any> {
  const contractId = getContractId("correction");
  if (!contractId) {
    console.warn("callLatestIPCA: VITE_ACCUMULATEDCORRECTION_ADDRESS ausente — retornando mock.");
    return BigInt(0);
  }
  try {
    const fnName = "latest_ipca"; // <--- ajuste se necessário
    const res = await simulateContractView(contractId, fnName);
    return res;
  } catch (e) {
    console.error("callLatestIPCA erro:", e);
    return BigInt(0);
  }
}

export async function callLatestIPCAHistory(index: number): Promise<any> {
  const contractId = getContractId("monthly");
  if (!contractId) {
    console.warn("callLatestIPCAHistory: VITE_MONTHLYCORRECTION_ADDRESS ausente — retornando mock.");
    return BigInt(0);
  }
  try {
    const fnName = "latest_ipca_history"; // <--- ajuste se necessário
    const res = await simulateContractView(contractId, fnName, index);
    return res;
  } catch (e) {
    console.error("callLatestIPCAHistory erro:", e);
    return BigInt(0);
  }
}
