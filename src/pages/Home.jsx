/**
 * Home Page
 * Landing with example gallery — the entry point
 * Now with manual frequency input!
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import VoiceCardMini from '../components/VoiceCardMini';
import { Prism, Waveform } from '../components/Icons';
import { EXAMPLES } from '../data/examples';

export default function Home() {
  const navigate = useNavigate();
  const [customFreq, setCustomFreq] = useState(165);
  const [inputValue, setInputValue] = useState('165');

  const handleFreqChange = (value) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 50 && num <= 500) {
      setCustomFreq(num);
    }
    setInputValue(value);
  };

  const handleExplore = () => {
    navigate(`/prism/${Math.round(customFreq)}`);
  };

  // Get note name for frequency
  const getNoteForFreq = (freq) => {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const a4 = 440;
    const semitones = 12 * Math.log2(freq / a4);
    const noteIndex = Math.round(semitones + 9) % 12;
    const octave = Math.floor((semitones + 9 + 48) / 12);
    return `${noteNames[(noteIndex + 12) % 12]}${octave}`;
  };

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Header */}
      <header className="border-b border-carbon-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Prism className="w-6 h-6 text-carbon-700" />
            <span className="font-semibold text-carbon-800">Vocal Prism</span>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/about" className="text-carbon-500 hover:text-carbon-800 transition-colors">
              About
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-white border-b border-carbon-200">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-carbon-900 tracking-tight mb-4">
              Your Voice, Refracted
            </h1>
            <p className="text-lg md:text-xl text-carbon-500 mb-2 max-w-xl mx-auto">
              One frequency. 3,000 years of context.
            </p>
            <p className="text-carbon-400 max-w-md mx-auto">
              From Pythagoras to neuroscience — discover what your fundamental frequency means across history.
            </p>
          </motion.div>

          {/* Hero visual */}
          <motion.div
            className="mt-12 flex items-center justify-center gap-8 text-carbon-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Waveform className="w-8 h-8" />
            <div className="font-mono text-3xl font-bold text-carbon-800">
              f<sub className="text-lg">0</sub>
            </div>
            <span className="text-2xl">→</span>
            <div className="flex gap-1">
              {['#5B8FB9', '#D4956A', '#8B7BB5', '#6B9B7A', '#C47D8C', '#5BA3A3'].map((color, i) => (
                <motion.div
                  key={color}
                  className="w-4 h-12 rounded"
                  style={{ backgroundColor: color }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.3 }}
                />
              ))}
            </div>
          </motion.div>

          {/* Manual Frequency Input */}
          <motion.div
            className="mt-12 max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <div className="bg-cream-50 border border-carbon-200 rounded-xl p-6">
              <label className="block text-sm font-medium text-carbon-600 mb-3">
                Enter your fundamental frequency
              </label>

              <div className="flex items-center gap-4 mb-4">
                <input
                  type="number"
                  value={inputValue}
                  onChange={(e) => handleFreqChange(e.target.value)}
                  onBlur={() => setInputValue(String(customFreq))}
                  min="50"
                  max="500"
                  step="1"
                  className="w-28 px-3 py-2 border border-carbon-300 rounded-lg font-mono text-lg text-center focus:outline-none focus:ring-2 focus:ring-signal-orange/50"
                />
                <span className="text-carbon-500">Hz</span>
                <span className="text-carbon-400">≈</span>
                <span className="font-mono text-signal-orange font-semibold">
                  {getNoteForFreq(customFreq)}
                </span>
              </div>

              <input
                type="range"
                min="50"
                max="500"
                step="1"
                value={customFreq}
                onChange={(e) => handleFreqChange(e.target.value)}
                className="w-full h-2 bg-carbon-200 rounded-lg appearance-none cursor-pointer accent-signal-orange mb-4"
              />

              <div className="flex justify-between text-xs text-carbon-400 mb-4">
                <span>50 Hz (bass)</span>
                <span>500 Hz (soprano)</span>
              </div>

              <button
                onClick={handleExplore}
                className="w-full py-3 bg-signal-orange text-white font-semibold rounded-lg hover:bg-signal-orange/90 transition-colors"
              >
                Explore {Math.round(customFreq)} Hz
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Example Gallery */}
      <section className="py-16 bg-cream-100">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-carbon-800 mb-2">
              Explore Example Voices
            </h2>
            <p className="text-carbon-500">
              Click any card to see the full prism analysis
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {EXAMPLES.map((example, i) => (
              <motion.div
                key={example.f0}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                <VoiceCardMini
                  f0={example.f0}
                  label={example.label}
                  sublabel={example.sublabel}
                  description={example.description}
                  index={i + 1}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What Is Section */}
      <section className="py-16 bg-white border-t border-carbon-200">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-carbon-800 mb-6 text-center">
            What is the Vocal Prism?
          </h2>

          <div className="prose prose-carbon max-w-none">
            <p className="text-carbon-600 leading-relaxed mb-4">
              Your <strong>fundamental frequency (f0)</strong> is the natural pitch of your relaxed voice —
              the base note your vocal cords produce. From this single number, we can derive your position
              in musical traditions spanning 3,000 years.
            </p>

            <div className="grid md:grid-cols-2 gap-4 my-8">
              <InfoCard
                title="What We Calculate"
                items={[
                  "Your personalized musical scale (just intonation)",
                  "Your position in the Pythagorean circle of fifths",
                  "Your Vedic framework (saptak, chakra, bija mantra)",
                  "Your Gregorian modal character",
                  "Your Western key signature",
                  "Your overtone series and brainwave map"
                ]}
              />
              <InfoCard
                title="What This Isn't"
                items={[
                  "Medical advice or diagnosis",
                  "Mystical claims without evidence",
                  "A replacement for musical training",
                  "Frequency healing pseudoscience"
                ]}
              />
            </div>

            <p className="text-carbon-600 leading-relaxed">
              The Vocal Prism is an educational tool that demystifies the relationship between
              your voice and musical history. Every calculation is grounded in physics and
              musicology — no mysticism required.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-cream-200 border-t border-carbon-200">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-sm text-carbon-400">
            Vocal Prism — Built with care by{' '}
            <a href="https://harmonicsystems.studio" className="text-carbon-600 hover:text-carbon-800">
              Harmonic Systems
            </a>
          </p>
          <p className="text-xs text-carbon-300 mt-2">
            Physics, not mysticism. Your voice, contextualized.
          </p>
        </div>
      </footer>
    </div>
  );
}

function InfoCard({ title, items }) {
  return (
    <div className="bg-cream-50 border border-carbon-100 rounded-lg p-4">
      <h3 className="font-semibold text-carbon-800 mb-3 text-sm uppercase tracking-wider">
        {title}
      </h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-carbon-600 flex items-start gap-2">
            <span className="text-carbon-400 mt-1">•</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
