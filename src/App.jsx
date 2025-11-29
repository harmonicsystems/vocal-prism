/**
 * Vocal Prism App
 * Your voice, refracted through history
 */

import { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Prism from './pages/Prism';
import About from './pages/About';
import AudioUnlockButton from './components/AudioUnlockButton';
import { warmupAudio } from './utils/mobileAudio';

export default function App() {
  // Warm up audio context early (doesn't unlock, just creates context)
  useEffect(() => {
    warmupAudio();
  }, []);

  return (
    <HashRouter>
      {/* Global audio unlock button for mobile */}
      <AudioUnlockButton />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/prism/:f0" element={<Prism />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </HashRouter>
  );
}
