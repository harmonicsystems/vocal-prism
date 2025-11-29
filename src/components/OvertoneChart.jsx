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
        <div className="relative bg-cream-50 rounded border border-carbon-100 p-4">
          <svg
            viewBox={`0 0 ${displayCount * 40 + 60} 200`}
            className="w-full h-auto"
            style={{ minHeight: '180px' }}
          >
            {/* Y-axis */}
            <line x1="50" y1="20" x2="50" y2="160" stroke="#94a3b8" strokeWidth="1" />

            {/* Y-axis labels */}
            <text x="45" y="25" textAnchor="end" fontSize="10" fill="#64748b" fontFamily="monospace">
              {Math.round(maxHz)}
            </text>
            <text x="45" y="90" textAnchor="end" fontSize="10" fill="#64748b" fontFamily="monospace">
              {Math.round(maxHz / 2)}
            </text>
            <text x="45" y="160" textAnchor="end" fontSize="10" fill="#64748b" fontFamily="monospace">
              0
            </text>

            {/* Bars */}
            {displayOvertones.map((overtone, i) => {
              const barHeight = (overtone.hz / maxHz) * 140; // 140px max bar height
              const barX = 60 + i * 35;
              const barY = 160 - barHeight;
              const isOutOfTune = outOfTuneHarmonics.includes(overtone.harmonic);
              const barColor = isOutOfTune ? '#f59e0b' : '#f97316';
              const opacity = 1 - (i * 0.03);

              return (
                <g key={overtone.harmonic}>
                  {/* Bar */}
                  <motion.rect
                    x={barX}
                    y={barY}
                    width="25"
                    height={barHeight}
                    fill={barColor}
                    opacity={opacity}
                    rx="2"
                    initial={{ height: 0, y: 160 }}
                    animate={{ height: barHeight, y: barY }}
                    transition={{ delay: i * 0.05, duration: 0.3, ease: 'easeOut' }}
                  />

                  {/* Frequency label on bar */}
                  <motion.text
                    x={barX + 12.5}
                    y={barY - 5}
                    textAnchor="middle"
                    fontSize="8"
                    fill="#64748b"
                    fontFamily="monospace"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 + 0.2 }}
                  >
                    {overtone.hz.toFixed(0)}
                  </motion.text>

                  {/* Harmonic number below */}
                  <text
                    x={barX + 12.5}
                    y="175"
                    textAnchor="middle"
                    fontSize="10"
                    fill={isOutOfTune ? '#f59e0b' : '#64748b'}
                    fontFamily="monospace"
                    fontWeight="500"
                  >
                    H{overtone.harmonic}
                  </text>

                  {/* Note name inside bar if tall enough */}
                  {barHeight > 30 && (
                    <text
                      x={barX + 12.5}
                      y={barY + barHeight - 8}
                      textAnchor="middle"
                      fontSize="9"
                      fill="white"
                      fontWeight="500"
                    >
                      {overtone.noteName}
                    </text>
                  )}
                </g>
              );
            })}

            {/* X-axis */}
            <line x1="50" y1="160" x2={60 + displayCount * 35} y2="160" stroke="#94a3b8" strokeWidth="1" />

            {/* X-axis label */}
            <text
              x={(60 + displayCount * 35) / 2 + 25}
              y="195"
              textAnchor="middle"
              fontSize="11"
              fill="#64748b"
            >
              Harmonic Number
            </text>
          </svg>
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
