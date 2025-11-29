/**
 * OvertoneChart Component
 * Visual representation of the overtone series
 * Extended to support 16 harmonics with toggle
 */

import { useState } from 'react';

export default function OvertoneChart({ overtones, maxHarmonics = 16 }) {
  const [showExtended, setShowExtended] = useState(false);
  const [viewMode, setViewMode] = useState('chart'); // 'chart' or 'table'

  const displayCount = showExtended ? Math.min(maxHarmonics, overtones.length) : 8;
  const displayOvertones = overtones.slice(0, displayCount);
  const maxHz = displayOvertones[displayOvertones.length - 1]?.hz || 1000;
  const minHz = displayOvertones[0]?.hz || 100;

  // Harmonics that are notably "out of tune" with 12-TET
  const outOfTuneHarmonics = [7, 11, 13, 14];

  // Chart dimensions
  const chartHeight = 160;
  const chartWidth = displayCount * 45 + 80;
  const barWidth = 30;
  const barGap = 15;
  const leftMargin = 55;
  const bottomY = 150;
  const topY = 20;
  const barAreaHeight = bottomY - topY;

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
        <div className="relative bg-cream-50 rounded border border-carbon-100 p-4 overflow-x-auto">
          <svg
            width={chartWidth}
            height={200}
            viewBox={`0 0 ${chartWidth} 200`}
            style={{ minWidth: chartWidth, display: 'block' }}
          >
            {/* Y-axis */}
            <line
              x1={leftMargin - 5}
              y1={topY}
              x2={leftMargin - 5}
              y2={bottomY}
              stroke="#cbd5e1"
              strokeWidth="1"
            />

            {/* Y-axis labels */}
            <text
              x={leftMargin - 10}
              y={topY + 4}
              textAnchor="end"
              fontSize="10"
              fill="#64748b"
              fontFamily="monospace"
            >
              {Math.round(maxHz)} Hz
            </text>
            <text
              x={leftMargin - 10}
              y={(topY + bottomY) / 2 + 4}
              textAnchor="end"
              fontSize="10"
              fill="#64748b"
              fontFamily="monospace"
            >
              {Math.round((maxHz + minHz) / 2)} Hz
            </text>
            <text
              x={leftMargin - 10}
              y={bottomY + 4}
              textAnchor="end"
              fontSize="10"
              fill="#64748b"
              fontFamily="monospace"
            >
              {Math.round(minHz)} Hz
            </text>

            {/* Horizontal grid lines */}
            <line
              x1={leftMargin}
              y1={topY}
              x2={chartWidth - 10}
              y2={topY}
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
            <line
              x1={leftMargin}
              y1={(topY + bottomY) / 2}
              x2={chartWidth - 10}
              y2={(topY + bottomY) / 2}
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeDasharray="4,4"
            />

            {/* X-axis (baseline) */}
            <line
              x1={leftMargin - 5}
              y1={bottomY}
              x2={chartWidth - 10}
              y2={bottomY}
              stroke="#cbd5e1"
              strokeWidth="1"
            />

            {/* Bars */}
            {displayOvertones.map((overtone, i) => {
              // Calculate bar height as proportion of frequency range
              const normalizedHeight = (overtone.hz - minHz) / (maxHz - minHz);
              const barHeight = Math.max(normalizedHeight * barAreaHeight, 4);
              const barX = leftMargin + i * (barWidth + barGap);
              const barY = bottomY - barHeight;
              const isOutOfTune = outOfTuneHarmonics.includes(overtone.harmonic);
              const barColor = isOutOfTune ? '#f59e0b' : '#f97316';

              return (
                <g key={overtone.harmonic}>
                  {/* Bar */}
                  <rect
                    x={barX}
                    y={barY}
                    width={barWidth}
                    height={barHeight}
                    fill={barColor}
                    rx="3"
                    opacity={0.9}
                  />

                  {/* Frequency label above bar */}
                  <text
                    x={barX + barWidth / 2}
                    y={barY - 6}
                    textAnchor="middle"
                    fontSize="9"
                    fill="#475569"
                    fontFamily="monospace"
                  >
                    {overtone.hz.toFixed(0)}
                  </text>

                  {/* Note name inside bar (if tall enough) */}
                  {barHeight > 25 && (
                    <text
                      x={barX + barWidth / 2}
                      y={barY + barHeight - 8}
                      textAnchor="middle"
                      fontSize="9"
                      fill="white"
                      fontWeight="600"
                    >
                      {overtone.noteName}
                    </text>
                  )}

                  {/* Harmonic number below */}
                  <text
                    x={barX + barWidth / 2}
                    y={bottomY + 16}
                    textAnchor="middle"
                    fontSize="11"
                    fill={isOutOfTune ? '#f59e0b' : '#475569'}
                    fontFamily="monospace"
                    fontWeight="600"
                  >
                    H{overtone.harmonic}
                  </text>
                </g>
              );
            })}

            {/* X-axis label */}
            <text
              x={chartWidth / 2}
              y={190}
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
