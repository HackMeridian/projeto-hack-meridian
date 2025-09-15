import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./global.css";
import BottomNav from "./bottomnav";
import { buyBonds, getBondPrice } from "./soroban-services/paymentPoolService";

function PaymentPool() {
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [unitPrice, setUnitPrice] = useState<bigint>(0n);
  const [totalPrice, setTotalPrice] = useState<bigint>(0n);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const price = await getBondPrice();
        setUnitPrice(price);
      } catch (err) {
        console.error("Erro ao buscar preço da debênture:", err);
      }
    };
    fetchPrice();
  }, []);

  useEffect(() => {
    setTotalPrice(unitPrice * BigInt(quantity));
  }, [quantity, unitPrice]);

  const handlePurchase = async () => {
    if (quantity <= 0) {
      setMessage("⚠️ Quantidade inválida.");
      return;
    }

    try {
      setLoading(true);
      setMessage("🔄 Enviando transação...");

      const txResult = await buyBonds(quantity);
      setMessage(`✅ Compra realizada! Resultado:\n${JSON.stringify(txResult, null, 2)}`);
    } catch (err: any) {
      console.error(err);
      setMessage(err.message || "❌ Erro ao comprar debêntures.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid d-flex flex-column p-0" style={{ backgroundColor: "#e0e0e0", minHeight: "100vh" }}>
      <nav className="navbar navbar-dark bg-dark sticky-top">
        <div className="container-fluid d-flex justify-content-between px-3">
          <a className="navbar-brand" href="#">
            <img src="/assets/logomarcasozinha.png" alt="logo" width={80} />
          </a>
        </div>
      </nav>

      <main className="container px-md-5 pt-5" style={{ color: "black" }}>
        <section className="mb-4">
          <h2>Pool de Pagamento</h2>
          <p className="text-muted">
            Aqui você pode adquirir debêntures diretamente do pool de oferta inicial, pagando com USDC na rede Stellar.
          </p>
        </section>

        <section className="mb-4">
          <label htmlFor="quantity" className="form-label">Quantidade de debêntures</label>
          <input
            type="number"
            id="quantity"
            className="form-control mb-2 mx-auto text-center"
            style={{ maxWidth: "200px" }}
            value={quantity}
            min={1}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
          />

          <p className="text-center fw-bold">
            Valor total: {(Number(totalPrice) / 1e6).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} USDC
          </p>

          <div className="text-center">
            <button onClick={handlePurchase} className="btn btn-primary" disabled={loading}>
              {loading ? "Processando..." : "Comprar Debêntures"}
            </button>
          </div>

          {message && (
            <div className="alert alert-info mt-3 text-center" style={{ whiteSpace: "pre-wrap" }}>
              {message}
            </div>
          )}
        </section>

        <section className="border-top pt-4 mb-5">
          <h5>Não possui USDC suficiente para comprar debêntures?</h5>
          <p>Clique no botão abaixo para ser direcionado à página onde você pode adquirir USDC.</p>
          <Link to="/faucet" className="btn btn-success">Ir para Faucet de USDC</Link>
        </section>
      </main>
      <div style={{ marginTop: "auto" }}>
      <BottomNav
        backTo="/faucet"
        backLabel="anterior"
        forwardTo="/bond-consult"
        forwardLabel="próxima"
        backInstruction="Volte para o faucet de Attorneycoin"
        forwardInstruction="Vá para a área do investidor"
      />

      <footer className="bg-dark text-white text-center mt-auto" style={{ padding: "0.5rem", fontSize: "0.9rem", width: "100%", margin: 0 }}>
        <p className="mb-0">
          <img src="/assets/logomarcasozinha.png" alt="escritório logo" width={40} />
          Uma iniciativa do escritório de advocacia {" "}
          <a href="https://macryptolaw.com/" className="text-white-50">
            Maimone & Associados
          </a>
        </p>
      </footer>
      </div>
    </div>
  );
}

export default PaymentPool;
