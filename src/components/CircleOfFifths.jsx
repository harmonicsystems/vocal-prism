/**
 * CircleOfFifths Component
 * Clean visualization showing your personalized scale in the Circle of Fifths
 * Shows just intonation relationships based on your f0
 */

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';

// Circle of fifths order (clockwise from top)
// Each position also stores enharmonic equivalents and both sharps/flats versions
const CIRCLE_DATA = [
  { position: 0, sharp: 'C', flat: 'C', major: 'C', minor: 'Am', accidentals: 0 },
  { position: 1, sharp: 'G', flat: 'G', major: 'G', minor: 'Em', accidentals: 1 },
  { position: 2, sharp: 'D', flat: 'D', major: 'D', minor: 'Bm', accidentals: 2 },
  { position: 3, sharp: 'A', flat: 'A', major: 'A', minor: 'F#m', accidentals: 3 },
  { position: 4, sharp: 'E', flat: 'E', major: 'E', minor: 'C#m', accidentals: 4 },
  { position: 5, sharp: 'B', flat: 'B', major: 'B', minor: 'G#m', accidentals: 5 },
  { position: 6, sharp: 'F#', flat: 'Gb', major: 'F#/Gb', minor: 'D#m/Ebm', accidentals: 6 },
  { position: 7, sharp: 'C#', flat: 'Db', major: 'Db', minor: 'Bbm', accidentals: 5 },
  { position: 8, sharp: 'G#', flat: 'Ab', major: 'Ab', minor: 'Fm', accidentals: 4 },
  { position: 9, sharp: 'D#', flat: 'Eb', major: 'Eb', minor: 'Cm', accidentals: 3 },
  { position: 10, sharp: 'A#', flat: 'Bb', major: 'Bb', minor: 'Gm', accidentals: 2 },
  { position: 11, sharp: 'E#', flat: 'F', major: 'F', minor: 'Dm', accidentals: 1 },
];

// Pythagorean ratios for just intonation circle of fifths
const PYTHAGOREAN_RATIOS = [
  { position: 0, ratio: '1:1', cents: 0 },      // Unison
  { position: 1, ratio: '3:2', cents: 702 },    // Perfect 5th
  { position: 2, ratio: '9:8', cents: 204 },    // Major 2nd (two 5ths up, octave down)
  { position: 3, ratio: '27:16', cents: 906 },  // Major 6th
  { position: 4, ratio: '81:64', cents: 408 },  // Major 3rd (Pythagorean)
  { position: 5, ratio: '243:128', cents: 1110 }, // Major 7th
  { position: 6, ratio: '729:512', cents: 612 }, // Tritone
  { position: 7, ratio: '1024:729', cents: 588 }, // Tritone (from flats side)
  { position: 8, ratio: '128:81', cents: 792 },  // Minor 6th
  { position: 9, ratio: '32:27', cents: 294 },   // Minor 3rd
  { position: 10, ratio: '16:9', cents: 996 },   // Minor 7th
  { position: 11, ratio: '4:3', cents: 498 },    // Perfect 4th
];

// Get note name from pitch (extract without octave)
function extractPitchClass(note) {
  return note?.replace(/[0-9]/g, '') || '';
}

// Find position in circle for a note
function findPosition(note, preferFlats) {
  const pitchClass = extractPitchClass(note);

  // Handle enharmonics
  const normalizedNote = pitchClass
    .replace('Cb', 'B')
    .replace('E#', 'F')
    .replace('B#', 'C')
    .replace('Fb', 'E');

  return CIRCLE_DATA.find(c =>
    c.sharp === normalizedNote ||
    c.flat === normalizedNote ||
    c.sharp === pitchClass ||
    c.flat === pitchClass
  )?.position ?? -1;
}

// Color palette
const COLORS = {
  root: '#f97316',       // signal-orange
  fifth: '#3b82f6',      // blue
  fourth: '#8b5cf6',     // purple
  adjacent: '#06b6d4',   // cyan
  tritone: '#ef4444',    // red
  inScale: '#10b981',    // emerald
  neutral: '#52525b',    // carbon-600
  neutralDark: '#3f3f46', // carbon-700
};

export default function CircleOfFifths({
  rootNote = 'C',
  scale = [],
  f0 = 165,
  size = 320,
}) {
  const [preferFlats, setPreferFlats] = useState(false);
  const [showMinor, setShowMinor] = useState(true);
  const [showRatios, setShowRatios] = useState(true);

  const center = size / 2;
  const outerRadius = size / 2 - 25;
  const mainRadius = outerRadius * 0.72;
  const minorRadius = outerRadius * 0.42;

  // Find root position
  const rootPosition = useMemo(() => {
    return findPosition(rootNote, preferFlats);
  }, [rootNote, preferFlats]);

  // Build set of scale notes (pitch classes only)
  const scaleNotes = useMemo(() => {
    const notes = new Set();
    scale.forEach(s => {
      const pc = extractPitchClass(s.nearestPitch);
      notes.add(pc);
      // Also add enharmonic
      const enharmonics = {
        'C#': 'Db', 'Db': 'C#',
        'D#': 'Eb', 'Eb': 'D#',
        'F#': 'Gb', 'Gb': 'F#',
        'G#': 'Ab', 'Ab': 'G#',
        'A#': 'Bb', 'Bb': 'A#',
      };
      if (enharmonics[pc]) notes.add(enharmonics[pc]);
    });
    return notes;
  }, [scale]);

  // Calculate position on circle
  const getPosition = (index, radius) => {
    const angle = (index * 30 - 90) * (Math.PI / 180);
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  };

  // Get relationship color
  const getColor = (position) => {
    if (rootPosition === -1) return COLORS.neutral;

    const interval = (position - rootPosition + 12) % 12;

    if (interval === 0) return COLORS.root;
    if (interval === 7) return COLORS.fifth; // Dominant (clockwise)
    if (interval === 5) return COLORS.fourth; // Subdominant (counter-clockwise)
    if (interval === 1 || interval === 11) return COLORS.adjacent;
    if (interval === 6) return COLORS.tritone;

    return COLORS.neutral;
  };

  // Check if note is in user's scale
  const isInScale = (position) => {
    const note = CIRCLE_DATA[position];
    return scaleNotes.has(note.sharp) || scaleNotes.has(note.flat);
  };

  // Get display note name based on preference
  const getNoteName = (position) => {
    const note = CIRCLE_DATA[position];
    // At position 6, show both; otherwise prefer based on setting
    if (position === 6) return preferFlats ? note.flat : note.sharp;
    // For positions 7-11 (flat side), prefer flats
    if (position >= 7 && position <= 11) return preferFlats ? note.flat : note.sharp;
    return note.sharp;
  };

  return (
    <div className="flex flex-col items-center">
      {/* Controls */}
      <div className="flex gap-4 mb-4 text-xs">
        <button
          onClick={() => setPreferFlats(!preferFlats)}
          className={`px-3 py-1.5 rounded-lg border transition-all ${
            preferFlats
              ? 'bg-purple-500/20 border-purple-500 text-purple-400'
              : 'bg-orange-500/20 border-orange-500 text-orange-400'
          }`}
        >
          {preferFlats ? 'Prefer Flats (b)' : 'Prefer Sharps (#)'}
        </button>
        <button
          onClick={() => setShowMinor(!showMinor)}
          className={`px-3 py-1.5 rounded-lg border transition-all ${
            showMinor
              ? 'bg-carbon-700 border-carbon-500 text-carbon-300'
              : 'bg-carbon-800 border-carbon-700 text-carbon-500'
          }`}
        >
          {showMinor ? 'Hide Minor' : 'Show Minor'}
        </button>
        <button
          onClick={() => setShowRatios(!showRatios)}
          className={`px-3 py-1.5 rounded-lg border transition-all ${
            showRatios
              ? 'bg-carbon-700 border-carbon-500 text-carbon-300'
              : 'bg-carbon-800 border-carbon-700 text-carbon-500'
          }`}
        >
          {showRatios ? 'Hide Ratios' : 'Show Ratios'}
        </button>
      </div>

      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <filter id="cof-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <radialGradient id="cof-center-gradient">
            <stop offset="0%" stopColor="#262626" />
            <stop offset="100%" stopColor="#171717" />
          </radialGradient>
        </defs>

        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={outerRadius}
          fill="none"
          stroke="#404040"
          strokeWidth="1"
        />

        {/* Connecting lines to dominant and subdominant */}
        {rootPosition !== -1 && (
          <>
            {/* Line to dominant (P5, clockwise) */}
            <motion.line
              x1={getPosition(rootPosition, mainRadius).x}
              y1={getPosition(rootPosition, mainRadius).y}
              x2={getPosition((rootPosition + 7) % 12, mainRadius).x}
              y2={getPosition((rootPosition + 7) % 12, mainRadius).y}
              stroke={COLORS.fifth}
              strokeWidth="2"
              strokeDasharray="4 4"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.6 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
            {/* Line to subdominant (P4, counter-clockwise) */}
            <motion.line
              x1={getPosition(rootPosition, mainRadius).x}
              y1={getPosition(rootPosition, mainRadius).y}
              x2={getPosition((rootPosition + 5) % 12, mainRadius).x}
              y2={getPosition((rootPosition + 5) % 12, mainRadius).y}
              stroke={COLORS.fourth}
              strokeWidth="2"
              strokeDasharray="4 4"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.6 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            />
          </>
        )}

        {/* Main notes (major keys) */}
        {CIRCLE_DATA.map((item, i) => {
          const pos = getPosition(i, mainRadius);
          const color = getColor(i);
          const isRoot = i === rootPosition;
          const inScale = isInScale(i);
          const noteName = getNoteName(i);
          const ratio = PYTHAGOREAN_RATIOS[i];

          return (
            <motion.g
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.04, type: 'spring', stiffness: 200 }}
            >
              {/* In-scale indicator ring */}
              {inScale && !isRoot && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isRoot ? 26 : 22}
                  fill="none"
                  stroke={COLORS.inScale}
                  strokeWidth="2"
                  strokeDasharray="3 2"
                  opacity="0.7"
                />
              )}

              {/* Main circle */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={isRoot ? 24 : 20}
                fill={color}
                filter={isRoot ? 'url(#cof-glow)' : undefined}
                opacity={isRoot ? 1 : 0.85}
              />

              {/* Note name */}
              <text
                x={pos.x}
                y={pos.y + (showRatios ? -3 : 1)}
                textAnchor="middle"
                dominantBaseline="central"
                fill="white"
                fontWeight="bold"
                fontSize={isRoot ? 14 : 12}
                fontFamily="system-ui, sans-serif"
              >
                {noteName}
              </text>

              {/* Ratio (if showing) */}
              {showRatios && (
                <text
                  x={pos.x}
                  y={pos.y + 9}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="rgba(255,255,255,0.6)"
                  fontSize="7"
                  fontFamily="monospace"
                >
                  {ratio.ratio}
                </text>
              )}

              {/* Accidentals count (outside) */}
              <text
                x={pos.x + (Math.cos((i * 30 - 90) * Math.PI / 180) * 35)}
                y={pos.y + (Math.sin((i * 30 - 90) * Math.PI / 180) * 35)}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#737373"
                fontSize="9"
                fontFamily="system-ui, sans-serif"
              >
                {i === 0 ? '' : i <= 6 ? `${item.accidentals}#` : `${item.accidentals}b`}
              </text>
            </motion.g>
          );
        })}

        {/* Inner minor circle */}
        {showMinor && CIRCLE_DATA.map((item, i) => {
          const pos = getPosition(i, minorRadius);
          const isRelativeMinor = i === rootPosition;

          return (
            <motion.g
              key={`minor-${i}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.03 }}
            >
              <circle
                cx={pos.x}
                cy={pos.y}
                r={13}
                fill={isRelativeMinor ? '#fb7185' : '#3f3f46'}
              />
              <text
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill={isRelativeMinor ? 'white' : '#a1a1aa'}
                fontSize="8"
                fontFamily="system-ui, sans-serif"
              >
                {item.minor.split('/')[0]}
              </text>
            </motion.g>
          );
        })}

        {/* Center display */}
        <circle
          cx={center}
          cy={center}
          r={28}
          fill="url(#cof-center-gradient)"
          stroke="#525252"
          strokeWidth="1"
        />
        <text
          x={center}
          y={center - 6}
          textAnchor="middle"
          dominantBaseline="central"
          fill={COLORS.root}
          fontWeight="bold"
          fontSize="16"
          fontFamily="system-ui, sans-serif"
        >
          {rootPosition !== -1 ? getNoteName(rootPosition) : '?'}
        </text>
        <text
          x={center}
          y={center + 8}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#a1a1aa"
          fontSize="8"
          fontFamily="system-ui, sans-serif"
        >
          {f0} Hz
        </text>
      </svg>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 gap-2 text-[10px]">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.root }} />
          <span className="text-carbon-400">Your Root</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.fifth }} />
          <span className="text-carbon-400">Dominant (V)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.fourth }} />
          <span className="text-carbon-400">Subdominant (IV)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full border-2 border-dashed" style={{ borderColor: COLORS.inScale }} />
          <span className="text-carbon-400">In Your Scale</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.tritone }} />
          <span className="text-carbon-400">Tritone</span>
        </div>
      </div>

      {/* Musical insight */}
      {rootPosition !== -1 && (
        <div className="mt-4 p-3 bg-carbon-800 rounded-lg text-xs text-carbon-400 max-w-sm">
          <p className="font-medium text-carbon-300 mb-1">Pythagorean Tuning</p>
          <p className="leading-relaxed">
            The Circle of Fifths represents stacking perfect 3:2 fifths. Your root{' '}
            <span className="text-signal-orange font-medium">{getNoteName(rootPosition)}</span>{' '}
            leads to{' '}
            <span className="text-blue-400 font-medium">{getNoteName((rootPosition + 7) % 12)}</span>{' '}
            (dominant) and{' '}
            <span className="text-purple-400 font-medium">{getNoteName((rootPosition + 5) % 12)}</span>{' '}
            (subdominant) - the foundation of harmony.
          </p>
        </div>
      )}
    </div>
  );
}
