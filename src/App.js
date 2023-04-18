import './App.css';
import Navbar from './components/Navbar';
import { Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Loan from './components/Loan';
import Lend from './components/Lend';
import { useAccount, useProvider } from 'wagmi';

export default function App() {
  const provider = useProvider();
  const userAccount = useAccount();

  return (
    <div className="App overflow-hidden">
      <Navbar />
      {userAccount.isConnected ? (
          provider.network.chainId != undefined ? (
          provider.network.chainId == 84531 ? (
            <div>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/loan" element={<Loan />} />
                <Route path="/lend" element={<Lend />} />
              </Routes>
            </div>
          ) : (
              <h1 className="text-light">ganti network lu ke goerli tot</h1>
          )
          ) : (
              <h1 className="text-light">coba refresh</h1>
          )
      ) : (
          <h1 className="text-light">mana wallet lu blok?</h1>
      )}
    </div>
  );
}
