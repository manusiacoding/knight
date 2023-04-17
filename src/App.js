import './App.css';
import Navbar from './components/Navbar';
import { Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Loan from './components/Loan';
import Lend from './components/Lend';

function App() {
  return (
    <div className="App">
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/loan" element={<Loan />} />
        <Route path="/lend" element={<Lend />} />
      </Routes>
    </div>
  );
}

export default App;
