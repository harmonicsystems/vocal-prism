/**
 * MathVerification Component
 * Shows users that the musical math is correct
 * Educational transparency - demystification through verification
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  verifyMath,
  findF0For432,
  TUNING_COMPARISON,
  TUNING_STANDARDS,
  ratioToCents
} from '../engine/tuning';

export default function MathVerification({ f0 = 165 }) {
  const [showDetails, setShowDetails] = useState(false);

  // Run verification checks
  const verificationResults = useMemo(() => verifyMath(), []);
  const allPassed = verificationResults.every(c => c.pass);

  // Where does 432 appear?
  const where432 = useMemo(() => findF0For432(), []);

  return (
    <div className="bg-carbon-800 rounded-lg p-4 text-white font-mono text-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-carbon-200 font-semibold">Math Verification</h3>
          <p className="text-[10px] text-carbon-500 mt-0.5">
            Transparency — see the formulas
          </p>
        </div>
        <div className={`
          px-2 py-1 rounded text-xs font-bold
          ${allPassed ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}
        `}>
          {allPassed ? 'ALL CHECKS PASS' : 'ISSUES FOUND'}
        </div>
      </div>

      {/* Toggle */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="text-xs text-carbon-400 hover:text-carbon-200 mb-3"
      >
        {showDetails ? '▼ Hide Details' : '▶ Show Verification Details'}
      </button>

      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4"
        >
          {/* Core Formulas */}
          <div className="bg-carbon-900 rounded p-3">
            <h4 className="text-xs text-carbon-400 uppercase tracking-wider mb-2">Core Formulas</h4>
            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between">
                <span className="text-carbon-500">Hz → MIDI:</span>
                <code className="text-signal-orange">69 + 12 × log₂(f / A4)</code>
              </div>
              <div className="flex justify-between">
                <span className="text-carbon-500">MIDI → Hz:</span>
                <code className="text-signal-orange">A4 × 2^((m-69)/12)</code>
              </div>
              <div className="flex justify-between">
                <span className="text-carbon-500">Cents:</span>
                <code className="text-signal-orange">1200 × log₂(f1/f2)</code>
              </div>
            </div>
          </div>

          {/* Verification Checks */}
          <div className="bg-carbon-900 rounded p-3">
            <h4 className="text-xs text-carbon-400 uppercase tracking-wider mb-2">
              Verification Checks
            </h4>
            <div className="space-y-1.5">
              {verificationResults.map((check, i) => (
                <div key={i} className="flex items-center gap-2 text-[10px]">
                  <span className={check.pass ? 'text-green-400' : 'text-red-400'}>
                    {check.pass ? '✓' : '✗'}
                  </span>
                  <span className="text-carbon-400 flex-1">{check.test}</span>
                  <span className="text-carbon-500">
                    {typeof check.actual === 'number' ? check.actual.toFixed(4) : check.actual}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Just Intonation vs ET */}
          <div className="bg-carbon-900 rounded p-3">
            <h4 className="text-xs text-carbon-400 uppercase tracking-wider mb-2">
              Just Intonation vs Equal Temperament
            </h4>
            <div className="text-[10px] space-y-1">
              <div className="grid grid-cols-4 gap-2 text-carbon-500 border-b border-carbon-700 pb-1">
                <span>Interval</span>
                <span className="text-right">Just (¢)</span>
                <span className="text-right">ET (¢)</span>
                <span className="text-right">Diff</span>
              </div>
              {Object.entries(TUNING_COMPARISON).map(([name, data]) => {
                const diff = data.justCents - data.etCents;
                return (
                  <div key={name} className="grid grid-cols-4 gap-2">
                    <span className="text-carbon-300">{name}</span>
                    <span className="text-right text-carbon-400">{data.justCents.toFixed(0)}</span>
                    <span className="text-right text-carbon-400">{data.etCents.toFixed(0)}</span>
                    <span className={`text-right ${Math.abs(diff) > 10 ? 'text-signal-amber' : 'text-carbon-500'}`}>
                      {diff > 0 ? '+' : ''}{diff.toFixed(0)}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="text-[9px] text-carbon-500 mt-2 italic">
              Notice: Major 3rd differs by -14¢. This is why just intonation feels "sweeter."
            </p>
          </div>

          {/* The 432 Hz Question */}
          <div className="bg-carbon-900 rounded p-3">
            <h4 className="text-xs text-carbon-400 uppercase tracking-wider mb-2">
              Where Does 432 Hz Appear?
            </h4>
            <div className="text-[10px] space-y-1">
              {Object.entries(where432).map(([interval, data]) => (
                <div key={interval} className="flex justify-between">
                  <span className="text-carbon-300">
                    As {data.svara} ({data.ratio})
                  </span>
                  <span className="text-carbon-400">
                    f0 = {data.f0.toFixed(1)} Hz
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[9px] text-carbon-500 mt-2 italic">
              The claim "432 Hz = Ni when Sa = 240 Hz" uses 9:5 (minor 7th), not our 15:8 (major 7th).
            </p>
          </div>

          {/* Tuning Standards */}
          <div className="bg-carbon-900 rounded p-3">
            <h4 className="text-xs text-carbon-400 uppercase tracking-wider mb-2">
              Reference Tuning Standards
            </h4>
            <div className="text-[10px] space-y-1.5">
              {Object.entries(TUNING_STANDARDS).map(([id, tuning]) => (
                <div key={id} className="flex justify-between items-center">
                  <span className="text-carbon-300">{tuning.name}</span>
                  <span className="text-signal-orange">A4 = {tuning.a4} Hz</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-carbon-700">
        <p className="text-[9px] text-carbon-500 leading-relaxed">
          All calculations use standard music theory formulas. Just intonation ratios
          are 5-limit (Ptolemaic). Equal temperament uses 12√2. No mysticism — pure physics.
        </p>
      </div>
    </div>
  );
}
