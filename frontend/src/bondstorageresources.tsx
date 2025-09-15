import React, { useState } from "react";
import { getBondField, getBondFields } from "./soroban-services/bondStorageService";
import "./global.css";
import BottomNav from "./bottomnav";

type FunctionItem = {
  label: string;
  name: string;
};

const functions: FunctionItem[] = [
  { label: "ISIN", name: "isin" },
  { label: "Emissões e Séries", name: "name" },
  { label: "Código de Negociação de Título", name: "symbol" },
  { label: "Moeda Corrente (endereço da conta)", name: "currency" },
  { label: "Valor Nominal (6 casas decimais)", name: "denomination" },
  { label: "Parcelas Amortizadas", name: "frequency" },
  { label: "Taxa de Juros (%)", name: "interestRate" },
  { label: "Emissora", name: "_name" },
  { label: "Conta de Pagamento à Emissora", name: "institution" },
];

type StateMap = {
  [key: string]: string;
};

function BondStorage() {
  const [results, setResults] = useState<StateMap>({});
  const [loading, setLoading] = useState<StateMap>({});
  const [error, setError] = useState<StateMap>({});

  async function consultar(fnName: string) {
    try {
      setLoading((prev) => ({ ...prev, [fnName]: "true" }));
      setError((prev) => ({ ...prev, [fnName]: "" }));

      const res = await getBondField(fnName);

      setResults((prev) => ({ ...prev, [fnName]: res }));
    } catch (err) {
      console.error("Erro ao consultar", fnName, err);
      setError((prev) => ({ ...prev, [fnName]: "Erro na consulta. Verifique a conexão ou o contrato." }));
    } finally {
      setLoading((prev) => ({ ...prev, [fnName]: "" }));
    }
  }

  async function consultarTodas() {
    const names = functions.map((f) => f.name);
    // mostra loading para todos
    const loadingInit: StateMap = {};
    names.forEach((n) => (loadingInit[n] = "true"));
    setLoading((prev) => ({ ...prev, ...loadingInit }));
    setError({});

    try {
      const map = await getBondFields(names);
      setResults((prev) => ({ ...prev, ...map }));
    } catch (err) {
      console.error("Erro consultarTodas:", err);
      // fallback: marcar erro geral
      setError((prev) => ({ ...prev, _global: "Erro ao buscar dados. Veja console." }));
    } finally {
      // clear loading
      const loadingEnd: StateMap = {};
      names.forEach((n) => (loadingEnd[n] = ""));
      setLoading((prev) => ({ ...prev, ...loadingEnd }));
    }
  }

  return (
    <div className="container-fluid d-flex flex-column p-0" style={{ backgroundColor: "#e0e0e0", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{`html { scroll-padding-top: 70px; }`}</style>

      <nav className="navbar navbar-dark bg-dark sticky-top" style={{ zIndex: 1030, width: "100%", margin: 0 }}>
        <div className="container-fluid d-flex justify-content-between px-3">
          <a className="navbar-brand" href="/">
            <img src="/assets/logomarcasozinha.png" alt="escritório logo" width={80} />
          </a>
        </div>
      </nav>

      <main className="container-fluid pt-4 px-md-5" style={{ color: "black" }}>
        <section className="py-5 border-top">
          <div className="col-md-6">
            {/* seu texto explicativo aqui (mantive o conteúdo original) */}
            <p className="text-lg mb-4" style={{ textAlign: "justify" }}>
              {/* ...texto... */}
              Os Termos e Condições da emissão...
            </p>
          </div>
          <hr className="border-t border-neutral-400 mt-3 mb-5" />
        </section>

        <div className="row">
          <div className="col-lg-8">
            <h1 style={{ fontSize: "24px", marginBottom: "16px" }}>Características das debêntures</h1>

            <div style={{ marginBottom: "16px" }}>
              <button onClick={consultarTodas}>Executar Todas as Consultas</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px", marginBottom: "48px" }}>
              {functions.map((fn) => (
                <div key={fn.name} style={{ color: "black", minHeight: "80px", background: "#f9f9f9", padding: "8px", borderRadius: "4px", whiteSpace: "pre-wrap", wordBreak: "break-word", overflowWrap: "anywhere" }}>
                  <button style={{ marginBottom: "8px" }} onClick={() => consultar(fn.name)}>{fn.label}</button>
                  <div style={{ color: "black", minHeight: "80px", background: "#f9f9f9", padding: "8px", borderRadius: "4px", whiteSpace: "pre-wrap" }}>
                    {loading[fn.name] ? "Consultando..." : error[fn.name] ? error[fn.name] : results[fn.name] || "Nenhum dado ainda."}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-lg-4 d-none d-lg-block">
            <div className="text-black p-4 rounded" style={{ top: "90px" }}>
              <h4 className="mb-3">Termos e Condições da Emissão</h4>
              <p className="text-black text-justify" style={{ textAlign: "justify", fontSize: "0.95rem" }}>
                <em>Se trata de oferta de debêntures ...</em>
              </p>
            </div>
          </div>
        </div>
      </main>

      <div style={{ marginTop: "auto" }}>
        <BottomNav backTo="/" backLabel="anterior" forwardTo="/dashboard" forwardLabel="próxima" backInstruction="Volte para a página principal" forwardInstruction="Vá para o dashboard financeiro" />

        <footer className="bg-dark text-white text-center" style={{ padding: "0.5rem", fontSize: "0.9rem", width: "100%", margin: 0 }}>
          <p className="mb-0">
            <img src="/assets/logomarcasozinha.png" alt="escritório logo" width={40} />
            Uma iniciativa do escritório de advocacia{" "}
            <a href="https://macryptolaw.com/" className="text-white-50">Maimone & Associados</a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default BondStorage;
