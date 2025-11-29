/**
 * BinauralBeatMixer Component
 * Creates binaural beats for brainwave entrainment
 *
 * How it works:
 * - Plays slightly different frequencies in left and right ears
 * - Brain perceives a "beat" at the difference frequency
 * - This beat can entrain brainwaves to specific states
 *
 * Example: Left 165 Hz, Right 171 Hz → 6 Hz beat (Theta)
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAudioContext, subscribeToAudioState, unlockAudioSync } from '../utils/mobileAudio';
import { AudioUnlockInline } from './AudioUnlockButton';

// Brainwave states with frequencies and descriptions
const BRAINWAVE_STATES = {
  delta: {
    id: 'delta',
    name: 'Delta (δ)',
    range: [0.5, 4],
    defaultBeat: 2,
    color: 'blue',
    description: 'Deep sleep, healing, restoration',
    icon: '🌙',
    warning: 'May cause drowsiness. Do not use while driving.'
  },
  theta: {
    id: 'theta',
    name: 'Theta (θ)',
    range: [4, 8],
    defaultBeat: 6,
    color: 'purple',
    description: 'Deep meditation, creativity, intuition, REM sleep',
    icon: '🧘',
    warning: null
  },
  alpha: {
    id: 'alpha',
    name: 'Alpha (α)',
    range: [8, 12],
    defaultBeat: 10,
    color: 'green',
    description: 'Relaxed focus, calm alertness, light meditation',
    icon: '🍃',
    warning: null
  },
  beta: {
    id: 'beta',
    name: 'Beta (β)',
    range: [12, 30],
    defaultBeat: 18,
    color: 'amber',
    description: 'Active thinking, focus, concentration, problem-solving',
    icon: '⚡',
    warning: null
  },
  gamma: {
    id: 'gamma',
    name: 'Gamma (γ)',
    range: [30, 50],
    defaultBeat: 40,
    color: 'red',
    description: 'Peak awareness, insight, heightened perception',
    icon: '✨',
    warning: 'High frequencies may be intense for some listeners.'
  }
};

// Mode options for how to create the beat
const BEAT_MODES = [
  { id: 'centered', label: 'Centered', desc: 'f0 ± beat/2' },
  { id: 'above', label: 'Above f0', desc: 'f0 and f0 + beat' },
  { id: 'below', label: 'Below f0', desc: 'f0 - beat and f0' },
];

export default function BinauralBeatMixer({ f0 = 165, brainwaveMap = {} }) {
  const audioContextRef = useRef(null);
  const leftOscRef = useRef(null);
  const rightOscRef = useRef(null);
  const leftGainRef = useRef(null);
  const rightGainRef = useRef(null);
  const leftPanRef = useRef(null);
  const rightPanRef = useRef(null);
  const masterGainRef = useRef(null);

  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioState, setAudioState] = useState('idle');
  const [selectedState, setSelectedState] = useState('theta');
  const [beatFrequency, setBeatFrequency] = useState(6);
  const [beatMode, setBeatMode] = useState('centered');
  const [volume, setVolume] = useState(0.5);
  const [waveType, setWaveType] = useState('sine');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Subscribe to audio state changes
  useEffect(() => {
    const unsubscribe = subscribeToAudioState((state) => {
      if (state === 'running' && audioState === 'waiting') {
        setAudioState('idle');
      }
    });
    return unsubscribe;
  }, [audioState]);

  // Calculate left and right frequencies based on mode
  const getFrequencies = useCallback(() => {
    switch (beatMode) {
      case 'centered':
        return {
          left: f0 - beatFrequency / 2,
          right: f0 + beatFrequency / 2
        };
      case 'above':
        return {
          left: f0,
          right: f0 + beatFrequency
        };
      case 'below':
        return {
          left: f0 - beatFrequency,
          right: f0
        };
      default:
        return { left: f0, right: f0 + beatFrequency };
    }
  }, [f0, beatFrequency, beatMode]);

  const frequencies = getFrequencies();
  const currentBrainwave = BRAINWAVE_STATES[selectedState];

  // Initialize audio context with mobile-friendly unlocking
  const initAudio = useCallback(async () => {
    const ctx = await getAudioContext();

    if (!ctx) {
      setAudioState('error');
      return null;
    }

    // If context is suspended, needs user interaction
    if (ctx.state === 'suspended') {
      setAudioState('waiting');
      return null;
    }

    if (!audioContextRef.current || audioContextRef.current !== ctx) {
      audioContextRef.current = ctx;

      // Master gain
      masterGainRef.current = ctx.createGain();
      masterGainRef.current.gain.value = volume * 0.3;
      masterGainRef.current.connect(ctx.destination);

      // Left channel
      leftPanRef.current = ctx.createStereoPanner();
      leftPanRef.current.pan.value = -1;
      leftGainRef.current = ctx.createGain();
      leftGainRef.current.connect(leftPanRef.current);
      leftPanRef.current.connect(masterGainRef.current);

      // Right channel
      rightPanRef.current = ctx.createStereoPanner();
      rightPanRef.current.pan.value = 1;
      rightGainRef.current = ctx.createGain();
      rightGainRef.current.connect(rightPanRef.current);
      rightPanRef.current.connect(masterGainRef.current);
    }

    setAudioState('running');
    return ctx;
  }, [volume]);

  // Start binaural beat - CRITICAL: Must call unlockAudioSync FIRST for Safari
  const startBeat = useCallback(() => {
    // CRITICAL: Sync unlock first for Safari
    unlockAudioSync();

    (async () => {
      const ctx = await initAudio();
      if (!ctx) return;

      const { left, right } = getFrequencies();

      // Create left oscillator
      leftOscRef.current = ctx.createOscillator();
      leftOscRef.current.type = waveType;
      leftOscRef.current.frequency.value = left;
      leftGainRef.current.gain.value = 1;
      leftOscRef.current.connect(leftGainRef.current);
      leftOscRef.current.start();

      // Create right oscillator
      rightOscRef.current = ctx.createOscillator();
      rightOscRef.current.type = waveType;
      rightOscRef.current.frequency.value = right;
      rightGainRef.current.gain.value = 1;
      rightOscRef.current.connect(rightGainRef.current);
      rightOscRef.current.start();

      setIsPlaying(true);
    })();
  }, [initAudio, getFrequencies, waveType]);

  // Stop binaural beat
  const stopBeat = useCallback(() => {
    if (leftOscRef.current) {
      leftOscRef.current.stop();
      leftOscRef.current.disconnect();
      leftOscRef.current = null;
    }
    if (rightOscRef.current) {
      rightOscRef.current.stop();
      rightOscRef.current.disconnect();
      rightOscRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  // Toggle play
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      stopBeat();
    } else {
      startBeat();
    }
  }, [isPlaying, startBeat, stopBeat]);

  // Update frequencies in real-time
  useEffect(() => {
    if (isPlaying && leftOscRef.current && rightOscRef.current) {
      const { left, right } = getFrequencies();
      const ctx = audioContextRef.current;
      if (ctx) {
        leftOscRef.current.frequency.linearRampToValueAtTime(left, ctx.currentTime + 0.1);
        rightOscRef.current.frequency.linearRampToValueAtTime(right, ctx.currentTime + 0.1);
      }
    }
  }, [beatFrequency, beatMode, f0, isPlaying, getFrequencies]);

  // Update wave type
  useEffect(() => {
    if (leftOscRef.current) leftOscRef.current.type = waveType;
    if (rightOscRef.current) rightOscRef.current.type = waveType;
  }, [waveType]);

  // Update volume
  useEffect(() => {
    if (masterGainRef.current && audioContextRef.current) {
      masterGainRef.current.gain.linearRampToValueAtTime(
        volume * 0.3,
        audioContextRef.current.currentTime + 0.1
      );
    }
  }, [volume]);

  // Select brainwave state
  const selectState = useCallback((stateId) => {
    setSelectedState(stateId);
    setBeatFrequency(BRAINWAVE_STATES[stateId].defaultBeat);
  }, []);

  // Cleanup oscillators (don't close shared audio context)
  useEffect(() => {
    return () => {
      if (leftOscRef.current) {
        try { leftOscRef.current.stop(); } catch (e) {}
      }
      if (rightOscRef.current) {
        try { rightOscRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  // Color classes for current state
  const getColorClass = (type) => {
    const colors = {
      delta: { bg: 'bg-blue-900/30', border: 'border-blue-500', text: 'text-blue-400' },
      theta: { bg: 'bg-purple-900/30', border: 'border-purple-500', text: 'text-purple-400' },
      alpha: { bg: 'bg-green-900/30', border: 'border-green-500', text: 'text-green-400' },
      beta: { bg: 'bg-amber-900/30', border: 'border-amber-500', text: 'text-amber-400' },
      gamma: { bg: 'bg-red-900/30', border: 'border-red-500', text: 'text-red-400' },
    };
    return colors[selectedState]?.[type] || '';
  };

  return (
    <div className="bg-carbon-900 rounded-lg p-4 text-white font-mono">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-carbon-200 font-semibold flex items-center gap-2">
            <span>🎧</span>
            Binaural Beat Generator
          </h3>
          <p className="text-[10px] text-carbon-500 mt-0.5">
            Headphones required for effect
          </p>
        </div>
        <button
          onClick={togglePlay}
          className={`
            px-4 py-2 rounded flex items-center gap-2
            transition-all duration-200 border font-bold text-sm
            ${isPlaying
              ? `${getColorClass('bg')} ${getColorClass('border')} ${getColorClass('text')}`
              : 'bg-carbon-800 border-carbon-600 text-carbon-400 hover:border-carbon-400'}
          `}
        >
          {isPlaying ? '■ STOP' : '▶ PLAY'}
        </button>
      </div>

      {/* Mobile audio unlock prompt */}
      <AudioUnlockInline onUnlock={() => setAudioState('idle')} />

      {/* Audio state indicator */}
      {audioState === 'waiting' && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-signal-amber/10 border border-signal-amber/30 text-signal-amber text-xs flex items-center gap-2">
          <span>🔊</span>
          <span>Tap "Enable Audio" above to use binaural beats</span>
        </div>
      )}

      {/* Brainwave state selector */}
      <div className="mb-4">
        <div className="text-[10px] text-carbon-500 uppercase tracking-wider mb-2">
          Target Brainwave State
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
          {Object.values(BRAINWAVE_STATES).map(state => (
            <button
              key={state.id}
              onClick={() => selectState(state.id)}
              className={`
                px-2 sm:px-3 py-2 text-xs rounded border transition-all
                ${selectedState === state.id
                  ? `${getColorClass('bg')} ${getColorClass('border')} ${getColorClass('text')}`
                  : 'bg-carbon-800 border-carbon-700 text-carbon-400 hover:border-carbon-500'}
              `}
            >
              <div className="flex items-center justify-center gap-1">
                <span>{state.icon}</span>
                <span className="hidden sm:inline">{state.name}</span>
                <span className="sm:hidden text-[10px]">{state.id.charAt(0).toUpperCase()}</span>
              </div>
              <div className="text-[8px] sm:text-[9px] opacity-70 mt-0.5">
                {state.range[0]}-{state.range[1]}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Current state description */}
      <div className={`mb-4 p-3 rounded border ${getColorClass('bg')} ${getColorClass('border')}`}>
        <div className={`text-sm font-medium ${getColorClass('text')}`}>
          {currentBrainwave.name}: {currentBrainwave.description}
        </div>
        {currentBrainwave.warning && (
          <div className="text-[10px] text-signal-amber mt-1">
            ⚠️ {currentBrainwave.warning}
          </div>
        )}
      </div>

      {/* Venn Diagram Visualization */}
      <div className="mb-4 relative">
        <div className="bg-carbon-800 rounded-lg p-3 sm:p-6 flex items-center justify-center min-h-[140px] sm:min-h-[180px]">
          {/* Left circle */}
          <div className="relative">
            <motion.div
              className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-blue-500/20 border-2 border-blue-400 flex items-center justify-center"
              animate={{
                scale: isPlaying ? [1, 1.03, 1] : 1,
              }}
              transition={{
                repeat: isPlaying ? Infinity : 0,
                duration: 1 / (beatFrequency || 1),
              }}
            >
              <div className="text-center">
                <div className="text-[8px] sm:text-[10px] text-blue-300 uppercase tracking-wider">Left</div>
                <div className="text-base sm:text-xl font-bold text-blue-400 mt-0.5 sm:mt-1">{frequencies.left.toFixed(1)}</div>
                <div className="text-[8px] sm:text-[10px] text-blue-300">Hz</div>
              </div>
            </motion.div>
          </div>

          {/* Center - Beat frequency (not overlapping, between the circles) */}
          <div className="mx-2 sm:mx-6 z-10">
            <motion.div
              className={`w-16 h-16 sm:w-24 sm:h-24 rounded-full flex items-center justify-center
                ${getColorClass('bg')} border-2 ${getColorClass('border')}
                backdrop-blur-sm shadow-lg`}
              animate={{
                scale: isPlaying ? [1, 1.12, 1] : 1,
                opacity: isPlaying ? [0.85, 1, 0.85] : 0.95,
              }}
              transition={{
                repeat: isPlaying ? Infinity : 0,
                duration: 1 / (beatFrequency || 1),
              }}
            >
              <div className="text-center">
                <div className="text-[7px] sm:text-[9px] text-carbon-400 uppercase tracking-wider">Beat</div>
                <div className={`text-lg sm:text-2xl font-bold ${getColorClass('text')}`}>
                  {beatFrequency.toFixed(1)}
                </div>
                <div className="text-[8px] sm:text-[10px] text-carbon-300">Hz</div>
              </div>
            </motion.div>
          </div>

          {/* Right circle */}
          <div className="relative">
            <motion.div
              className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-red-500/20 border-2 border-red-400 flex items-center justify-center"
              animate={{
                scale: isPlaying ? [1, 1.03, 1] : 1,
              }}
              transition={{
                repeat: isPlaying ? Infinity : 0,
                duration: 1 / (beatFrequency || 1),
                delay: 0.5 / (beatFrequency || 1),
              }}
            >
              <div className="text-center">
                <div className="text-[8px] sm:text-[10px] text-red-300 uppercase tracking-wider">Right</div>
                <div className="text-base sm:text-xl font-bold text-red-400 mt-0.5 sm:mt-1">{frequencies.right.toFixed(1)}</div>
                <div className="text-[8px] sm:text-[10px] text-red-300">Hz</div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Formula */}
        <div className="text-center mt-2 text-[10px] text-carbon-500">
          <span className="text-blue-400">{frequencies.left.toFixed(1)}</span>
          <span className="mx-2">−</span>
          <span className="text-red-400">{frequencies.right.toFixed(1)}</span>
          <span className="mx-2">=</span>
          <span className={getColorClass('text')}>{Math.abs(beatFrequency).toFixed(1)} Hz</span>
          <span className="ml-2 text-carbon-400">({currentBrainwave.name})</span>
        </div>
      </div>

      {/* Compact frequency display for reference */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
        <div className="bg-carbon-800/50 rounded py-2">
          <div className="text-[9px] text-blue-300">🎧 L</div>
        </div>
        <div className={`rounded py-2 ${getColorClass('bg')}`}>
          <div className={`text-[9px] ${getColorClass('text')}`}>🧠 Perceived</div>
        </div>
        <div className="bg-carbon-800/50 rounded py-2">
          <div className="text-[9px] text-red-300">🎧 R</div>
        </div>
      </div>

      {/* Beat frequency slider */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-carbon-500 uppercase tracking-wider">
            Beat Frequency
          </span>
          <span className={`text-xs ${getColorClass('text')}`}>
            {beatFrequency.toFixed(1)} Hz
          </span>
        </div>
        <input
          type="range"
          min={currentBrainwave.range[0]}
          max={currentBrainwave.range[1]}
          step="0.5"
          value={beatFrequency}
          onChange={(e) => setBeatFrequency(parseFloat(e.target.value))}
          className={`w-full h-2 rounded-full appearance-none cursor-pointer
            bg-carbon-700
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-signal-orange
            [&::-webkit-slider-thumb]:cursor-pointer`}
        />
        <div className="flex justify-between text-[9px] text-carbon-500 mt-1">
          <span>{currentBrainwave.range[0]} Hz</span>
          <span>{currentBrainwave.range[1]} Hz</span>
        </div>
      </div>

      {/* Volume */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-carbon-500 uppercase tracking-wider">Volume</span>
          <span className="text-xs text-carbon-400">{Math.round(volume * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
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

      {/* Advanced toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-xs text-carbon-400 hover:text-carbon-200 mb-3"
      >
        {showAdvanced ? '▼ Hide Advanced' : '▶ Advanced Options'}
      </button>

      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            {/* Beat mode */}
            <div>
              <div className="text-[10px] text-carbon-500 uppercase tracking-wider mb-2">
                Beat Placement
              </div>
              <div className="flex gap-2">
                {BEAT_MODES.map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setBeatMode(mode.id)}
                    className={`
                      flex-1 px-3 py-2 text-xs rounded border transition-all
                      ${beatMode === mode.id
                        ? 'bg-carbon-700 border-signal-orange text-signal-orange'
                        : 'bg-carbon-800 border-carbon-700 text-carbon-400 hover:border-carbon-500'}
                    `}
                  >
                    <div className="font-medium">{mode.label}</div>
                    <div className="text-[9px] opacity-70 mt-0.5">{mode.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Wave type */}
            <div>
              <div className="text-[10px] text-carbon-500 uppercase tracking-wider mb-2">
                Wave Type
              </div>
              <div className="flex gap-2">
                {['sine', 'triangle'].map(type => (
                  <button
                    key={type}
                    onClick={() => setWaveType(type)}
                    className={`
                      px-4 py-2 text-xs rounded border transition-all capitalize
                      ${waveType === type
                        ? 'bg-carbon-700 border-signal-coral text-signal-coral'
                        : 'bg-carbon-800 border-carbon-700 text-carbon-400 hover:border-carbon-500'}
                    `}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <p className="text-[9px] text-carbon-500 mt-1">
                Sine is purest. Triangle adds subtle harmonics.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                selectedState === 'delta' ? 'bg-blue-400' :
                selectedState === 'theta' ? 'bg-purple-400' :
                selectedState === 'alpha' ? 'bg-green-400' :
                selectedState === 'beta' ? 'bg-amber-400' : 'bg-red-400'
              }`} />
              <span className="text-[10px] text-carbon-400">
                Generating {beatFrequency.toFixed(1)} Hz {currentBrainwave.name} beat
              </span>
            </div>
            <div className="text-[9px] text-carbon-500 mt-1">
              Left: {frequencies.left.toFixed(2)} Hz | Right: {frequencies.right.toFixed(2)} Hz
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* How it works */}
      <div className="mt-4 pt-3 border-t border-carbon-700">
        <details className="text-[10px] text-carbon-500">
          <summary className="cursor-pointer hover:text-carbon-300">How binaural beats work</summary>
          <div className="mt-2 space-y-1 leading-relaxed">
            <p>Binaural beats are an auditory illusion. When slightly different frequencies are played to each ear (via headphones), your brain perceives a third "beat" at the difference frequency.</p>
            <p>This beat can help entrain your brainwaves to specific states. For example, a 6 Hz beat can encourage theta waves associated with meditation and creativity.</p>
            <p className="text-signal-amber">🎧 Stereo headphones are required for the effect to work.</p>
          </div>
        </details>
      </div>
    </div>
  );
}
