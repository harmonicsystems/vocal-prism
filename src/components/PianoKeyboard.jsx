/**
 * PianoKeyboard Component
 * Visual keyboard showing personalized scale notes with cent deviations
 * Crystal clear highlighting with proper color contrast
 */

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';

// Piano key layout for one octave
const OCTAVE_KEYS = [
  { note: 'C', type: 'white', hasBlack: true },
  { note: 'C#', type: 'black' },
  { note: 'D', type: 'white', hasBlack: true },
  { note: 'D#', type: 'black' },
  { note: 'E', type: 'white', hasBlack: false },
  { note: 'F', type: 'white', hasBlack: true },
  { note: 'F#', type: 'black' },
  { note: 'G', type: 'white', hasBlack: true },
  { note: 'G#', type: 'black' },
  { note: 'A', type: 'white', hasBlack: true },
  { note: 'A#', type: 'black' },
  { note: 'B', type: 'white', hasBlack: false },
];

// Normalize note names for comparison (handle enharmonics)
function normalizeNote(note) {
  const enharmonics = {
    'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#',
  };
  // Extract just the pitch class (remove octave number)
  const pitchClass = note.replace(/[0-9]/g, '');
  return enharmonics[pitchClass] || pitchClass;
}

// Get octave from note name
function getOctave(note) {
  const match = note.match(/(\d+)$/);
  return match ? parseInt(match[1]) : 4;
}

export default function PianoKeyboard({
  scale = [],
  startOctave = 3,
  numOctaves = 2,
  highlightRoot = true,
  showLabels = true,
  showCents = true,
  compact = false
}) {
  const [hoveredKey, setHoveredKey] = useState(null);

  // Build a map of note -> scale data for quick lookup
  const scaleMap = useMemo(() => {
    const map = {};
    scale.forEach((s, index) => {
      const noteKey = normalizeNote(s.nearestPitch);
      const octave = getOctave(s.nearestPitch);
      const fullKey = `${noteKey}${octave}`;
      map[fullKey] = {
        ...s,
        isRoot: index === 0,
        degree: s.degree,
      };
    });
    return map;
  }, [scale]);

  // Get the root note for special highlighting
  const rootNote = scale[0] ? normalizeNote(scale[0].nearestPitch) : null;
  const rootOctave = scale[0] ? getOctave(scale[0].nearestPitch) : startOctave;

  // Generate all white keys for the range
  const whiteKeys = useMemo(() => {
    const keys = [];
    for (let octave = startOctave; octave < startOctave + numOctaves; octave++) {
      OCTAVE_KEYS.forEach(key => {
        if (key.type === 'white') {
          keys.push({
            ...key,
            fullNote: `${key.note}${octave}`,
            octave,
          });
        }
      });
    }
    return keys;
  }, [startOctave, numOctaves]);

  // Generate black keys with positions
  const blackKeys = useMemo(() => {
    const blacks = [];
    let whiteIndex = 0;

    for (let octave = startOctave; octave < startOctave + numOctaves; octave++) {
      OCTAVE_KEYS.forEach(key => {
        if (key.type === 'white') {
          if (key.hasBlack) {
            const blackNote = key.note + '#';
            blacks.push({
              note: blackNote,
              fullNote: `${blackNote}${octave}`,
              octave,
              position: whiteIndex,
            });
          }
          whiteIndex++;
        }
      });
    }
    return blacks;
  }, [startOctave, numOctaves]);

  const keyWidth = compact ? 28 : 40;
  const keyHeight = compact ? 100 : 140;
  const blackKeyWidth = compact ? 18 : 26;
  const blackKeyHeight = compact ? 60 : 85;

  // Get scale data for a key
  const getScaleData = (keyNote, octave) => {
    const fullKey = `${keyNote}${octave}`;
    return scaleMap[fullKey];
  };

  return (
    <div className="relative overflow-x-auto pb-2">
      <div
        className="relative flex"
        style={{
          height: keyHeight + 40, // Extra space for labels
          minWidth: whiteKeys.length * keyWidth
        }}
      >
        {/* White keys */}
        {whiteKeys.map((key, i) => {
          const scaleData = getScaleData(key.note, key.octave);
          const isActive = !!scaleData;
          const isRoot = scaleData?.isRoot;
          const isHovered = hoveredKey === key.fullNote;

          return (
            <motion.div
              key={key.fullNote}
              className="relative flex-shrink-0 flex flex-col cursor-pointer"
              style={{
                width: keyWidth,
                marginLeft: i === 0 ? 0 : -1,
                zIndex: isHovered ? 5 : 1
              }}
              onMouseEnter={() => setHoveredKey(key.fullNote)}
              onMouseLeave={() => setHoveredKey(null)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.015 }}
            >
              {/* The key itself */}
              <div
                className={`
                  relative flex-shrink-0 border rounded-b-md
                  flex flex-col items-center justify-end
                  transition-all duration-150
                  ${isActive
                    ? isRoot
                      ? 'bg-signal-orange border-signal-orange shadow-lg shadow-signal-orange/30'
                      : 'bg-signal-coral border-signal-coral shadow-md shadow-signal-coral/20'
                    : 'bg-white border-carbon-300 hover:bg-cream-100'
                  }
                `}
                style={{ height: keyHeight }}
              >
                {/* Note label at bottom of key */}
                {showLabels && (
                  <div className={`
                    absolute bottom-2 text-xs font-mono font-semibold
                    ${isActive ? 'text-white' : 'text-carbon-400'}
                  `}>
                    {key.note}
                  </div>
                )}

                {/* Active indicator dot */}
                {isActive && (
                  <div className={`
                    absolute top-3 w-2 h-2 rounded-full
                    ${isRoot ? 'bg-white' : 'bg-white/80'}
                  `} />
                )}
              </div>

              {/* Labels below the key */}
              {isActive && (
                <div className="mt-1 text-center">
                  <div className="text-[10px] font-bold text-carbon-700">
                    {scaleData.svara}
                  </div>
                  {showCents && (
                    <div className={`text-[9px] font-mono ${
                      Math.abs(scaleData.cents) < 5
                        ? 'text-carbon-400'
                        : 'text-signal-amber'
                    }`}>
                      {scaleData.cents >= 0 ? '+' : ''}{scaleData.cents}¢
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}

        {/* Black keys (positioned absolutely) */}
        {blackKeys.map((key, i) => {
          const scaleData = getScaleData(key.note, key.octave);
          const isActive = !!scaleData;
          const isRoot = scaleData?.isRoot;
          const leftOffset = (key.position + 1) * keyWidth - (blackKeyWidth / 2) - 1;
          const isHovered = hoveredKey === key.fullNote;

          return (
            <motion.div
              key={key.fullNote}
              className={`
                absolute rounded-b-md cursor-pointer
                transition-all duration-150
                ${isActive
                  ? isRoot
                    ? 'bg-signal-orange shadow-lg shadow-signal-orange/40'
                    : 'bg-signal-coral shadow-md shadow-signal-coral/30'
                  : 'bg-carbon-800 hover:bg-carbon-700'
                }
              `}
              style={{
                width: blackKeyWidth,
                height: blackKeyHeight,
                left: leftOffset,
                top: 0,
                zIndex: isHovered ? 10 : 2
              }}
              onMouseEnter={() => setHoveredKey(key.fullNote)}
              onMouseLeave={() => setHoveredKey(null)}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.015 }}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white" />
              )}

              {/* Svara label on black key if active */}
              {isActive && showLabels && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-bold text-white">
                  {scaleData.svara}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-xs text-carbon-500">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-signal-orange shadow-sm" />
          <span>Root (Sa)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-signal-coral shadow-sm" />
          <span>Scale Degrees</span>
        </div>
        {showCents && (
          <div className="flex items-center gap-2">
            <span className="text-signal-amber font-mono">±¢</span>
            <span>Cents from ET</span>
          </div>
        )}
      </div>

      {/* Hover tooltip */}
      {hoveredKey && scaleMap[hoveredKey] && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2
                     bg-carbon-900 text-white px-3 py-2 rounded-lg shadow-lg text-xs z-20"
        >
          <div className="font-bold">{scaleMap[hoveredKey].svara} ({scaleMap[hoveredKey].solfege})</div>
          <div className="text-carbon-300 font-mono">{scaleMap[hoveredKey].hz.toFixed(2)} Hz</div>
          <div className="text-carbon-400">
            {scaleMap[hoveredKey].nearestPitch}
            <span className={Math.abs(scaleMap[hoveredKey].cents) < 5 ? 'text-carbon-500' : 'text-signal-amber'}>
              {' '}{scaleMap[hoveredKey].cents >= 0 ? '+' : ''}{scaleMap[hoveredKey].cents}¢
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
