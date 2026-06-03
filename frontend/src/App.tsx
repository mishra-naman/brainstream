import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Layout/Navbar';
import Home from './pages/Home';
import Runner from './pages/Runner';
import Builder from './pages/Builder';
import Tutorials from './pages/Tutorials';
import CheatSheet from './pages/CheatSheet';
import PlayerLab from './pages/PlayerLab';

function RunnerPage() {
  const location = useLocation();
  const state = location.state as { command?: string } | null;
  return <Runner initialCommand={state?.command} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/runner" element={<RunnerPage />} />
          <Route path="/builder" element={<Builder />} />
          <Route path="/tutorials" element={<Tutorials />} />
          <Route path="/cheatsheet" element={<CheatSheet />} />
          <Route path="/player" element={<PlayerLab />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
