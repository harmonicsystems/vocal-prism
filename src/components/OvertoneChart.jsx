/**
 * OvertoneChart Component
 * Visual representation of the overtone series
 * Extended to support 16 harmonics with toggle
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OvertoneChart({ overtones, maxHarmonics = 16 }) {
  const [showExtended, setShowExtended] = useState(false);
  const [viewMode, setViewMode] = useState('chart'); // 'chart' or 'table'

  const displayCount = showExtended ? Math.min(maxHarmonics, overtones.length) : 8;
  const displayOvertones = overtones.slice(0, displayCount);
  const maxHz = displayOvertones[displayOvertones.length - 1]?.hz || 1000;

  // Harmonics that are notably "out of tune" with 12-TET
  const outOfTuneHarmonics = [7, 11, 13, 14];

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('chart')}
            className={`px-2 py-1 text-xs rounded transition-all ${
              viewMode === 'chart'
                ? 'bg-carbon-200 text-carbon-800'
                : 'text-carbon-500 hover:text-carbon-700'
            }`}
          >
            Chart
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-2 py-1 text-xs rounded transition-all ${
              viewMode === 'table'
                ? 'bg-carbon-200 text-carbon-800'
                : 'text-carbon-500 hover:text-carbon-700'
            }`}
          >
            Table
          </button>
        </div>
        <button
          onClick={() => setShowExtended(!showExtended)}
          className="text-xs text-carbon-500 hover:text-carbon-700"
        >
          {showExtended ? '▼ Show 8' : '▶ Show 16'}
        </button>
      </div>

      {viewMode === 'chart' ? (
        /* Visual chart */
        <div className="relative h-48 bg-cream-50 rounded border border-carbon-100 p-4">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-4 bottom-4 w-16 flex flex-col justify-between text-right pr-2">
            <span className="font-mono text-xs text-carbon-400">{Math.round(maxHz)}</span>
            <span className="font-mono text-xs text-carbon-400">{Math.round(maxHz / 2)}</span>
            <span className="font-mono text-xs text-carbon-400">{displayOvertones[0]?.hz.toFixed(0)}</span>
          </div>

          {/* Chart area */}
          <div className="ml-16 h-full flex items-end justify-around gap-1">
            {displayOvertones.map((overtone, i) => {
              const heightPercent = (overtone.hz / maxHz) * 100;
              const opacity = 1 - (i * 0.04);
              const isOutOfTune = outOfTuneHarmonics.includes(overtone.harmonic);

              return (
                <motion.div
                  key={overtone.harmonic}
                  className="flex flex-col items-center gap-1 flex-1"
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  transition={{ delay: i * 0.05, duration: 0.2 }}
                >
                  {/* Bar */}
                  <motion.div
                    className={`w-full rounded-t relative group ${
                      isOutOfTune ? 'bg-signal-amber' : 'bg-signal-orange'
                    }`}
                    style={{
                      height: `${heightPercent}%`,
                      opacity,
                      minHeight: '4px'
                    }}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: i * 0.05, duration: 0.2 }}
                    whileHover={{ opacity: 1 }}
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-carbon-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      <div>{overtone.hzFormatted} Hz</div>
                      <div className="text-carbon-400">{overtone.noteName}</div>
                      {overtone.note && <div className="text-signal-amber text-[9px]">{overtone.note}</div>}
                    </div>
                  </motion.div>

                  {/* Harmonic number */}
                  <span className={`font-mono text-[10px] ${
                    isOutOfTune ? 'text-signal-amber' : 'text-carbon-400'
                  }`}>
                    {overtone.harmonic}
                  </span>
                </motion.div>
              );
            })}
          </div>

          {/* X-axis label */}
          <div className="absolute bottom-0 left-16 right-0 text-center">
            <span className="text-xs text-carbon-400">Harmonic</span>
          </div>
        </div>
      ) : (
        /* Data table */
        <div className={`grid gap-2 ${showExtended ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-4'}`}>
          {displayOvertones.map((overtone) => {
            const isOutOfTune = outOfTuneHarmonics.includes(overtone.harmonic);

            return (
              <div
                key={overtone.harmonic}
                className={`bg-cream-50 rounded p-2 border ${
                  isOutOfTune ? 'border-signal-amber/50' : 'border-carbon-100'
                }`}
              >
                <div className="flex items-baseline justify-between">
                  <span className={`font-mono text-xs ${isOutOfTune ? 'text-signal-amber' : 'text-carbon-400'}`}>
                    H{overtone.harmonic}
                  </span>
                  <span className="font-mono text-sm text-carbon-700">{overtone.hzFormatted}</span>
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-xs text-carbon-500 truncate flex-1" title={overtone.interval}>
                    {overtone.intervalShort || overtone.interval}
                  </span>
                  <span className="font-mono text-[10px] text-carbon-400">{overtone.noteName}</span>
                </div>
                {overtone.note && (
                  <div className="text-[9px] text-signal-amber mt-1">{overtone.note}</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] text-carbon-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-signal-orange rounded" />
          <span>12-TET compatible</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-signal-amber rounded" />
          <span>"Out of tune" harmonics (7, 11, 13, 14)</span>
        </div>
      </div>
    </div>
  );
}
