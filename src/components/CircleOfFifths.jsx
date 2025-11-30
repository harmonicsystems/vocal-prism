/**
 * CircleOfFifths Component
 * Clean visualization showing your personalized scale in the Circle of Fifths
 * Shows just intonation relationships based on your f0
 * NOW WITH AUDIO - click any note to hear it relative to your root!
 */

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { playTone, playInterval } from '../utils/playTone';

// Circle of Fifths - the standard 12 positions
// Starting from C at top (12 o'clock), moving clockwise by perfect fifths
// Sharp keys (right side): C→G→D→A→E→B→F#
// Flat keys (left side): C←F←Bb←Eb←Ab←Db←Gb
const CIRCLE_DATA = [
  { position: 0, note: 'C', enharmonic: null, minor: 'Am', sharps: 0, flats: 0 },
  { position: 1, note: 'G', enharmonic: null, minor: 'Em', sharps: 1, flats: 0 },
  { position: 2, note: 'D', enharmonic: null, minor: 'Bm', sharps: 2, flats: 0 },
  { position: 3, note: 'A', enharmonic: null, minor: 'F#m', sharps: 3, flats: 0 },
  { position: 4, note: 'E', enharmonic: null, minor: 'C#m', sharps: 4, flats: 0 },
  { position: 5, note: 'B', enharmonic: 'Cb', minor: 'G#m', sharps: 5, flats: 7 },
  { position: 6, note: 'F#', enharmonic: 'Gb', minor: 'D#m/Ebm', sharps: 6, flats: 6 },
  { position: 7, note: 'Db', enharmonic: 'C#', minor: 'Bbm', sharps: 7, flats: 5 },
  { position: 8, note: 'Ab', enharmonic: 'G#', minor: 'Fm', sharps: 8, flats: 4 },
  { position: 9, note: 'Eb', enharmonic: 'D#', minor: 'Cm', sharps: 9, flats: 3 },
  { position: 10, note: 'Bb', enharmonic: 'A#', minor: 'Gm', sharps: 10, flats: 2 },
  { position: 11, note: 'F', enharmonic: null, minor: 'Dm', sharps: 0, flats: 1 },
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

// Normalize note to standard spelling
function normalizeNote(note) {
  const normalized = {
    'Cb': 'B', 'B#': 'C', 'E#': 'F', 'Fb': 'E',
    'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb',
  };
  return normalized[note] || note;
}

// Find position in circle for a note
function findPosition(note) {
  const pitchClass = extractPitchClass(note);

  // Direct match first
  const direct = CIRCLE_DATA.find(c =>
    c.note === pitchClass || c.enharmonic === pitchClass
  );
  if (direct) return direct.position;

  // Try normalized
  const normalized = normalizeNote(pitchClass);
  const normalizedMatch = CIRCLE_DATA.find(c =>
    c.note === normalized || c.enharmonic === normalized
  );
  return normalizedMatch?.position ?? -1;
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
  const [playingPosition, setPlayingPosition] = useState(null);

  // Play a note from the circle
  const handlePlayNote = (position, isMinor = false) => {
    setPlayingPosition(position);
    const ratio = PYTHAGOREAN_RATIOS[position];

    // Calculate frequency from the ratio
    // Convert cents to frequency ratio: ratio = 2^(cents/1200)
    const freqRatio = Math.pow(2, ratio.cents / 1200);
    const noteFreq = f0 * freqRatio;

    // For minor keys, play a minor third above the root of that key
    if (isMinor) {
      // Minor key is 3 semitones below its relative major
      // Play the note then add minor third (6:5 ratio)
      playInterval(noteFreq, 1.2, { sequential: true, delay: 0.25, duration: 0.6 });
    } else {
      // Play root and this note together to hear the interval
      playInterval(f0, freqRatio, { sequential: false, duration: 0.8 });
    }

    setTimeout(() => setPlayingPosition(null), 800);
  };

  const center = size / 2;
  const outerRadius = size / 2 - 25;
  const mainRadius = outerRadius * 0.72;
  const minorRadius = outerRadius * 0.42;

  // Find root position
  const rootPosition = useMemo(() => {
    return findPosition(rootNote);
  }, [rootNote]);

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
    const data = CIRCLE_DATA[position];
    return scaleNotes.has(data.note) || (data.enharmonic && scaleNotes.has(data.enharmonic));
  };

  // Get display note name based on preference
  const getNoteName = (position) => {
    const data = CIRCLE_DATA[position];
    // Position 6 is the enharmonic pair F#/Gb
    if (position === 6) return preferFlats ? 'Gb' : 'F#';
    // For flat-side keys (positions 7-11), show enharmonic if preferring sharps
    if (position >= 7 && position <= 10 && !preferFlats && data.enharmonic) {
      return data.enharmonic;
    }
    return data.note;
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
          const isPlaying = playingPosition === i;

          return (
            <motion.g
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: isPlaying ? 1.15 : 1, opacity: 1 }}
              transition={{ delay: i * 0.04, type: 'spring', stiffness: 200 }}
              onClick={() => handlePlayNote(i)}
              style={{ cursor: 'pointer' }}
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
                {i === 0 ? '' :
                 i <= 5 ? `${item.sharps}♯` :
                 i === 6 ? '6♯/6♭' :
                 `${item.flats}♭`}
              </text>
            </motion.g>
          );
        })}

        {/* Inner minor circle */}
        {showMinor && CIRCLE_DATA.map((item, i) => {
          const pos = getPosition(i, minorRadius);
          const isRelativeMinor = i === rootPosition;
          const isPlayingMinor = playingPosition === i;

          return (
            <motion.g
              key={`minor-${i}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: isPlayingMinor ? 1.15 : 1, opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.03 }}
              onClick={() => handlePlayNote(i, true)}
              style={{ cursor: 'pointer' }}
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
                style={{ pointerEvents: 'none' }}
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
