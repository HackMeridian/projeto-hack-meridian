import './landingpage.css';
import { Link } from "react-router-dom";


export default function LandingPage() {
  return (

    <div className="min-h-screen mx-auto gradiente-bg text-black px-4">
      <header className="d-flex align-items-center justify-content-between pb-3 mb-5 border-bottom">
        <img src="/assets/logomarcatextolateral.png" alt="escritório logo" width={250} />

        <div className="d-flex gap-3">
          <a href="#documentacao" className="btn btn-outline-dark">Documentação</a>
          <a href="#produtos" className="btn btn-outline-dark">Produtos</a>
          <a href="#recursos" className="btn btn-outline-dark">Recursos</a>
        </div>
      </header>

          <main>
            <div className="px-6 md:px-20 py-5">
      <div className="container">
        <h1 className="mb-6 mt-auto text-3xl font-bold text-danger" >Aviso à CVM, à ANBIMA e ao mercado</h1>

        <p className="text-lg mb-4 justify-text" style={{ textAlign: "justify" }}>
          O escritório Maimone & Associados teve a iniciativa de construir a 
          presente plataforma para cobertura de testes através de usuários 
          reais transacionando debêntures ofertadas por smart contracts em 
          uma testnet de Web3.
        </p>

        <p className="text-lg mb-4 justify-text" style={{ textAlign: "justify" }}>
          Portanto, não se trata de oferta pública de valores mobiliários sem 
          registro, mas tão somente uma simulação para expor sobre como é possível 
          reduzir custos, burocracia, tempo e riscos, aumentando a segurança, 
          atratividade do investidor, facilidade na captação de recursos e
          auditabilidade pelo uso da tecnologia e a dispensa de instituições 
          financeiras intermediárias.
        </p>

        <p className="text-lg mb-4 justify-text" style={{ textAlign: "justify" }}>
          Também, o uso da plataforma permitirá descortinar possíveis falhas e,
          com isso, receber feedback,por canal próprio a ser informado, dos usuários
          que quiserem colaborar voluntariamente para o uso habitual de tecnologia 
          disruptiva no mercado de capitais.
        </p>

        <p className="text-lg mb-4 justify-text" style={{ textAlign: "justify" }}>
          Assim, qualquer interessado pode efetuar transações na plataforma usando
          uma conta de teste de sua própria Metamask, sendo brasileiros, residentes,
          ou até mesmo não residentes sem registro junto à CVM, acompanhando a
          operação, podendo apurar se os cálculos da amortização transferida a
          conta do investidor estão sendo realizados corretamente, fazendo colocação
          dos ativos no mercado subsequente e podendo comprar no mercado subsequente,
          verificando se seu endereço de conta foi vinculado à algum ativo, se o 
          pagamento foi corretamente transferido ao endreço da conta da emissora, e
          tantas outras funcionalidades que serão mencionadas em documentação própria.
        </p>

        <p className="text-lg mb-4 justify-text" style={{ textAlign: "justify" }}>
          A rede usada é a Amoy, a testnet da blockchain pública da Polygon, ao menos
          nessa etapa de testes, oportunidade que precederá o Sandbox Regulatório da
          CVM evitando que a chegada da oferta efetiva no mercado seja frustrada.
        </p>

        <p className="text-lg mb-4 justify-text" style={{ textAlign: "justify" }}>
          Importante ressaltar que não estará sendo usado USDC ou qualquer outra
          stable coin de testnet nessa plataforma, o token usado para pagamento
          na compra das debêntures e suas posteriores remunerações será o ATC
          (Attorneycoin), um utility token criado exclusivamente para esse ambiente,
          até então somente na rede Amoy, portanto não possui qualquer valor.
        </p>

        <p className="text-lg mb-4 justify-text" style={{ textAlign: "justify" }}>
          A opção por criar um token próprio para pagamento decorre do fato que o dono
          do smart contract tem poderes para mintar a quantidade de tokens que quiser 
          e quantas vezes quiser, pois será determinante para que não faltem recursos
          para remunerar o investidor quando vencer o prazo da parcela amortizada, 
          algo que não é permitido em protocolos como do USDC, que tem administração
          própria, salvo contrário ocasionaria em falhas.
        </p>
      </div>
    </div>

    <hr className="col-3 col-md-2 mb-5" />
    <div className="container">
      <section className="py-5">
        <div className="col-md-6">
          <h2>Otimização de Custos e Rastreabilidade</h2>
          <p className="text-lg mb-4" style={{ textAlign: "justify" }}>
            Nesta aba expomos os benefícios que as emissoras terão na oferta dos
            ativos através da dispensa de intermediários, que são instituições que
            encarecem muito a oferta, dificultando arrecadação, além da melhoria na
            auditabilidade, que permite uma melhor verificação nas movimentações financeiras.
          </p>
          <ul className="icon-list ps-0">
            <li className="d-flex align-items-start mb-1">
              <a
                href="https://github.com/twbs/bootstrap-npm-starter"
                rel="noopener"
                target="_blank"
              >
                [Benefícios que a Tokenização Dispõe]
              </a>
            </li>
          </ul>
        </div>
      </section>

      <section className="py-5 border-top">
        <div className="col-md-6">
          <h2>Documentação</h2>
          <p className="text-lg mb-4" style={{ textAlign: "justify" }}>
            No ícone abaixo, é possível ter acesso à
            documentação instruindo na interação com o 
            smart contract através da interface de usuário,
            oportunidade que somente será permitida 
            na plataforma de teste, uma vez que em fase
            de produção haverá KYC para cadastro dos
            investidores, onde nem todos os dados poderão
            estar registrados on-chain por razões técnicas
            e de sigilo financeiro.
          </p>
          <ul className="icon-list ps-0">
            <li className="d-flex align-items-start mb-1">
              <a
                href="https://github.com/twbs/bootstrap-npm-starter"
                rel="noopener"
                target="_blank"
              >
                [Documentação da aplicação no frontend e backend em código]
              </a>
            </li>
            <li className="d-flex align-items-start mb-1">
              <a
                href="https://github.com/twbs/bootstrap-npm-starter"
                rel="noopener"
                target="_blank"
              >
                [Documentação com escrita de texto para esclarecimento]
              </a>
            </li>
          </ul>
        </div>
      </section>

      <section className="py-5 border-top">
        <div className="col-md-6">
          <h2>Interação com Smart Contracts</h2>
          <p className="text-lg mb-4" style={{ textAlign: "justify" }}>
            Com os ícones abaixo o usuário será direcionado para
            as respectivas páginas onde poderá ser mintado o
            token Attorneycoin para pagamento na compra de
            debêntures no pool de oferta. Também poderá efetuar
            as transações de compra e consultar os dados das
            características da debênture, da emissora, dos dados
            atrelados aos números de emissão de cada debênture
            comprada, quais estão custodiadas no contrato, quantas
            ainda estão no depósito centralizado, quais possuem ônus
            e gravames judiciais, entre outras funcionalidades.
          </p>
          <ul className="icon-list ps-0" style={{ textAlign: "justify" }}>
            <li className="d-flex align-items-start mb-1">
              <Link to="/bond-storage">[Características das debêntures]</Link>
            </li>
            <li className="d-flex align-items-start mb-1">
              <Link to="/dashboard">[Consulta da oferta das debêntures no mercado primário]</Link>
            </li>
            <li className="d-flex align-items-start mb-1">
              <Link to="/dashboard">[Consulta do índice de correção monetária (IPCA) atualizado]</Link>
            </li>
            <li className="d-flex align-items-start mb-1">
              <Link to="/faucet">[Faucet de Attorneycoin para pagamento de debêntures]</Link>
            </li>
            <li className="d-flex align-items-start mb-1">
              <Link to="/pool">[Pool de pagamento para aquisição das debêntures]</Link>
            </li>
            <li className="d-flex align-items-start mb-1">
              <Link to="/bond-consult">[Consulta das debêntures em custódia e demais funcionalidades de cada uma]</Link>
            </li>
            <li className="d-flex align-items-start mb-1">
              <Link to="/subsequentmarket">[Pool de oferta no mercado subsequente com opção de compra e colocação à venda]</Link>
            </li>
            <li className="d-flex align-items-start mb-1">
              <Link to="/judicialconstraint">[Debêntures bloqueadas judicialmente]</Link>
            </li>
          </ul>
        </div>
      </section>
    </div>


      </main>

      <footer className="mt-auto text-black">
        <a className="d-flex align-items-center pb-3 mb-5 border-bottom">
        <img src="/assets/logomarcasozinha.png" alt="escritório logo" width={125}/>
        </a>
          <p>
            <img src="/assets/logomarcasozinha.png" alt="escritório logo" width={40}/>
            Uma iniciativa do escritório de advocacia <a href="https://macryptolaw.com/" className="text-black-50">Maimone & Associados</a></p>
        </footer>
    </div>
  );
}