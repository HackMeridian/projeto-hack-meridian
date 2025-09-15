// frontend/src/Faucet.tsx
import React, { useState } from "react";
import { mint } from "./soroban-services/faucetService";
import './global.css';
import BottomNav from './bottomnav.tsx'

function Faucet() {
  const [message, setMessage] = useState("");

  function btnMint() {
    setMessage("Aguardando autorização e envio da transação...");

    mint()
      .then((tx) =>
        setMessage(
          "Os tokens foram enviados para sua carteira. Transação: " + tx
        )
      )
      .catch((err: any) => {
        // mostra mensagem amigável
        const m = err?.message ?? String(err);
        alert("Erro ao mintar no Soroban: " + m);
        setMessage("");
      });
  }

  function btnStakePoolPOL() {
    window.location.href = "https://faucet.stakepool.dev.br/amoy";
  }

  function btnChainlinkPOL() {
    window.location.href = "https://faucets.chain.link/";
  }

  return (
    <div className="container-fluid d-flex flex-column p-0" style={{ backgroundColor: "#e0e0e0", minHeight: "100vh" }}>
      <style>{`html { scroll-padding-top: 70px; }`}</style>

      <nav className="navbar navbar-dark bg-dark sticky-top" style={{ zIndex: 1030, width: "100%", margin: 0 }}>
        <div className="container-fluid d-flex justify-content-between px-3">
          <a className="navbar-brand" href="/">
            <img src="/assets/logomarcasozinha.png" alt="Logo" width={60} style={{ cursor: "pointer" }} />
          </a>
        </div>
      </nav>

      <main className="container px-md-5 pt-5" style={{ color: "black", paddingBottom: "100px" }}>
        <h1 style={{ textAlign: "center" }}>Pegue seus tokens de teste.</h1>

        <p
          className="lead"
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          Cada investidor pode mintar até 1000 Attorneycoins para
          pagamento de debêntures no intervalo de 24 horas.
        </p>

        <div style={{ marginTop: "40px", textAlign: "center" }}>
          <a
            onClick={(e) => { e.preventDefault(); btnMint(); }}
            className="btn btn-lg fw-bold border-white"
            style={{ backgroundColor: "#eef4f6", color: "black" }}
            role="button"
          >
            <img
              src="/assets/metamask.svg"
              alt="Metamask logo"
              width={48}
              style={{ marginRight: "10px" }}
            />
            Conecte a sua carteira Soroban / Execute mint
          </a>
        </div>

        <div
          style={{
            minHeight: "60px",
            marginTop: "20px",
            marginBottom: "30px",
            padding: "10px",
            borderRadius: "8px",
            color: "#333",
            whiteSpace: "pre-line",
            textAlign: "center",
          }}
        >
          {message}
        </div>

        <p
          className="lead"
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          Caso esteja faltando POL na sua carteira para pagar taxas de gas na
          transação, os botões abaixo te direcionam para as páginas onde
          poderá obtê-los:
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "24px",
            marginTop: "10px",
          }}
        >
          <a
            onClick={(e) => { e.preventDefault(); btnStakePoolPOL(); }}
            className="btn btn-sm fw-bold"
            style={{
              backgroundColor: "#b388eb",
              borderColor: "#b388eb",
              color: "white",
              width: "200px",
              textAlign: "center",
            }}
            role="button"
          >
            StakePool Faucet Page (POL)
          </a>

          <a
            onClick={(e) => { e.preventDefault(); btnChainlinkPOL(); }}
            className="btn btn-sm fw-bold"
            style={{
              backgroundColor: "#b388eb",
              borderColor: "#b388eb",
              color: "white",
              width: "200px",
              textAlign: "center",
            }}
            role="button"
          >
            Chainlink Faucet Page (POL)
          </a>
        </div>
      </main>

      <div style={{ marginTop: "auto" }}>
      <BottomNav
        backTo="/dashboard"
        backLabel="anterior"
        forwardTo="/pool"
        forwardLabel="próxima"
        backInstruction="Volte para odashboard financeiro"
        forwardInstruction="Vá para o pool de oferta primária"
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

export default Faucet;
