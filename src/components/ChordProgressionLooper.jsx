/**
 * ChordProgressionLooper Component
 * Loop through chord progressions based on your personalized f0
 *
 * Features:
 * - Preset progressions (I-IV-V-I, ii-V-I, etc.)
 * - Custom chord building
 * - Tempo control with visual metronome
 * - Smooth chord transitions
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAudioContext, unlockAudioSync } from '../utils/mobileAudio';
import { AudioUnlockInline } from './AudioUnlockButton';

// Chord definitions (intervals from root in semitones)
const CHORD_TYPES = {
  major: { name: 'Major', intervals: [0, 4, 7], symbol: '' },
  minor: { name: 'Minor', intervals: [0, 3, 7], symbol: 'm' },
  dim: { name: 'Dim', intervals: [0, 3, 6], symbol: '°' },
  aug: { name: 'Aug', intervals: [0, 4, 8], symbol: '+' },
  sus2: { name: 'Sus2', intervals: [0, 2, 7], symbol: 'sus2' },
  sus4: { name: 'Sus4', intervals: [0, 5, 7], symbol: 'sus4' },
  maj7: { name: 'Maj7', intervals: [0, 4, 7, 11], symbol: 'maj7' },
  min7: { name: 'Min7', intervals: [0, 3, 7, 10], symbol: 'm7' },
  dom7: { name: 'Dom7', intervals: [0, 4, 7, 10], symbol: '7' },
  power: { name: 'Power', intervals: [0, 7], symbol: '5' },
};

// Scale degrees (semitones from root) for building progressions
const SCALE_DEGREES = {
  // Basic diatonic triads (Ionian/Major)
  'I': { semitones: 0, type: 'major' },
  'ii': { semitones: 2, type: 'minor' },
  'iii': { semitones: 4, type: 'minor' },
  'IV': { semitones: 5, type: 'major' },
  'V': { semitones: 7, type: 'major' },
  'vi': { semitones: 9, type: 'minor' },
  'vii°': { semitones: 11, type: 'dim' },

  // Seventh chords
  'I7': { semitones: 0, type: 'dom7' },
  'IV7': { semitones: 5, type: 'dom7' },
  'V7': { semitones: 7, type: 'dom7' },
  'ii7': { semitones: 2, type: 'min7' },
  'iii7': { semitones: 4, type: 'min7' },
  'vi7': { semitones: 9, type: 'min7' },
  'Imaj7': { semitones: 0, type: 'maj7' },
  'IVmaj7': { semitones: 5, type: 'maj7' },

  // Modal interchange (borrowed chords)
  'bII': { semitones: 1, type: 'major' },    // Neapolitan
  'bIII': { semitones: 3, type: 'major' },   // From minor
  'bVI': { semitones: 8, type: 'major' },    // From minor
  'bVII': { semitones: 10, type: 'major' },  // Mixolydian/minor
  'iv': { semitones: 5, type: 'minor' },     // Minor iv (from minor)
  'i': { semitones: 0, type: 'minor' },      // Minor tonic

  // Secondary dominants
  'V/V': { semitones: 2, type: 'major' },    // V of V (D in C)
  'V/ii': { semitones: 9, type: 'major' },   // V of ii
  'V/vi': { semitones: 4, type: 'major' },   // V of vi (E in C)

  // Diminished
  'vii°/V': { semitones: 6, type: 'dim' },   // Leading tone to V

  // Suspended
  'Isus4': { semitones: 0, type: 'sus4' },
  'IVsus2': { semitones: 5, type: 'sus2' },
  'Vsus4': { semitones: 7, type: 'sus4' },

  // Power chords
  'I5': { semitones: 0, type: 'power' },
  'IV5': { semitones: 5, type: 'power' },
  'V5': { semitones: 7, type: 'power' },
  'bVII5': { semitones: 10, type: 'power' },
};

// Progression categories for organization
const PROGRESSION_CATEGORIES = [
  { id: 'popular', name: 'Popular', color: 'orange' },
  { id: 'jazz', name: 'Jazz', color: 'purple' },
  { id: 'blues', name: 'Blues', color: 'blue' },
  { id: 'modal', name: 'Modal', color: 'cyan' },
  { id: 'classical', name: 'Classical', color: 'amber' },
  { id: 'rock', name: 'Rock', color: 'red' },
];

// Preset progressions organized by category
const PROGRESSIONS = [
  // === POPULAR ===
  {
    id: 'pop',
    name: 'Pop Anthem',
    chords: ['I', 'V', 'vi', 'IV'],
    description: 'Most used progression ever (Axis of Awesome)',
    genre: 'Pop',
    category: 'popular'
  },
  {
    id: 'doowop',
    name: "50s Doo-wop",
    chords: ['I', 'vi', 'IV', 'V'],
    description: "Stand By Me, Earth Angel",
    genre: 'Oldies',
    category: 'popular'
  },
  {
    id: 'sadpop',
    name: 'Sensitive',
    chords: ['vi', 'IV', 'I', 'V'],
    description: 'Despacito, Someone Like You',
    genre: 'Pop',
    category: 'popular'
  },
  {
    id: 'classic145',
    name: 'Classic I-IV-V',
    chords: ['I', 'IV', 'V', 'I'],
    description: 'Foundation of Western harmony',
    genre: 'Folk',
    category: 'popular'
  },
  {
    id: 'optimistic',
    name: 'Uplifting',
    chords: ['I', 'IV', 'vi', 'V'],
    description: 'Bright and hopeful feel',
    genre: 'Pop',
    category: 'popular'
  },

  // === JAZZ ===
  {
    id: 'jazz251',
    name: 'ii-V-I',
    chords: ['ii7', 'V7', 'Imaj7'],
    description: 'The most important jazz progression',
    genre: 'Jazz',
    category: 'jazz'
  },
  {
    id: 'jazz1625',
    name: 'Rhythm Changes',
    chords: ['Imaj7', 'vi7', 'ii7', 'V7'],
    description: 'I Got Rhythm turnaround',
    genre: 'Jazz',
    category: 'jazz'
  },
  {
    id: 'jazzminor',
    name: 'Minor ii-V-i',
    chords: ['ii7', 'V7', 'i'],
    description: 'Minor key jazz resolution',
    genre: 'Jazz',
    category: 'jazz'
  },
  {
    id: 'coltrane',
    name: 'Giant Steps',
    chords: ['Imaj7', 'bIII', 'V7', 'I'],
    description: 'Coltrane changes (simplified)',
    genre: 'Jazz',
    category: 'jazz'
  },
  {
    id: 'autumn',
    name: 'Autumn Leaves',
    chords: ['ii7', 'V7', 'Imaj7', 'IV', 'ii7', 'V7', 'vi'],
    description: 'Classic jazz standard',
    genre: 'Jazz',
    category: 'jazz'
  },

  // === BLUES ===
  {
    id: 'blues12',
    name: '12-Bar Blues',
    chords: ['I7', 'I7', 'I7', 'I7', 'IV7', 'IV7', 'I7', 'I7', 'V7', 'IV7', 'I7', 'V7'],
    description: 'The foundation of blues and rock',
    genre: 'Blues',
    category: 'blues'
  },
  {
    id: 'blues8',
    name: '8-Bar Blues',
    chords: ['I7', 'V7', 'IV7', 'IV7', 'I7', 'V7', 'I7', 'V7'],
    description: 'Shorter blues form',
    genre: 'Blues',
    category: 'blues'
  },
  {
    id: 'quickchange',
    name: 'Quick Change',
    chords: ['I7', 'IV7', 'I7', 'I7', 'IV7', 'IV7', 'I7', 'I7', 'V7', 'IV7', 'I7', 'V7'],
    description: '12-bar with quick IV in bar 2',
    genre: 'Blues',
    category: 'blues'
  },
  {
    id: 'minorblues',
    name: 'Minor Blues',
    chords: ['i', 'i', 'i', 'i', 'iv', 'iv', 'i', 'i', 'V7', 'iv', 'i', 'V7'],
    description: 'The Thrill Is Gone',
    genre: 'Blues',
    category: 'blues'
  },

  // === MODAL ===
  {
    id: 'dorian',
    name: 'Dorian Vamp',
    chords: ['i', 'IV'],
    description: 'So What, Oye Como Va',
    genre: 'Modal',
    category: 'modal'
  },
  {
    id: 'mixolydian',
    name: 'Mixolydian',
    chords: ['I', 'bVII', 'IV', 'I'],
    description: 'Sweet Home Alabama feel',
    genre: 'Modal',
    category: 'modal'
  },
  {
    id: 'phrygian',
    name: 'Phrygian',
    chords: ['i', 'bII'],
    description: 'Dark, Spanish sound',
    genre: 'Modal',
    category: 'modal'
  },
  {
    id: 'aeolian',
    name: 'Aeolian (Natural Minor)',
    chords: ['i', 'bVII', 'bVI', 'V'],
    description: 'Stairway to Heaven intro',
    genre: 'Modal',
    category: 'modal'
  },
  {
    id: 'lydian',
    name: 'Lydian Lift',
    chords: ['I', 'II', 'IV', 'I'],
    description: 'Dreamy, floating (#4) sound',
    genre: 'Modal',
    category: 'modal'
  },

  // === CLASSICAL ===
  {
    id: 'pachelbel',
    name: 'Canon in D',
    chords: ['I', 'V', 'vi', 'iii', 'IV', 'I', 'IV', 'V'],
    description: "Pachelbel's famous progression",
    genre: 'Classical',
    category: 'classical'
  },
  {
    id: 'andalusian',
    name: 'Andalusian Cadence',
    chords: ['vi', 'V', 'IV', 'iii'],
    description: 'Flamenco descending line',
    genre: 'Classical',
    category: 'classical'
  },
  {
    id: 'romanesca',
    name: 'Romanesca',
    chords: ['I', 'IV', 'I', 'V', 'I', 'IV', 'V', 'I'],
    description: 'Renaissance standard',
    genre: 'Classical',
    category: 'classical'
  },
  {
    id: 'lament',
    name: 'Lament Bass',
    chords: ['i', 'V/vi', 'bVI', 'V'],
    description: 'Descending chromatic bass',
    genre: 'Classical',
    category: 'classical'
  },
  {
    id: 'plagal',
    name: 'Plagal (Amen)',
    chords: ['IV', 'I'],
    description: 'The "Amen" cadence',
    genre: 'Classical',
    category: 'classical'
  },

  // === ROCK ===
  {
    id: 'powerrock',
    name: 'Power Rock',
    chords: ['I5', 'bVII5', 'IV5', 'I5'],
    description: 'Heavy riff progression',
    genre: 'Rock',
    category: 'rock'
  },
  {
    id: 'grunge',
    name: 'Grunge',
    chords: ['I5', 'IV5', 'bVII5', 'I5'],
    description: 'Smells Like Teen Spirit feel',
    genre: 'Rock',
    category: 'rock'
  },
  {
    id: 'metal',
    name: 'Metal Riff',
    chords: ['i', 'bVI', 'bVII', 'i'],
    description: 'Iron Maiden style',
    genre: 'Rock',
    category: 'rock'
  },
  {
    id: 'punk',
    name: 'Punk',
    chords: ['I', 'IV', 'V', 'V'],
    description: 'Fast and simple',
    genre: 'Rock',
    category: 'rock'
  },
  {
    id: 'creep',
    name: 'Creep',
    chords: ['I', 'iii', 'IV', 'iv'],
    description: 'Radiohead\'s famous minor iv',
    genre: 'Rock',
    category: 'rock'
  },
];

export default function ChordProgressionLooper({ f0 = 165 }) {
  const audioContextRef = useRef(null);
  const oscillatorsRef = useRef([]);
  const masterGainRef = useRef(null);
  const intervalRef = useRef(null);

  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedProgression, setSelectedProgression] = useState('pop');
  const [selectedCategory, setSelectedCategory] = useState('popular');
  const [currentChordIndex, setCurrentChordIndex] = useState(0);
  const [tempo, setTempo] = useState(80); // BPM
  const [volume, setVolume] = useState(0.5);
  const [waveType, setWaveType] = useState('triangle');
  const [beatsPerChord, setBeatsPerChord] = useState(4);
  const [beatCount, setBeatCount] = useState(0);

  const currentProgression = PROGRESSIONS.find(p => p.id === selectedProgression) || PROGRESSIONS[0];
  const filteredProgressions = PROGRESSIONS.filter(p => p.category === selectedCategory);

  // Get frequency for a chord at given root offset (in semitones)
  const getChordFrequencies = useCallback((chordDef) => {
    const degree = SCALE_DEGREES[chordDef];
    if (!degree) return [f0];

    const rootHz = f0 * Math.pow(2, degree.semitones / 12);
    const chord = CHORD_TYPES[degree.type];
    if (!chord) return [rootHz];

    return chord.intervals.map(interval =>
      rootHz * Math.pow(2, interval / 12)
    );
  }, [f0]);

  // Initialize audio
  const initAudio = useCallback(async () => {
    const ctx = await getAudioContext();
    if (!ctx) return null;

    if (!audioContextRef.current || audioContextRef.current !== ctx) {
      audioContextRef.current = ctx;
      masterGainRef.current = ctx.createGain();
      masterGainRef.current.gain.value = volume * 0.15;
      masterGainRef.current.connect(ctx.destination);
    }

    return ctx;
  }, [volume]);

  // Play a chord
  const playChord = useCallback((chordDef) => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    // Stop existing oscillators with fade out
    oscillatorsRef.current.forEach(({ osc, gain }) => {
      try {
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.08);
        setTimeout(() => {
          try { osc.stop(); osc.disconnect(); } catch (e) {}
        }, 100);
      } catch (e) {}
    });
    oscillatorsRef.current = [];

    // Get frequencies for new chord
    const frequencies = getChordFrequencies(chordDef);

    // Create oscillators for each note
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = waveType;
      osc.frequency.value = freq;

      // Stagger attacks slightly for richness
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(
        0.3 / frequencies.length,
        ctx.currentTime + 0.05 + (i * 0.02)
      );

      osc.connect(gain);
      gain.connect(masterGainRef.current);
      osc.start();

      oscillatorsRef.current.push({ osc, gain });
    });
  }, [getChordFrequencies, waveType]);

  // Start the loop
  const startLoop = useCallback(() => {
    // CRITICAL: Sync unlock first for Safari
    unlockAudioSync();

    (async () => {
      const ctx = await initAudio();
      if (!ctx) return;

      setCurrentChordIndex(0);
      setBeatCount(0);
      playChord(currentProgression.chords[0]);
      setIsPlaying(true);

      // Calculate interval: (60 / tempo) * 1000 ms per beat * beatsPerChord
      const msPerChord = (60 / tempo) * 1000 * beatsPerChord;
      const msPerBeat = (60 / tempo) * 1000;

      let beat = 0;
      let chordIdx = 0;

      intervalRef.current = setInterval(() => {
        beat++;
        setBeatCount(beat % beatsPerChord);

        // Move to next chord
        if (beat % beatsPerChord === 0) {
          chordIdx = (chordIdx + 1) % currentProgression.chords.length;
          setCurrentChordIndex(chordIdx);
          playChord(currentProgression.chords[chordIdx]);
        }
      }, msPerBeat);
    })();
  }, [initAudio, currentProgression, tempo, beatsPerChord, playChord]);

  // Stop the loop
  const stopLoop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Fade out all oscillators
    const ctx = audioContextRef.current;
    if (ctx) {
      oscillatorsRef.current.forEach(({ osc, gain }) => {
        try {
          gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
          setTimeout(() => {
            try { osc.stop(); osc.disconnect(); } catch (e) {}
          }, 250);
        } catch (e) {}
      });
    }
    oscillatorsRef.current = [];
    setIsPlaying(false);
    setCurrentChordIndex(0);
    setBeatCount(0);
  }, []);

  // Toggle play
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      stopLoop();
    } else {
      startLoop();
    }
  }, [isPlaying, startLoop, stopLoop]);

  // Update tempo in real-time
  useEffect(() => {
    if (isPlaying) {
      stopLoop();
      startLoop();
    }
  }, [tempo, beatsPerChord]);

  // Update volume
  useEffect(() => {
    if (masterGainRef.current && audioContextRef.current) {
      masterGainRef.current.gain.linearRampToValueAtTime(
        volume * 0.15,
        audioContextRef.current.currentTime + 0.1
      );
    }
  }, [volume]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      oscillatorsRef.current.forEach(({ osc }) => {
        try { osc.stop(); } catch (e) {}
      });
    };
  }, []);

  // Get display name for chord
  const getChordDisplay = (chordDef) => {
    const degree = SCALE_DEGREES[chordDef];
    if (!degree) return chordDef;

    // Map semitones to note names (relative to f0)
    const noteNames = ['1', 'b2', '2', 'b3', '3', '4', 'b5', '5', 'b6', '6', 'b7', '7'];
    const chord = CHORD_TYPES[degree.type];
    return chordDef;
  };

  return (
    <div className="bg-carbon-900 rounded-lg p-4 text-white font-mono">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-carbon-200 font-semibold flex items-center gap-2">
            <span className="text-xl">🎵</span>
            Chord Progression Looper
          </h3>
          <p className="text-[10px] text-carbon-500 mt-0.5">
            Loop through common progressions at your f0: {f0} Hz
          </p>
        </div>
        <button
          onClick={togglePlay}
          className={`
            px-5 py-2.5 rounded-lg flex items-center gap-2
            transition-all duration-200 border-2 font-bold text-sm
            ${isPlaying
              ? 'bg-signal-orange border-signal-orange text-carbon-900'
              : 'bg-carbon-800 border-carbon-600 text-carbon-400 hover:border-carbon-400'}
          `}
        >
          <span className="text-lg">{isPlaying ? '■' : '▶'}</span>
          <span>{isPlaying ? 'STOP' : 'PLAY'}</span>
        </button>
      </div>

      {/* Mobile audio unlock */}
      <AudioUnlockInline />

      {/* Progression selector */}
      <div className="mb-4">
        {/* Category tabs */}
        <div className="flex flex-wrap gap-1 mb-3">
          {PROGRESSION_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`
                px-3 py-1.5 text-[10px] rounded-lg border transition-all font-medium
                ${selectedCategory === cat.id
                  ? cat.color === 'orange' ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                  : cat.color === 'purple' ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                  : cat.color === 'blue' ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                  : cat.color === 'cyan' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                  : cat.color === 'amber' ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                  : 'bg-red-500/20 border-red-500 text-red-400'
                  : 'bg-carbon-800 border-carbon-700 text-carbon-500 hover:border-carbon-500'}
              `}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Progressions in selected category */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {filteredProgressions.map(prog => (
            <button
              key={prog.id}
              onClick={() => {
                setSelectedProgression(prog.id);
                if (isPlaying) {
                  stopLoop();
                }
              }}
              className={`
                p-2.5 rounded-lg border text-left transition-all
                ${selectedProgression === prog.id
                  ? 'bg-signal-orange/20 border-signal-orange text-signal-orange'
                  : 'bg-carbon-800 border-carbon-700 text-carbon-400 hover:border-carbon-500'}
              `}
            >
              <div className="text-xs font-bold truncate">{prog.name}</div>
              <div className="text-[9px] opacity-70 mt-0.5">{prog.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Current progression display */}
      <div className="mb-4 bg-carbon-800 rounded-lg p-4">
        <div className="text-[10px] text-carbon-500 uppercase tracking-wider mb-2">
          {currentProgression.name}
        </div>
        <p className="text-xs text-carbon-400 mb-3">{currentProgression.description}</p>

        {/* Chord boxes */}
        <div className="flex flex-wrap gap-2 justify-center">
          {currentProgression.chords.map((chord, idx) => {
            const isActive = isPlaying && idx === currentChordIndex;
            return (
              <motion.div
                key={`${chord}-${idx}`}
                className={`
                  w-12 h-12 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center
                  border-2 transition-all duration-150
                  ${isActive
                    ? 'bg-signal-orange border-signal-orange text-carbon-900 scale-110 shadow-lg shadow-signal-orange/30'
                    : 'bg-carbon-700 border-carbon-600 text-carbon-300'}
                `}
                animate={isActive ? { scale: [1.1, 1.15, 1.1] } : {}}
                transition={{ duration: 0.3, repeat: isActive ? Infinity : 0 }}
              >
                <span className="text-sm sm:text-lg font-bold">{chord}</span>
              </motion.div>
            );
          })}
        </div>

        {/* Beat indicator */}
        {isPlaying && (
          <div className="mt-4 flex justify-center gap-1.5">
            {Array.from({ length: beatsPerChord }).map((_, i) => (
              <motion.div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i === beatCount
                    ? 'bg-signal-orange'
                    : 'bg-carbon-600'
                }`}
                animate={i === beatCount ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.15 }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Tempo */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-carbon-500 uppercase tracking-wider">
              Tempo
            </span>
            <span className="text-xs text-signal-orange font-bold">{tempo} BPM</span>
          </div>
          <input
            type="range"
            min="40"
            max="180"
            step="5"
            value={tempo}
            onChange={(e) => setTempo(parseInt(e.target.value))}
            className="w-full h-2 bg-carbon-700 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-signal-orange
              [&::-webkit-slider-thumb]:cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-carbon-500 mt-1">
            <span>40</span>
            <span>Slow</span>
            <span>Medium</span>
            <span>Fast</span>
            <span>180</span>
          </div>
        </div>

        {/* Beats per chord */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-carbon-500 uppercase tracking-wider">
              Beats per chord
            </span>
            <span className="text-xs text-carbon-400">{beatsPerChord} beats</span>
          </div>
          <div className="flex gap-2">
            {[1, 2, 4, 8].map(beats => (
              <button
                key={beats}
                onClick={() => setBeatsPerChord(beats)}
                className={`
                  flex-1 py-2 text-xs rounded border transition-all
                  ${beatsPerChord === beats
                    ? 'bg-carbon-700 border-signal-coral text-signal-coral'
                    : 'bg-carbon-800 border-carbon-700 text-carbon-400 hover:border-carbon-500'}
                `}
              >
                {beats}
              </button>
            ))}
          </div>
        </div>

        {/* Volume */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-carbon-500 uppercase tracking-wider">Volume</span>
            <span className="text-xs text-carbon-400">{Math.round(volume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full h-2 bg-carbon-700 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-signal-orange
              [&::-webkit-slider-thumb]:cursor-pointer"
          />
        </div>

        {/* Wave type */}
        <div>
          <div className="text-[10px] text-carbon-500 uppercase tracking-wider mb-2">
            Tone
          </div>
          <div className="flex gap-2">
            {['sine', 'triangle', 'sawtooth'].map(type => (
              <button
                key={type}
                onClick={() => setWaveType(type)}
                className={`
                  flex-1 py-2 text-[10px] rounded border transition-all capitalize
                  ${waveType === type
                    ? 'bg-carbon-700 border-signal-coral text-signal-coral'
                    : 'bg-carbon-800 border-carbon-700 text-carbon-400 hover:border-carbon-500'}
                `}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Playing indicator */}
      <AnimatePresence>
        {isPlaying && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-3 border-t border-carbon-700"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-signal-orange animate-pulse" />
              <span className="text-[10px] text-carbon-400">
                Playing {currentProgression.name} at {tempo} BPM
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Music theory info */}
      <div className="mt-4 pt-3 border-t border-carbon-700">
        <details className="text-[10px] text-carbon-500">
          <summary className="cursor-pointer hover:text-carbon-300">About chord progressions</summary>
          <div className="mt-2 space-y-1 leading-relaxed">
            <p>Roman numerals represent chords built on each scale degree. Uppercase = major, lowercase = minor.</p>
            <p>I = root, IV = fourth, V = fifth. These three chords form the backbone of Western music.</p>
            <p>The I-V-vi-IV progression (used in countless pop hits) works because it cycles through tension and resolution.</p>
          </div>
        </details>
      </div>
    </div>
  );
}
