// frontend/src/Dashboard.tsx
import { useState } from 'react';
import {
  callTotalSupply,
  callTotalValueLocked,
  callLatestIPCA,
  callLatestIPCAHistory
} from "./soroban-services/dashboardService.ts";
import BottomNav from './bottomnav.tsx';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

// Tipagens explícitas
type FunctionItem = {
  label: string;
  name: string;
  contract: 'minting' | 'custody' | 'correction';
};

const functions: FunctionItem[] = [
  { label: "Total disponível em oferta", name: "maxTotalSupply", contract: "minting" },
  { label: "Total custodiado", name: "getTotalBondsDeposited", contract: "custody" },
  { label: "IPCA acumulado (%)", name: "latestIPCA", contract: "correction" },
];

type StateMap = Record<string, string>;

type IPCAItem = { mes: string; ipca: number };

function Dashboard() {
  const [results, setResults] = useState<StateMap>({});
  const [loading, setLoading] = useState<StateMap>({});
  const [error, setError] = useState<StateMap>({});
  const [ipcaHistory, setIpcaHistory] = useState<IPCAItem[]>([]);

  async function consultar(fnName: string, contract: 'minting' | 'custody' | 'correction') {
    try {
      setLoading((prev) => ({ ...prev, [fnName]: 'true' }));
      setError((prev) => ({ ...prev, [fnName]: '' }));

      let res;
      if (contract === 'minting') {
        res = await callTotalSupply();
      } else if (contract === 'custody') {
        res = await callTotalValueLocked();
      } else {
        res = await callLatestIPCA();
      }

      const parsedResult =
        typeof res === 'object' && res !== null ? JSON.stringify(res, null, 2) : String(res);

      setResults((prev) => ({ ...prev, [fnName]: parsedResult }));
    } catch (err) {
      setError((prev) => ({
        ...prev,
        [fnName]: 'Erro na consulta. Verifique a conexão ou o contrato.',
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [fnName]: '' }));
    }
  }

  async function consultarIPCAHistory() {
    try {
      const indices = [0, 1, 2]; // Correto: mais antigo → mais recente
      const promises = indices.map(i => callLatestIPCAHistory(i));
      const valores = await Promise.all(promises);

      console.log("Valores IPCA brutos:", valores);

      const dados = valores.map((val, index) => {
        const raw = typeof val === "bigint" ? Number(val.toString()) : Number(val);
        const ipcaFloat = raw / 1e6;

        return {
          mes: `M-${3 - index}`,
          ipca: parseFloat(ipcaFloat.toFixed(6)),
        };
      });

      setIpcaHistory(dados);
    } catch (err) {
      console.error("Erro ao carregar IPCA histórico:", err);
    }
  }

  async function consultarTodas() {
    for (const fn of functions) {
      await consultar(fn.name, fn.contract);
    }
    await consultarIPCAHistory();
  }

  return (
    <div className="container-fluid d-flex flex-column p-0" style={{ backgroundColor: "#e0e0e0", minHeight: "100vh" }}>
      <style>{`html { scroll-padding-top: 70px; }`}</style>

      <nav className="navbar navbar-dark bg-dark sticky-top">
        <div className="container-fluid d-flex justify-content-between px-3">
          <a className="navbar-brand" href="#">
            <img src="/assets/logomarcasozinha.png" alt="escritório logo" width={80} />
          </a>
        </div>
      </nav>

      <div className="row flex-grow-1 m-0">
        <nav className="col-md-2 bg-light sidebar px-3">
          <div className="d-flex flex-column align-items-start text-dark pt-4">
            <section className="py-10 border-t">
              <h1 className="text-xl font-semibold text-gray-500 mb-4 col-md-3 text-left py-4">
                Dashboard Financeiro
              </h1>
            </section>

            {/* ✅ Botão Mestre */}
            <div className="mt-3 d-flex flex-column align-items-center text-center w-100">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  consultarTodas();
                }}
                className="btn px-2 py-1 text-[10px] font-medium text-white rounded shadow-sm"
                style={{ backgroundColor: "#1A2E49", border: "none", width: "110px", textAlign: "center" }}
              >
                Atualizar Dados
              </a>
              <p className="text-[10px] text-gray-500 mt-1">
                <em>Pressione para exibir os dados atualizados.</em>
              </p>
            </div>

            {/* ✅ Botões individuais por função */}
            {functions.map((fn) => (
              <section key={fn.name} className="py-2 w-100">
                <div className="bg-white shadow rounded-lg p-3 mb-3">
                  <h3 className="text-sm font-semibold mb-1">{fn.label}</h3>
                  <div style={{ minHeight: "40px", background: "#f9f9f9", padding: "6px", borderRadius: "4px", whiteSpace: "pre-wrap" }}>
                    {loading[fn.name]
                      ? "Consultando..."
                      : error[fn.name]
                      ? error[fn.name]
                      : results[fn.name] || "Nenhum dado ainda."}
                  </div>
                  <button
                    onClick={() => consultar(fn.name, fn.contract)}
                    className="btn btn-sm btn-outline-secondary mt-2"
                  >
                    Consultar
                  </button>
                </div>
              </section>
            ))}
          </div>
        </nav>

        <main className="col-md-10 px-md-5 pt-4" style={{ color: "black" }}>
          <section className="row">
            <div className="col-md-8">
              <h2 className="text-2xl font-semibold text-black mb-4 text-left">
                Gráfico IPCA - Últimos 3 Meses
              </h2>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  consultarIPCAHistory();
                }}
                className="btn btn-sm btn-dark"
              >
                Atualizar IPCA
              </a>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart
                  data={[
                    { mes: "Mês mais remoto", ipca: ipcaHistory[0]?.ipca ?? 0 },
                    { mes: "Mês intermediário", ipca: ipcaHistory[1]?.ipca ?? 0 },
                    { mes: "Mês mais próximo", ipca: ipcaHistory[2]?.ipca ?? 0 },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="ipca" stroke="#8884d8" strokeWidth={3} name="IPCA" />
                </ComposedChart>
              </ResponsiveContainer>

              <div className="mt-5">
                <h3 className="text-lg font-semibold text-black mb-3">Variação IPCA (Gráfico de Barras)</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={[
                    { mes: "Mês mais remoto", ipca: ipcaHistory[0]?.ipca ?? 0 },
                    { mes: "Mês intermediário", ipca: ipcaHistory[1]?.ipca ?? 0 },
                    { mes: "Mês mais próximo", ipca: ipcaHistory[2]?.ipca ?? 0 },
                  ]}>
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Bar dataKey="ipca" barSize={40} fill="#1A2E49" />
                    <Bar dataKey="valor" fill="#2563eb" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="col-md-4">
              <h3 className="text-lg font-semibold text-black mb-3">Últimas Amortizações</h3>
              <table className="table table-bordered bg-white">
                <thead className="table-light">
                  <tr>
                    <th>Debênture</th>
                    <th>Data</th>
                    <th>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Preenchimento futuro */}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>

      <div style={{ marginTop: "auto" }}>
        <BottomNav
          backTo="/bond-storage"
          backLabel="anterior"
          forwardTo="/faucet"
          forwardLabel="próxima"
          backInstruction="Volte para as características das debêntures"
          forwardInstruction="Vá para o faucet de Attorneycoin"
        />

        <footer className="bg-dark text-white text-center" style={{ padding: "0.5rem", fontSize: "0.9rem", width: "100%", margin: 0 }}>
          <p className="mb-0">
            <img src="/assets/logomarcasozinha.png" alt="escritório logo" width={40} />
            Uma iniciativa do escritório de advocacia{' '}
            <a href="https://macryptolaw.com/" className="text-white-50">
              Maimone & Associados
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default Dashboard;
