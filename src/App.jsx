/**
 * Vocal Prism App
 * Your voice, refracted through history
 */

import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Prism from './pages/Prism';
import About from './pages/About';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/prism/:f0" element={<Prism />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </HashRouter>
  );
}
