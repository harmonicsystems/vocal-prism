/**
 * MusicTheoryTree Component
 * Visual representation of modes, triads, and scale relationships
 * Based on the "Music Theory Tree" concept showing how modes relate to the major scale
 *
 * Features:
 * - 7 modes radiating from center
 * - Triads on each scale degree
 * - Interval patterns (W/H steps)
 * - Multiple "embodied" color systems for notes
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

// Note color systems - various "embodied" approaches
const COLOR_SYSTEMS = {
  rainbow: {
    name: 'Rainbow',
    description: 'Simple chromatic rainbow',
    colors: {
      'C': '#ff0000', 'C#': '#ff4500', 'Db': '#ff4500',
      'D': '#ff8c00', 'D#': '#ffd700', 'Eb': '#ffd700',
      'E': '#adff2f',
      'F': '#00ff00', 'F#': '#00fa9a', 'Gb': '#00fa9a',
      'G': '#00ffff', 'G#': '#1e90ff', 'Ab': '#1e90ff',
      'A': '#0000ff', 'A#': '#8a2be2', 'Bb': '#8a2be2',
      'B': '#ff00ff',
    }
  },
  scriabin: {
    name: 'Scriabin',
    description: 'Alexander Scriabin\'s synesthetic system',
    colors: {
      'C': '#ff0000',   // Red
      'C#': '#8b00ff', 'Db': '#8b00ff',  // Violet
      'D': '#ffff00',   // Yellow
      'D#': '#b0c4de', 'Eb': '#b0c4de',  // Steel blue (flesh)
      'E': '#87ceeb',   // Sky blue
      'F': '#8b0000',   // Dark red
      'F#': '#0000ff', 'Gb': '#0000ff',  // Bright blue
      'G': '#ffa500',   // Orange
      'G#': '#9400d3', 'Ab': '#9400d3',  // Violet/purple
      'A': '#00ff00',   // Green
      'A#': '#b0c4de', 'Bb': '#b0c4de',  // Steel
      'B': '#4169e1',   // Royal blue
    }
  },
  newton: {
    name: 'Newton',
    description: 'Isaac Newton\'s color-note spectrum',
    colors: {
      'C': '#ff0000',   // Red
      'D': '#ffa500',   // Orange
      'E': '#ffff00',   // Yellow
      'F': '#00ff00',   // Green
      'G': '#0000ff',   // Blue
      'A': '#4b0082',   // Indigo
      'B': '#8f00ff',   // Violet
      'C#': '#ff4500', 'Db': '#ff4500',
      'D#': '#ffd700', 'Eb': '#ffd700',
      'F#': '#00fa9a', 'Gb': '#00fa9a',
      'G#': '#1e90ff', 'Ab': '#1e90ff',
      'A#': '#9932cc', 'Bb': '#9932cc',
    }
  },
  chakra: {
    name: 'Chakra',
    description: 'Based on Vedic chakra associations',
    colors: {
      'C': '#ff0000',   // Root - Red
      'D': '#ff7f00',   // Sacral - Orange
      'E': '#ffff00',   // Solar Plexus - Yellow
      'F': '#00ff00',   // Heart - Green
      'G': '#00bfff',   // Throat - Blue
      'A': '#4b0082',   // Third Eye - Indigo
      'B': '#9400d3',   // Crown - Violet
      'C#': '#ff3366', 'Db': '#ff3366',
      'D#': '#ffbf00', 'Eb': '#ffbf00',
      'F#': '#7fff00', 'Gb': '#7fff00',
      'G#': '#00ffff', 'Ab': '#00ffff',
      'A#': '#8a2be2', 'Bb': '#8a2be2',
    }
  },
  warm: {
    name: 'Warm/Cool',
    description: 'Major=warm, Minor=cool',
    colors: {
      'C': '#ff6b35', 'D': '#ff8c42', 'E': '#ffd166',
      'F': '#06d6a0', 'G': '#118ab2', 'A': '#073b4c', 'B': '#ef476f',
      'C#': '#ff9f1c', 'Db': '#ff9f1c',
      'D#': '#2ec4b6', 'Eb': '#2ec4b6',
      'F#': '#e71d36', 'Gb': '#e71d36',
      'G#': '#011627', 'Ab': '#011627',
      'A#': '#ff006e', 'Bb': '#ff006e',
    }
  },
};

// The 7 modes with their characteristics
const MODES = [
  {
    name: 'Ionian',
    degree: 'I',
    romanNumeral: 'I',
    quality: 'Major',
    triad: 'major',
    intervals: ['W', 'W', 'H', 'W', 'W', 'W', 'H'],
    mood: 'Happy, bright',
    color: '#f97316', // orange
  },
  {
    name: 'Dorian',
    degree: 'ii',
    romanNumeral: 'ii',
    quality: 'Minor',
    triad: 'minor',
    intervals: ['W', 'H', 'W', 'W', 'W', 'H', 'W'],
    mood: 'Jazzy, soulful',
    color: '#3b82f6', // blue
  },
  {
    name: 'Phrygian',
    degree: 'iii',
    romanNumeral: 'iii',
    quality: 'Minor',
    triad: 'minor',
    intervals: ['H', 'W', 'W', 'W', 'H', 'W', 'W'],
    mood: 'Spanish, dark',
    color: '#8b5cf6', // purple
  },
  {
    name: 'Lydian',
    degree: 'IV',
    romanNumeral: 'IV',
    quality: 'Major',
    triad: 'major',
    intervals: ['W', 'W', 'W', 'H', 'W', 'W', 'H'],
    mood: 'Dreamy, floating',
    color: '#eab308', // yellow
  },
  {
    name: 'Mixolydian',
    degree: 'V',
    romanNumeral: 'V',
    quality: 'Major',
    triad: 'major',
    intervals: ['W', 'W', 'H', 'W', 'W', 'H', 'W'],
    mood: 'Bluesy, rock',
    color: '#22c55e', // green
  },
  {
    name: 'Aeolian',
    degree: 'vi',
    romanNumeral: 'vi',
    quality: 'Minor',
    triad: 'minor',
    intervals: ['W', 'H', 'W', 'W', 'H', 'W', 'W'],
    mood: 'Sad, natural minor',
    color: '#06b6d4', // cyan
  },
  {
    name: 'Locrian',
    degree: 'vii°',
    romanNumeral: 'vii°',
    quality: 'Diminished',
    triad: 'dim',
    intervals: ['H', 'W', 'W', 'H', 'W', 'W', 'W'],
    mood: 'Unstable, tense',
    color: '#ef4444', // red
  },
];

// Build scale from root
const CHROMATIC_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Major scale intervals in semitones
const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];

function buildScale(root, preferFlats = false) {
  const notes = preferFlats ? FLAT_NOTES : CHROMATIC_NOTES;
  const rootIndex = notes.indexOf(root) !== -1 ? notes.indexOf(root) : 0;

  return MAJOR_SCALE_INTERVALS.map(interval => {
    const noteIndex = (rootIndex + interval) % 12;
    return notes[noteIndex];
  });
}

// Get triad notes for a scale degree
function getTriadNotes(scale, degree) {
  // 0-indexed degree
  const root = scale[degree];
  const third = scale[(degree + 2) % 7];
  const fifth = scale[(degree + 4) % 7];
  return [root, third, fifth];
}

// Get triad quality for each degree
const TRIAD_QUALITIES = ['maj', 'min', 'min', 'maj', 'maj', 'min', 'dim'];
const TRIAD_SYMBOLS = ['', 'm', 'm', '', '', 'm', '°'];

export default function MusicTheoryTree({
  rootNote = 'C',
  f0 = 165,
  size = 400,
}) {
  const [colorSystem, setColorSystem] = useState('rainbow');
  const [preferFlats, setPreferFlats] = useState(false);
  const [selectedMode, setSelectedMode] = useState(null);
  const [showIntervals, setShowIntervals] = useState(true);

  const center = size / 2;
  const outerRadius = size / 2 - 30;

  // Build the scale
  const scale = useMemo(() => buildScale(rootNote, preferFlats), [rootNote, preferFlats]);

  // Get color for a note
  const getColor = (note) => {
    const system = COLOR_SYSTEMS[colorSystem];
    return system.colors[note] || '#888888';
  };

  // Calculate position on circle
  const getModePosition = (modeIndex) => {
    // 7 modes, starting from top
    const angle = (modeIndex * (360 / 7) - 90) * (Math.PI / 180);
    return {
      angle: modeIndex * (360 / 7) - 90,
      x: center + outerRadius * 0.75 * Math.cos(angle),
      y: center + outerRadius * 0.75 * Math.sin(angle),
    };
  };

  // Get note position within mode section
  const getNotePosition = (modeIndex, noteOffset, radius) => {
    const baseAngle = modeIndex * (360 / 7) - 90;
    const angle = (baseAngle + noteOffset) * (Math.PI / 180);
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  };

  return (
    <div className="flex flex-col items-center">
      {/* Controls */}
      <div className="flex flex-wrap gap-2 mb-4 justify-center">
        {/* Color system selector */}
        <div className="flex gap-1">
          {Object.entries(COLOR_SYSTEMS).map(([key, system]) => (
            <button
              key={key}
              onClick={() => setColorSystem(key)}
              className={`
                px-2 py-1 text-[9px] rounded border transition-all
                ${colorSystem === key
                  ? 'bg-signal-orange/20 border-signal-orange text-signal-orange'
                  : 'bg-carbon-800 border-carbon-700 text-carbon-500 hover:border-carbon-500'}
              `}
              title={system.description}
            >
              {system.name}
            </button>
          ))}
        </div>

        {/* Sharp/Flat toggle */}
        <button
          onClick={() => setPreferFlats(!preferFlats)}
          className={`px-2 py-1 text-[9px] rounded border transition-all ${
            preferFlats
              ? 'bg-purple-500/20 border-purple-500 text-purple-400'
              : 'bg-orange-500/20 border-orange-500 text-orange-400'
          }`}
        >
          {preferFlats ? 'b Flats' : '# Sharps'}
        </button>

        {/* Intervals toggle */}
        <button
          onClick={() => setShowIntervals(!showIntervals)}
          className={`px-2 py-1 text-[9px] rounded border transition-all ${
            showIntervals
              ? 'bg-carbon-700 border-carbon-500 text-carbon-300'
              : 'bg-carbon-800 border-carbon-700 text-carbon-500'
          }`}
        >
          {showIntervals ? 'Hide W/H' : 'Show W/H'}
        </button>
      </div>

      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <filter id="mtt-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Background circles */}
        <circle cx={center} cy={center} r={outerRadius} fill="none" stroke="#333" strokeWidth="1" />
        <circle cx={center} cy={center} r={outerRadius * 0.6} fill="none" stroke="#333" strokeWidth="1" />
        <circle cx={center} cy={center} r={outerRadius * 0.35} fill="none" stroke="#333" strokeWidth="1" />

        {/* Mode spokes */}
        {MODES.map((mode, modeIndex) => {
          const pos = getModePosition(modeIndex);
          return (
            <line
              key={`spoke-${modeIndex}`}
              x1={center}
              y1={center}
              x2={pos.x}
              y2={pos.y}
              stroke="#444"
              strokeWidth="1"
            />
          );
        })}

        {/* Scale notes in outer ring (colored by note) */}
        {scale.map((note, noteIndex) => {
          const angle = (noteIndex * (360 / 7) - 90) * (Math.PI / 180);
          const x = center + outerRadius * 0.92 * Math.cos(angle);
          const y = center + outerRadius * 0.92 * Math.sin(angle);

          return (
            <motion.g
              key={`scale-${noteIndex}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: noteIndex * 0.05 }}
            >
              <circle
                cx={x}
                cy={y}
                r={16}
                fill={getColor(note)}
                stroke="white"
                strokeWidth="2"
                filter="url(#mtt-glow)"
              />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="white"
                fontWeight="bold"
                fontSize="12"
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
              >
                {note}
              </text>
            </motion.g>
          );
        })}

        {/* Mode names and triads */}
        {MODES.map((mode, modeIndex) => {
          const pos = getModePosition(modeIndex);
          const triadNotes = getTriadNotes(scale, modeIndex);
          const triadSymbol = TRIAD_SYMBOLS[modeIndex];
          const isSelected = selectedMode === modeIndex;

          // Triad position (middle ring)
          const triadRadius = outerRadius * 0.55;
          const triadAngle = (modeIndex * (360 / 7) - 90) * (Math.PI / 180);
          const triadX = center + triadRadius * Math.cos(triadAngle);
          const triadY = center + triadRadius * Math.sin(triadAngle);

          // Mode name position (outer area)
          const nameRadius = outerRadius * 0.75;
          const nameX = center + nameRadius * Math.cos(triadAngle);
          const nameY = center + nameRadius * Math.sin(triadAngle);

          return (
            <motion.g
              key={`mode-${modeIndex}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + modeIndex * 0.05 }}
              onClick={() => setSelectedMode(isSelected ? null : modeIndex)}
              style={{ cursor: 'pointer' }}
            >
              {/* Triad chord bubble */}
              <circle
                cx={triadX}
                cy={triadY}
                r={20}
                fill={isSelected ? mode.color : '#262626'}
                stroke={mode.color}
                strokeWidth={isSelected ? 3 : 2}
              />
              <text
                x={triadX}
                y={triadY - 4}
                textAnchor="middle"
                dominantBaseline="central"
                fill={isSelected ? 'white' : mode.color}
                fontWeight="bold"
                fontSize="11"
              >
                {triadNotes[0]}{triadSymbol}
              </text>
              <text
                x={triadX}
                y={triadY + 8}
                textAnchor="middle"
                dominantBaseline="central"
                fill={isSelected ? 'rgba(255,255,255,0.7)' : '#888'}
                fontSize="8"
              >
                {mode.romanNumeral}
              </text>

              {/* Mode name (rotated to follow spoke) */}
              <text
                x={nameX}
                y={nameY}
                textAnchor="middle"
                dominantBaseline="central"
                fill={isSelected ? mode.color : '#666'}
                fontWeight={isSelected ? 'bold' : 'normal'}
                fontSize="9"
                transform={`rotate(${modeIndex * (360/7)}, ${nameX}, ${nameY})`}
              >
                {mode.name}
              </text>
            </motion.g>
          );
        })}

        {/* Center - Root note and intervals */}
        <circle
          cx={center}
          cy={center}
          r={35}
          fill="#1a1a1a"
          stroke={getColor(rootNote)}
          strokeWidth="3"
        />
        <text
          x={center}
          y={center - 8}
          textAnchor="middle"
          dominantBaseline="central"
          fill={getColor(rootNote)}
          fontWeight="bold"
          fontSize="20"
        >
          {rootNote}
        </text>
        <text
          x={center}
          y={center + 10}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#888"
          fontSize="10"
        >
          {f0} Hz
        </text>

        {/* Interval pattern around center (W/H) */}
        {showIntervals && MODES[0].intervals.map((interval, i) => {
          const innerRadius = outerRadius * 0.25;
          const angle = (i * (360 / 7) - 90 + 360/14) * (Math.PI / 180); // Offset to sit between notes
          const x = center + innerRadius * Math.cos(angle);
          const y = center + innerRadius * Math.sin(angle);

          return (
            <text
              key={`interval-${i}`}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="central"
              fill={interval === 'W' ? '#22c55e' : '#ef4444'}
              fontSize="10"
              fontWeight="bold"
            >
              {interval}
            </text>
          );
        })}
      </svg>

      {/* Selected mode info */}
      {selectedMode !== null && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 rounded-lg border max-w-sm"
          style={{
            backgroundColor: `${MODES[selectedMode].color}20`,
            borderColor: MODES[selectedMode].color,
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-bold" style={{ color: MODES[selectedMode].color }}>
              {MODES[selectedMode].name}
            </span>
            <span className="text-xs text-carbon-400">
              ({MODES[selectedMode].quality})
            </span>
          </div>
          <p className="text-xs text-carbon-400 mb-2">{MODES[selectedMode].mood}</p>
          <div className="flex gap-1">
            {MODES[selectedMode].intervals.map((int, i) => (
              <span
                key={i}
                className={`px-1.5 py-0.5 text-[9px] rounded ${
                  int === 'W' ? 'bg-green-500/30 text-green-400' : 'bg-red-500/30 text-red-400'
                }`}
              >
                {int}
              </span>
            ))}
          </div>
          <div className="mt-2 text-[10px] text-carbon-500">
            Triad: {getTriadNotes(scale, selectedMode).join(' - ')} ({TRIAD_QUALITIES[selectedMode]})
          </div>
        </motion.div>
      )}

      {/* Legend */}
      <div className="mt-4 p-3 bg-carbon-800 rounded-lg text-xs text-carbon-400 max-w-sm">
        <p className="font-medium text-carbon-300 mb-2">The 7 Modes</p>
        <p className="leading-relaxed">
          Each mode starts on a different degree of the major scale, creating unique interval patterns.
          The outer ring shows your scale notes, middle ring shows the triads built on each degree.
        </p>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-green-400 font-bold">W</span>
          <span className="text-carbon-500">= Whole step (2 semitones)</span>
          <span className="text-red-400 font-bold ml-2">H</span>
          <span className="text-carbon-500">= Half step (1 semitone)</span>
        </div>
      </div>

      {/* Color system info */}
      <div className="mt-2 text-[10px] text-carbon-500 text-center max-w-sm">
        Color system: <span className="text-carbon-300">{COLOR_SYSTEMS[colorSystem].name}</span> — {COLOR_SYSTEMS[colorSystem].description}
      </div>
    </div>
  );
}
