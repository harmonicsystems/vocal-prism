/**
 * DroneMixer Component
 * Hardware-inspired drone synthesizer using Web Audio API
 * Generates real-time tones at personalized just-intonation frequencies
 *
 * Features:
 * - Individual volume faders per voice
 * - Svara / Solfege / Note label modes
 * - Scale mode (just intonation) + Chromatic mode (all 12 semitones)
 * - Rich preset library
 * - Historical context overlays (Pythagorean, Vedic, Gregorian, etc.)
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAudioContext, isAudioReady, subscribeToAudioState, forceUnlock } from '../utils/mobileAudio';
import { AudioUnlockInline } from './AudioUnlockButton';

// Historical context definitions
const HISTORICAL_CONTEXTS = {
  none: {
    id: 'none',
    label: 'No Context',
    color: 'carbon',
    description: null,
    presets: null
  },
  pythagorean: {
    id: 'pythagorean',
    label: 'Pythagorean',
    color: 'blue',
    century: '6th c. BCE',
    description: 'Pythagoras discovered that simple ratios create consonance. The 3:2 fifth and 4:3 fourth are mathematically pure.',
    insight: 'Try: Sa + Pa (3:2). This is the foundation of Western harmony.',
    presets: [
      { id: 'pyth-fifth', label: '3:2 Fifth', voices: [1, 5], desc: 'The perfect fifth — Pythagoras\'s discovery' },
      { id: 'pyth-fourth', label: '4:3 Fourth', voices: [1, 4], desc: 'The perfect fourth' },
      { id: 'pyth-stack', label: 'Stacked 5ths', voices: [1, 5, 2], desc: 'Sa → Pa → Re (two fifths)' },
    ]
  },
  vedic: {
    id: 'vedic',
    label: 'Vedic / Indian',
    color: 'orange',
    century: 'c. 200 BCE',
    description: 'In Indian classical music, the tonic (Sa) is set to your own voice. The tanpura drone creates a harmonic foundation.',
    insight: 'The tanpura traditionally sounds Sa-Pa-Sa\'-Sa\' — root, fifth, octave.',
    presets: [
      { id: 'tanpura-full', label: 'Tanpura', voices: [1, 5, 8], desc: 'Sa-Pa-Sa\' — the classic drone' },
      { id: 'sa-ma', label: 'Sa-Ma', voices: [1, 4], desc: 'Establishes the Ma (fourth)' },
      { id: 'raga-drone', label: 'Raga Base', voices: [1, 5, 8, 4], desc: 'Extended drone with Ma' },
    ]
  },
  gregorian: {
    id: 'gregorian',
    label: 'Gregorian',
    color: 'purple',
    century: '9th c. CE',
    description: 'Medieval monks sang in parallel fourths and fifths (organum), creating the first Western polyphony.',
    insight: 'Parallel 4ths and 5ths were considered sacred. The tritone was forbidden.',
    presets: [
      { id: 'organum-4th', label: 'Organum 4th', voices: [1, 4], desc: 'Parallel fourth — early polyphony' },
      { id: 'organum-5th', label: 'Organum 5th', voices: [1, 5], desc: 'Parallel fifth — vox organalis' },
      { id: 'ison', label: 'Ison Drone', voices: [1], desc: 'The held drone note under chant' },
    ]
  },
  tibetan: {
    id: 'tibetan',
    label: 'Tibetan',
    color: 'pink',
    century: 'Ancient',
    description: 'Tibetan singing bowls produce multiple frequencies simultaneously, including beating overtones.',
    insight: 'Metal bowls often produce a tritone between fundamental and first overtone — "beating" creates the trance effect.',
    presets: [
      { id: 'bowl-fund', label: 'Fundamental', voices: [1], desc: 'Single bowl tone' },
      { id: 'bowl-oct', label: 'Bowl + Octave', voices: [1, 8], desc: 'Fundamental with octave harmonic' },
      { id: 'bowl-fifth', label: 'Bowl Blend', voices: [1, 5, 8], desc: 'Rich harmonic blend' },
    ]
  },
  neuroscience: {
    id: 'neuroscience',
    label: 'Brainwaves',
    color: 'cyan',
    century: 'Modern',
    description: 'Binaural beats occur when two slightly different frequencies create a perceived "beat" at their difference frequency.',
    insight: 'Sing 4-8 Hz away from your drone to enter theta (creative/meditative) state.',
    presets: [
      { id: 'pure-drone', label: 'Pure Drone', voices: [1], desc: 'Your fundamental — zero beat' },
      { id: 'theta-prep', label: 'Sa-Pa Theta', voices: [1, 5], desc: 'The fifth naturally creates beating' },
      { id: 'alpha-zone', label: 'Alpha Zone', voices: [1, 2], desc: 'Major 2nd creates ~8-12 Hz beating' },
    ]
  }
};

// Oscillator types
const WAVE_TYPES = [
  { type: 'sine', label: 'SIN', desc: 'Pure, smooth' },
  { type: 'triangle', label: 'TRI', desc: 'Soft, warm' },
  { type: 'sawtooth', label: 'SAW', desc: 'Rich, buzzy' },
];

// Label display modes
const LABEL_MODES = [
  { id: 'svara', label: 'Svara' },
  { id: 'solfege', label: 'Solfège' },
  { id: 'note', label: 'Note' },
];

// Chromatic intervals from unison
const CHROMATIC_INTERVALS = [
  { semitones: 0, name: 'Unison', short: 'P1', ratio: 1 },
  { semitones: 1, name: 'Minor 2nd', short: 'm2', ratio: Math.pow(2, 1/12) },
  { semitones: 2, name: 'Major 2nd', short: 'M2', ratio: Math.pow(2, 2/12) },
  { semitones: 3, name: 'Minor 3rd', short: 'm3', ratio: Math.pow(2, 3/12) },
  { semitones: 4, name: 'Major 3rd', short: 'M3', ratio: Math.pow(2, 4/12) },
  { semitones: 5, name: 'Perfect 4th', short: 'P4', ratio: Math.pow(2, 5/12) },
  { semitones: 6, name: 'Tritone', short: 'TT', ratio: Math.pow(2, 6/12) },
  { semitones: 7, name: 'Perfect 5th', short: 'P5', ratio: Math.pow(2, 7/12) },
  { semitones: 8, name: 'Minor 6th', short: 'm6', ratio: Math.pow(2, 8/12) },
  { semitones: 9, name: 'Major 6th', short: 'M6', ratio: Math.pow(2, 9/12) },
  { semitones: 10, name: 'Minor 7th', short: 'm7', ratio: Math.pow(2, 10/12) },
  { semitones: 11, name: 'Major 7th', short: 'M7', ratio: Math.pow(2, 11/12) },
  { semitones: 12, name: 'Octave', short: 'P8', ratio: 2 },
];

// EXPANDED Scale presets with multiple categories
const SCALE_PRESETS = {
  basic: [
    { id: 'sa', label: 'Sa', voices: [1], desc: 'Fundamental only' },
    { id: 'sa-pa', label: 'Sa-Pa', voices: [1, 5], desc: 'Perfect fifth drone' },
    { id: 'sa-ma', label: 'Sa-Ma', voices: [1, 4], desc: 'Perfect fourth' },
    { id: 'tanpura', label: 'Tanpura', voices: [1, 5, 8], desc: 'Sa + Pa + Sa\'' },
  ],
  triads: [
    { id: 'major', label: 'Major', voices: [1, 3, 5], desc: 'Sa-Ga-Pa (Major triad)' },
    { id: 'sus4', label: 'Sus4', voices: [1, 4, 5], desc: 'Sa-Ma-Pa (suspended)' },
    { id: 'sus2', label: 'Sus2', voices: [1, 2, 5], desc: 'Sa-Re-Pa (suspended)' },
    { id: 'power', label: 'Power', voices: [1, 5, 8], desc: 'Sa-Pa-Sa\' (no third)' },
  ],
  pentatonic: [
    { id: 'penta-major', label: 'Penta', voices: [1, 2, 3, 5, 6], desc: 'Major pentatonic' },
    { id: 'penta-sa', label: 'Sa-centric', voices: [1, 2, 5, 6, 8], desc: 'Drone-focused' },
  ],
  ragas: [
    { id: 'bhairav', label: 'Bhairav', voices: [1, 2, 3, 4, 5, 6, 7], desc: 'Morning raga feel' },
    { id: 'yaman', label: 'Yaman', voices: [1, 2, 3, 4, 5, 6, 7, 8], desc: 'Full scale' },
  ],
  full: [
    { id: 'all', label: 'Full', voices: [1, 2, 3, 4, 5, 6, 7, 8], desc: 'All notes' },
  ],
};

const CHROMATIC_PRESETS = [
  { id: 'unison', label: 'P1', voices: [0], desc: 'Unison' },
  { id: 'fifth', label: 'P5', voices: [0, 7], desc: 'Power chord' },
  { id: 'fourth', label: 'P4', voices: [0, 5], desc: 'Perfect 4th' },
  { id: 'major', label: 'Maj', voices: [0, 4, 7], desc: 'Major triad' },
  { id: 'minor', label: 'Min', voices: [0, 3, 7], desc: 'Minor triad' },
  { id: 'dim', label: 'Dim', voices: [0, 3, 6], desc: 'Diminished' },
  { id: 'aug', label: 'Aug', voices: [0, 4, 8], desc: 'Augmented' },
  { id: 'maj7', label: 'Maj7', voices: [0, 4, 7, 11], desc: 'Major 7th' },
  { id: 'min7', label: 'Min7', voices: [0, 3, 7, 10], desc: 'Minor 7th' },
  { id: 'dom7', label: 'Dom7', voices: [0, 4, 7, 10], desc: 'Dominant 7th' },
  { id: 'tritone', label: 'TT', voices: [0, 6], desc: 'Tritone (diabolus)' },
];

// Fader component - mobile-optimized with horizontal layout on small screens
function Fader({ value, onChange, isActive, onToggle, label, subLabel, hz, cents, compact = false }) {
  return (
    <div className={`flex flex-col items-center gap-0.5 sm:gap-1 ${compact ? 'min-w-[32px]' : ''}`}>
      {/* Hz display - hidden on mobile in compact mode */}
      <div className={`text-[8px] sm:text-[9px] text-carbon-500 font-mono h-3 sm:h-4 flex items-center ${compact ? 'hidden sm:flex' : ''}`}>
        {hz?.toFixed(0)}
      </div>

      {/* Cents indicator - hidden on very small screens */}
      {cents !== undefined && cents !== null && (
        <div className={`text-[7px] sm:text-[8px] font-mono h-2.5 sm:h-3 hidden sm:block ${Math.abs(cents) < 5 ? 'text-carbon-500' : 'text-signal-amber'}`}>
          {cents >= 0 ? '+' : ''}{cents}¢
        </div>
      )}

      {/* Fader track - shorter on mobile */}
      <div className="relative h-12 sm:h-20 w-5 sm:w-6 flex flex-col items-center">
        <div className="absolute inset-x-0 mx-auto w-0.5 sm:w-1 h-full bg-carbon-700 rounded-full" />
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute h-full w-5 sm:w-6 appearance-none bg-transparent cursor-pointer touch-none
                     [writing-mode:vertical-lr] [direction:rtl]
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-5
                     [&::-webkit-slider-thumb]:sm:w-6
                     [&::-webkit-slider-thumb]:h-2.5
                     [&::-webkit-slider-thumb]:sm:h-3
                     [&::-webkit-slider-thumb]:rounded
                     [&::-webkit-slider-thumb]:bg-carbon-300
                     [&::-webkit-slider-thumb]:border
                     [&::-webkit-slider-thumb]:border-carbon-500
                     [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-webkit-slider-thumb]:shadow-md"
          style={{ WebkitAppearance: 'slider-vertical' }}
        />
        {/* Level indicator */}
        <div
          className={`absolute bottom-0 w-0.5 sm:w-1 rounded-full transition-all duration-100 ${
            isActive ? 'bg-signal-orange' : 'bg-carbon-600'
          }`}
          style={{ height: `${value * 100}%` }}
        />
      </div>

      {/* Toggle button - touch-friendly size */}
      <button
        onClick={onToggle}
        className={`
          w-7 h-7 sm:w-8 sm:h-8 rounded text-[9px] sm:text-[10px] font-bold transition-all border
          ${isActive
            ? 'bg-carbon-700 border-signal-orange text-signal-orange'
            : 'bg-carbon-800 border-carbon-600 text-carbon-500 hover:border-carbon-400 active:border-carbon-300'}
        `}
      >
        {label}
      </button>

      {/* Sub label - hidden on mobile */}
      {subLabel && (
        <div className="hidden sm:block text-[8px] text-carbon-500 h-3 truncate max-w-[40px] text-center">{subLabel}</div>
      )}
    </div>
  );
}

export default function DroneMixer({ scale = [], f0 = 165, initialContext = 'none' }) {
  const audioContextRef = useRef(null);
  const oscillatorsRef = useRef({});
  const gainNodesRef = useRef({});
  const masterGainRef = useRef(null);

  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioState, setAudioState] = useState('idle'); // idle, starting, running, error
  const [masterVolume, setMasterVolume] = useState(0.5);
  const [mode, setMode] = useState('scale'); // 'scale' or 'chromatic'
  const [labelMode, setLabelMode] = useState('svara');
  const [waveType, setWaveType] = useState('sine');
  const [presetCategory, setPresetCategory] = useState('basic');
  const [historicalContext, setHistoricalContext] = useState(initialContext);

  // Get current context data
  const contextData = HISTORICAL_CONTEXTS[historicalContext] || HISTORICAL_CONTEXTS.none;

  // Scale mode state
  const [scaleActiveVoices, setScaleActiveVoices] = useState(new Set([1]));
  const [scaleVolumes, setScaleVolumes] = useState(() => {
    const vols = {};
    for (let i = 1; i <= 8; i++) vols[i] = 0.8;
    return vols;
  });

  // Chromatic mode state
  const [chromActiveVoices, setChromActiveVoices] = useState(new Set([0]));
  const [chromVolumes, setChromVolumes] = useState(() => {
    const vols = {};
    for (let i = 0; i <= 12; i++) vols[i] = 0.8;
    return vols;
  });

  // Current active set based on mode
  const activeVoices = mode === 'scale' ? scaleActiveVoices : chromActiveVoices;
  const setActiveVoices = mode === 'scale' ? setScaleActiveVoices : setChromActiveVoices;
  const volumes = mode === 'scale' ? scaleVolumes : chromVolumes;
  const setVolumes = mode === 'scale' ? setScaleVolumes : setChromVolumes;

  // Get frequency for a voice
  const getFrequency = useCallback((voiceId) => {
    if (mode === 'scale') {
      const note = scale.find(n => n.degree === voiceId);
      return note?.hz || f0;
    } else {
      const interval = CHROMATIC_INTERVALS[voiceId];
      return f0 * (interval?.ratio || 1);
    }
  }, [mode, scale, f0]);

  // Get cents for a voice
  const getCents = useCallback((voiceId) => {
    if (mode === 'scale') {
      const note = scale.find(n => n.degree === voiceId);
      return note?.cents;
    }
    return null; // Chromatic is equal temperament, so 0 by definition
  }, [mode, scale]);

  // Get label for a voice
  const getLabel = useCallback((voiceId) => {
    if (mode === 'scale') {
      const note = scale.find(n => n.degree === voiceId);
      if (!note) return voiceId;
      if (labelMode === 'svara') return note.svara;
      if (labelMode === 'solfege') return note.solfege;
      return note.nearestPitch?.replace(/\d+/, '') || note.svara;
    } else {
      return CHROMATIC_INTERVALS[voiceId]?.short || voiceId;
    }
  }, [mode, scale, labelMode]);

  // Subscribe to audio state changes
  useEffect(() => {
    const unsubscribe = subscribeToAudioState((state) => {
      setAudioState(state === 'running' ? 'running' : (state === 'suspended' ? 'waiting' : audioState));
    });
    return unsubscribe;
  }, [audioState]);

  // Initialize audio context - SYNCHRONOUS for mobile compatibility
  const initAudio = useCallback(() => {
    try {
      // Try to unlock synchronously (critical for mobile!)
      forceUnlock();

      // Get the context (now synchronous)
      const ctx = getAudioContext();

      if (!ctx) {
        setAudioState('error');
        return null;
      }

      // If context is suspended, it needs user interaction
      if (ctx.state === 'suspended') {
        setAudioState('waiting');
        return null;
      }

      // Store reference and set up master gain if needed
      if (!audioContextRef.current || audioContextRef.current !== ctx) {
        audioContextRef.current = ctx;
        masterGainRef.current = ctx.createGain();
        masterGainRef.current.gain.value = masterVolume;
        masterGainRef.current.connect(ctx.destination);
      }

      setAudioState('running');
      return ctx;
    } catch (err) {
      console.error('Audio init error:', err);
      setAudioState('error');
      return null;
    }
  }, [masterVolume]);

  // Create oscillator
  const createOscillator = useCallback((voiceId, freq, volume) => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    // Stop existing
    if (oscillatorsRef.current[voiceId]) {
      try {
        oscillatorsRef.current[voiceId].stop();
        oscillatorsRef.current[voiceId].disconnect();
      } catch (e) {}
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = waveType;
    osc.frequency.value = freq;

    // Smooth attack
    gain.gain.value = 0;
    gain.gain.linearRampToValueAtTime(volume * 0.25, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(masterGainRef.current);
    osc.start();

    oscillatorsRef.current[voiceId] = osc;
    gainNodesRef.current[voiceId] = gain;
  }, [waveType]);

  // Stop oscillator
  const stopOscillator = useCallback((voiceId) => {
    const ctx = audioContextRef.current;
    const gain = gainNodesRef.current[voiceId];
    const osc = oscillatorsRef.current[voiceId];

    if (gain && ctx) {
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.08);
      setTimeout(() => {
        try {
          if (osc) { osc.stop(); osc.disconnect(); }
        } catch (e) {}
        delete oscillatorsRef.current[voiceId];
        delete gainNodesRef.current[voiceId];
      }, 100);
    }
  }, []);

  // Stop all oscillators
  const stopAll = useCallback(() => {
    Object.keys(oscillatorsRef.current).forEach(id => stopOscillator(id));
  }, [stopOscillator]);

  // Toggle play
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      stopAll();
      setIsPlaying(false);
      setAudioState('idle');
    } else {
      const ctx = initAudio();
      if (!ctx) {
        console.error('Failed to initialize audio - tap "Enable Audio" first');
        return;
      }
      activeVoices.forEach(voiceId => {
        const freq = getFrequency(voiceId);
        createOscillator(voiceId, freq, volumes[voiceId]);
      });
      setIsPlaying(true);
    }
  }, [isPlaying, activeVoices, volumes, initAudio, getFrequency, createOscillator, stopAll]);

  // Toggle voice
  const toggleVoice = useCallback((voiceId) => {
    const isCurrentlyActive = activeVoices.has(voiceId);

    if (isCurrentlyActive) {
      setActiveVoices(prev => {
        const next = new Set(prev);
        next.delete(voiceId);
        return next;
      });
      if (isPlaying) stopOscillator(voiceId);
    } else {
      setActiveVoices(prev => {
        const next = new Set(prev);
        next.add(voiceId);
        return next;
      });
      if (isPlaying) {
        initAudio();
        createOscillator(voiceId, getFrequency(voiceId), volumes[voiceId]);
      }
    }
  }, [isPlaying, activeVoices, volumes, initAudio, getFrequency, createOscillator, stopOscillator, setActiveVoices]);

  // Update voice volume
  const updateVoiceVolume = useCallback((voiceId, value) => {
    setVolumes(prev => ({ ...prev, [voiceId]: value }));

    const gain = gainNodesRef.current[voiceId];
    const ctx = audioContextRef.current;
    if (gain && ctx && activeVoices.has(voiceId)) {
      gain.gain.linearRampToValueAtTime(value * 0.25, ctx.currentTime + 0.05);
    }
  }, [activeVoices, setVolumes]);

  // Apply preset
  const applyPreset = useCallback((preset) => {
    if (isPlaying) stopAll();

    const newVoices = new Set(preset.voices);
    setActiveVoices(newVoices);

    if (isPlaying) {
      setTimeout(() => {
        initAudio();
        preset.voices.forEach(voiceId => {
          createOscillator(voiceId, getFrequency(voiceId), volumes[voiceId]);
        });
      }, 120);
    }
  }, [isPlaying, volumes, initAudio, getFrequency, createOscillator, stopAll, setActiveVoices]);

  // Switch mode
  const switchMode = useCallback((newMode) => {
    if (isPlaying) stopAll();
    setMode(newMode);
    if (isPlaying) {
      setTimeout(() => {
        initAudio();
        const voices = newMode === 'scale' ? scaleActiveVoices : chromActiveVoices;
        const vols = newMode === 'scale' ? scaleVolumes : chromVolumes;
        voices.forEach(voiceId => {
          const freq = newMode === 'scale'
            ? (scale.find(n => n.degree === voiceId)?.hz || f0)
            : (f0 * CHROMATIC_INTERVALS[voiceId]?.ratio);
          createOscillator(voiceId, freq, vols[voiceId]);
        });
      }, 120);
    }
  }, [isPlaying, scaleActiveVoices, chromActiveVoices, scaleVolumes, chromVolumes, scale, f0, initAudio, createOscillator, stopAll]);

  // Update master volume
  useEffect(() => {
    if (masterGainRef.current && audioContextRef.current) {
      masterGainRef.current.gain.linearRampToValueAtTime(
        masterVolume,
        audioContextRef.current.currentTime + 0.05
      );
    }
  }, [masterVolume]);

  // Update wave type
  useEffect(() => {
    Object.values(oscillatorsRef.current).forEach(osc => {
      if (osc) osc.type = waveType;
    });
  }, [waveType]);

  // Cleanup oscillators (don't close shared audio context)
  useEffect(() => {
    return () => {
      Object.values(oscillatorsRef.current).forEach(osc => {
        try { osc.stop(); osc.disconnect(); } catch (e) {}
      });
    };
  }, []);

  const voices = mode === 'scale'
    ? scale.map(n => n.degree)
    : CHROMATIC_INTERVALS.map((_, i) => i);

  // Context color classes
  const getContextColorClass = (ctx, type = 'bg') => {
    const colors = {
      pythagorean: { bg: 'bg-blue-900/30', border: 'border-blue-500', text: 'text-blue-400' },
      vedic: { bg: 'bg-orange-900/30', border: 'border-orange-500', text: 'text-orange-400' },
      gregorian: { bg: 'bg-purple-900/30', border: 'border-purple-500', text: 'text-purple-400' },
      tibetan: { bg: 'bg-pink-900/30', border: 'border-pink-500', text: 'text-pink-400' },
      neuroscience: { bg: 'bg-cyan-900/30', border: 'border-cyan-500', text: 'text-cyan-400' },
      none: { bg: 'bg-carbon-800', border: 'border-carbon-600', text: 'text-carbon-400' }
    };
    return colors[ctx]?.[type] || colors.none[type];
  };

  return (
    <div className="bg-carbon-900 rounded-lg p-3 sm:p-4 text-white font-mono">
      {/* Historical Context Selector */}
      <div className="mb-3 sm:mb-4">
        <div className="text-[9px] sm:text-[10px] text-carbon-500 uppercase tracking-wider mb-1.5 sm:mb-2">Historical Context</div>
        <div className="flex flex-wrap gap-1">
          {Object.entries(HISTORICAL_CONTEXTS).map(([key, ctx]) => (
            <button
              key={key}
              onClick={() => setHistoricalContext(key)}
              className={`
                px-2 sm:px-2.5 py-1 text-[9px] sm:text-[10px] rounded border transition-all
                ${historicalContext === key
                  ? `${getContextColorClass(key, 'bg')} ${getContextColorClass(key, 'border')} ${getContextColorClass(key, 'text')}`
                  : 'bg-carbon-800 border-carbon-700 text-carbon-400 hover:border-carbon-500 active:border-carbon-400'}
              `}
            >
              {ctx.label}
              <span className="hidden sm:inline">{ctx.century && <span className="ml-1 opacity-60">({ctx.century})</span>}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Context Description */}
      <AnimatePresence mode="wait">
        {contextData.description && (
          <motion.div
            key={historicalContext}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`mb-4 p-3 rounded border ${getContextColorClass(historicalContext, 'bg')} ${getContextColorClass(historicalContext, 'border')}`}
          >
            <p className="text-xs text-carbon-300 leading-relaxed mb-2">{contextData.description}</p>
            <p className={`text-[10px] ${getContextColorClass(historicalContext, 'text')} italic`}>{contextData.insight}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header row */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Mode toggle */}
          <div className="flex rounded overflow-hidden border border-carbon-600">
            <button
              onClick={() => switchMode('scale')}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs transition-all ${
                mode === 'scale'
                  ? 'bg-signal-orange text-carbon-900'
                  : 'bg-carbon-800 text-carbon-400 hover:text-carbon-200 active:text-carbon-100'
              }`}
            >
              Scale
            </button>
            <button
              onClick={() => switchMode('chromatic')}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs transition-all ${
                mode === 'chromatic'
                  ? 'bg-signal-coral text-carbon-900'
                  : 'bg-carbon-800 text-carbon-400 hover:text-carbon-200 active:text-carbon-100'
              }`}
            >
              Chromatic
            </button>
          </div>

          {/* Label mode (scale only) - hidden on mobile */}
          {mode === 'scale' && (
            <div className="hidden sm:flex gap-1">
              {LABEL_MODES.map(lm => (
                <button
                  key={lm.id}
                  onClick={() => setLabelMode(lm.id)}
                  className={`px-2 py-1 text-[10px] rounded transition-all ${
                    labelMode === lm.id
                      ? 'bg-carbon-700 text-carbon-200'
                      : 'text-carbon-500 hover:text-carbon-300'
                  }`}
                >
                  {lm.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* f0 display + power */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="text-[10px] sm:text-xs text-carbon-500">
            f0: <span className="text-signal-orange">{f0} Hz</span>
          </div>
          <button
            onClick={togglePlay}
            className={`
              w-12 sm:w-14 h-7 sm:h-8 rounded flex items-center justify-center gap-1
              transition-all duration-200 border font-bold text-[10px] sm:text-xs
              ${isPlaying
                ? 'bg-signal-orange border-signal-orange text-carbon-900'
                : 'bg-carbon-800 border-carbon-600 text-carbon-400 hover:border-carbon-400 active:border-carbon-300'}
            `}
          >
            {isPlaying ? '■' : '▶'}
            <span className="hidden sm:inline">{isPlaying ? 'STOP' : 'PLAY'}</span>
          </button>
        </div>
      </div>

      {/* Mobile audio unlock prompt */}
      <AudioUnlockInline onUnlock={() => setAudioState('idle')} />

      {/* Audio state indicator */}
      {audioState === 'waiting' && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-signal-amber/10 border border-signal-amber/30 text-signal-amber text-xs flex items-center gap-2">
          <span>🔊</span>
          <span>Tap "Enable Audio" above to play frequencies</span>
        </div>
      )}
      {audioState === 'error' && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-red-900/30 border border-red-500/30 text-red-400 text-xs">
          Audio initialization failed. Try refreshing the page.
        </div>
      )}

      {/* Presets */}
      <div className="mb-4">
        {/* Context-specific presets (when context is selected and in scale mode) */}
        {contextData.presets && mode === 'scale' && (
          <div className="mb-3">
            <div className={`text-[9px] uppercase tracking-wider mb-1.5 ${getContextColorClass(historicalContext, 'text')}`}>
              {contextData.label} Presets
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {contextData.presets.map(preset => {
                const isActive = preset.voices.length === activeVoices.size &&
                  preset.voices.every(v => activeVoices.has(v));
                return (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset)}
                    className={`
                      px-2.5 py-1 text-[10px] rounded border transition-all
                      ${isActive
                        ? `${getContextColorClass(historicalContext, 'bg')} ${getContextColorClass(historicalContext, 'border')} ${getContextColorClass(historicalContext, 'text')}`
                        : 'bg-carbon-800 border-carbon-700 text-carbon-400 hover:border-carbon-500'}
                    `}
                    title={preset.desc}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Standard presets */}
        <div className="text-[9px] text-carbon-500 uppercase tracking-wider mb-1.5">
          {contextData.presets && mode === 'scale' ? 'All Presets' : 'Presets'}
        </div>
        {mode === 'scale' ? (
          <>
            {/* Category tabs */}
            <div className="flex gap-1 mb-2">
              {Object.keys(SCALE_PRESETS).map(cat => (
                <button
                  key={cat}
                  onClick={() => setPresetCategory(cat)}
                  className={`px-2 py-0.5 text-[9px] uppercase tracking-wider rounded transition-all ${
                    presetCategory === cat
                      ? 'bg-carbon-700 text-carbon-200'
                      : 'text-carbon-500 hover:text-carbon-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            {/* Presets for selected category */}
            <div className="flex gap-1.5 flex-wrap">
              {SCALE_PRESETS[presetCategory].map(preset => {
                const isActive = preset.voices.length === activeVoices.size &&
                  preset.voices.every(v => activeVoices.has(v));
                return (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset)}
                    className={`
                      px-2.5 py-1 text-[10px] rounded border transition-all
                      ${isActive
                        ? 'bg-carbon-700 border-signal-orange text-signal-orange'
                        : 'bg-carbon-800 border-carbon-700 text-carbon-400 hover:border-carbon-500'}
                    `}
                    title={preset.desc}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="flex gap-1.5 flex-wrap">
            {CHROMATIC_PRESETS.map(preset => {
              const isActive = preset.voices.length === activeVoices.size &&
                preset.voices.every(v => activeVoices.has(v));
              return (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  className={`
                    px-2.5 py-1 text-[10px] rounded border transition-all
                    ${isActive
                      ? 'bg-carbon-700 border-signal-orange text-signal-orange'
                      : 'bg-carbon-800 border-carbon-700 text-carbon-400 hover:border-carbon-500'}
                  `}
                  title={preset.desc}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Mixer faders */}
      <div className="bg-carbon-800 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4">
        <div className={`flex justify-between gap-0 sm:gap-0.5 ${mode === 'chromatic' ? 'overflow-x-auto pb-2 -mx-1 px-1' : ''}`}>
          {voices.map(voiceId => {
            const freq = getFrequency(voiceId);
            const label = getLabel(voiceId);
            const cents = getCents(voiceId);
            const subLabel = mode === 'chromatic' ? CHROMATIC_INTERVALS[voiceId]?.name : null;

            return (
              <Fader
                key={voiceId}
                value={volumes[voiceId]}
                onChange={(v) => updateVoiceVolume(voiceId, v)}
                isActive={activeVoices.has(voiceId)}
                onToggle={() => toggleVoice(voiceId)}
                label={label}
                subLabel={mode === 'scale' ? null : subLabel}
                hz={freq}
                cents={cents}
                compact={mode === 'chromatic'}
              />
            );
          })}
        </div>
      </div>

      {/* Wave type + Master */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 sm:gap-4">
        {/* Waveform */}
        <div className="flex-1">
          <div className="text-[9px] sm:text-[10px] text-carbon-500 mb-1 sm:mb-1.5 uppercase tracking-wider">Wave</div>
          <div className="flex gap-1 sm:gap-1.5">
            {WAVE_TYPES.map(wave => (
              <button
                key={wave.type}
                onClick={() => setWaveType(wave.type)}
                className={`
                  px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs rounded border transition-all flex-1
                  ${waveType === wave.type
                    ? 'bg-carbon-700 border-signal-coral text-signal-coral'
                    : 'bg-carbon-800 border-carbon-700 text-carbon-400 hover:border-carbon-500 active:border-carbon-400'}
                `}
                title={wave.desc}
              >
                {wave.label}
              </button>
            ))}
          </div>
        </div>

        {/* Master volume */}
        <div className="w-full sm:w-32">
          <div className="flex items-center justify-between mb-1 sm:mb-1.5">
            <span className="text-[9px] sm:text-[10px] text-carbon-500 uppercase tracking-wider">Master</span>
            <span className="text-[9px] sm:text-[10px] text-carbon-400">{Math.round(masterVolume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={masterVolume}
            onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
            className="w-full h-2 bg-carbon-700 rounded-full appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none
                       [&::-webkit-slider-thumb]:w-5
                       [&::-webkit-slider-thumb]:h-5
                       [&::-webkit-slider-thumb]:sm:w-4
                       [&::-webkit-slider-thumb]:sm:h-4
                       [&::-webkit-slider-thumb]:rounded-full
                       [&::-webkit-slider-thumb]:bg-signal-orange
                       [&::-webkit-slider-thumb]:cursor-pointer
                       [&::-webkit-slider-thumb]:border-2
                       [&::-webkit-slider-thumb]:border-carbon-900"
          />
        </div>
      </div>

      {/* Now playing */}
      <AnimatePresence>
        {isPlaying && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-carbon-700"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-signal-orange animate-pulse flex-shrink-0" />
              <span className="text-[9px] sm:text-[10px] text-carbon-400 truncate">
                {Array.from(activeVoices).sort((a, b) => a - b).map(id =>
                  `${getLabel(id)}`
                ).join(' + ')}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mode description */}
      <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-carbon-700">
        <p className="text-[9px] sm:text-[10px] text-carbon-500 leading-relaxed">
          {mode === 'scale'
            ? `Scale: Just intonation from Sa (${f0} Hz). Pure ratios.`
            : `Chromatic: 12 equal-tempered semitones from ${f0} Hz.`
          }
        </p>
        {historicalContext !== 'none' && (
          <p className={`text-[8px] sm:text-[9px] mt-1 ${getContextColorClass(historicalContext, 'text')}`}>
            Context: {contextData.label}
          </p>
        )}
      </div>
    </div>
  );
}

// Export historical contexts for external use
export { HISTORICAL_CONTEXTS };
