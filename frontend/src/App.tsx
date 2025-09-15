import { BrowserRouter, Routes, Route } from "react-router-dom"
import LandingPage from './landingpage.tsx'
import BondStorage from './bondstorageresources.tsx'
//import BondConsult from './bondconsultresources'
import Dashboard from './dashboardresources'
import Faucet from './faucet.tsx';
//import SubsequentMarket from './subsequentmarketresources.tsx'
import PaymentPool from './paymentpoolresources.tsx'
//import JudicialConstraints from './judicialconstraintresources.tsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/bond-storage" element={<BondStorage />} />
      </Routes>
    </BrowserRouter>
  );
}
