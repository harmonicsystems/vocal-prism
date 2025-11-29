/**
 * TuningSelector Component
 * Allows users to compare their frequency across different tuning standards
 * Educational tool showing how note names shift with reference pitch
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TUNING_STANDARDS,
  freqToNoteName,
  freqToMidi,
  centsBetween,
  nearestETFreq
} from '../engine/tuning';

export default function TuningSelector({ f0 = 165 }) {
  const [selectedTuning, setSelectedTuning] = useState('A440');
  const [showAll, setShowAll] = useState(false);

  // Calculate how this frequency appears in each tuning standard
  const tuningComparisons = useMemo(() => {
    return Object.entries(TUNING_STANDARDS).map(([id, tuning]) => {
      const noteName = freqToNoteName(f0, tuning.a4);
      const nearestHz = nearestETFreq(f0, tuning.a4);
      const cents = Math.round(centsBetween(f0, nearestHz));
      const centsFormatted = cents === 0 ? '±0¢' : (cents > 0 ? `+${cents}¢` : `${cents}¢`);

      return {
        id,
        ...tuning,
        noteName,
        nearestHz,
        cents,
        centsFormatted
      };
    });
  }, [f0]);

  const currentTuning = tuningComparisons.find(t => t.id === selectedTuning);

  return (
    <div className="bg-carbon-800 rounded-lg p-4 text-white font-mono text-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-carbon-200 font-semibold">Reference Tuning</h3>
          <p className="text-[10px] text-carbon-500 mt-0.5">
            How your {f0} Hz appears in different standards
          </p>
        </div>
      </div>

      {/* Quick selector */}
      <div className="flex flex-wrap gap-1 mb-4">
        {tuningComparisons.map(tuning => (
          <button
            key={tuning.id}
            onClick={() => setSelectedTuning(tuning.id)}
            className={`
              px-2.5 py-1.5 text-[10px] rounded border transition-all
              ${selectedTuning === tuning.id
                ? 'bg-signal-orange/20 border-signal-orange text-signal-orange'
                : 'bg-carbon-900 border-carbon-700 text-carbon-400 hover:border-carbon-500'}
            `}
          >
            A={tuning.a4}
          </button>
        ))}
      </div>

      {/* Current selection details */}
      {currentTuning && (
        <div className="bg-carbon-900 rounded p-3 mb-4">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-carbon-400 text-xs">{currentTuning.name}</span>
            <span className="text-signal-orange font-bold">{currentTuning.noteName}</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-carbon-500">Nearest ET: {currentTuning.nearestHz.toFixed(2)} Hz</span>
            <span className={`font-mono ${Math.abs(currentTuning.cents) < 10 ? 'text-carbon-400' : 'text-signal-amber'}`}>
              {currentTuning.centsFormatted}
            </span>
          </div>
          <p className="text-[10px] text-carbon-500 mt-2 leading-relaxed">
            {currentTuning.description}
          </p>
        </div>
      )}

      {/* Toggle comparison table */}
      <button
        onClick={() => setShowAll(!showAll)}
        className="text-xs text-carbon-400 hover:text-carbon-200 mb-3"
      >
        {showAll ? '▼ Hide Comparison Table' : '▶ Compare All Tunings'}
      </button>

      <AnimatePresence>
        {showAll && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="bg-carbon-900 rounded p-3">
              <div className="text-[10px] space-y-1">
                {/* Header row */}
                <div className="grid grid-cols-4 gap-2 text-carbon-500 border-b border-carbon-700 pb-1 mb-1">
                  <span>Standard</span>
                  <span className="text-center">A4</span>
                  <span className="text-center">Your Note</span>
                  <span className="text-right">Cents</span>
                </div>

                {/* Data rows */}
                {tuningComparisons.map(tuning => (
                  <div
                    key={tuning.id}
                    className={`grid grid-cols-4 gap-2 py-0.5 ${
                      tuning.id === selectedTuning ? 'bg-signal-orange/10 -mx-1 px-1 rounded' : ''
                    }`}
                  >
                    <span className="text-carbon-300 truncate">{tuning.name.split('(')[0].trim()}</span>
                    <span className="text-center text-carbon-400">{tuning.a4}</span>
                    <span className={`text-center ${tuning.id === selectedTuning ? 'text-signal-orange' : 'text-carbon-300'}`}>
                      {tuning.noteName}
                    </span>
                    <span className={`text-right ${Math.abs(tuning.cents) < 10 ? 'text-carbon-500' : 'text-signal-amber'}`}>
                      {tuning.centsFormatted}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Explanation */}
            <p className="text-[9px] text-carbon-500 mt-2 leading-relaxed italic">
              The same frequency gets different note names depending on reference pitch.
              In A=432 tuning, everything shifts ~31 cents flat from A=440.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer insight */}
      <div className="mt-3 pt-3 border-t border-carbon-700">
        <p className="text-[9px] text-carbon-500 leading-relaxed">
          Vocal Prism uses A=440 by default (international standard since 1939).
          Note names are labels, not prescriptions — your voice is already perfect.
        </p>
      </div>
    </div>
  );
}
