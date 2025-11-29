/**
 * ShrutiMixer Component
 * Multi-voice mixer for exploring shruti harmonies
 *
 * Play multiple shrutis simultaneously to hear how they sound together
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAudioContext, subscribeToAudioState, unlockAudioSync } from '../utils/mobileAudio';
import { AudioUnlockInline } from './AudioUnlockButton';

// Common harmonic combinations in Indian classical music
const HARMONY_PRESETS = [
  {
    id: 'sa-pa',
    name: 'Sa-Pa (Fifth)',
    shrutis: [1, 14],
    description: 'Perfect fifth - most consonant interval',
    ratio: '3:2'
  },
  {
    id: 'sa-ma',
    name: 'Sa-Ma (Fourth)',
    shrutis: [1, 10],
    description: 'Perfect fourth - stable, open',
    ratio: '4:3'
  },
  {
    id: 'sa-ga',
    name: 'Sa-Ga (Third)',
    shrutis: [1, 8],
    description: 'Major third - bright, sweet',
    ratio: '5:4'
  },
  {
    id: 'sa-ma-pa',
    name: 'Sa-Ma-Pa',
    shrutis: [1, 10, 14],
    description: 'Foundation triad',
    ratio: '4:3:2'
  },
  {
    id: 'sa-ga-pa',
    name: 'Sa-Ga-Pa',
    shrutis: [1, 8, 14],
    description: 'Major chord feeling',
    ratio: '4:5:6'
  },
  {
    id: 'full-drone',
    name: 'Full Tanpura',
    shrutis: [1, 14, 23],
    description: 'Sa-Pa-Sa\' (octave)',
    ratio: '1:3/2:2'
  },
];

// Svara regions for organizing the mixer
const SVARA_GROUPS = [
  { name: 'Sa', shrutis: [1], color: 'orange', primary: true },
  { name: 'Re', shrutis: [2, 3, 4, 5], color: 'amber' },
  { name: 'Ga', shrutis: [6, 7, 8, 9], color: 'yellow' },
  { name: 'Ma', shrutis: [10, 11, 12, 13], color: 'green' },
  { name: 'Pa', shrutis: [14], color: 'cyan', primary: true },
  { name: 'Dha', shrutis: [15, 16, 17, 18], color: 'blue' },
  { name: 'Ni', shrutis: [19, 20, 21, 22], color: 'purple' },
  { name: "Sa'", shrutis: [23], color: 'orange', primary: true },
];

// Variable svaras that can be fine-tuned (5 movable notes)
const TUNABLE_SVARAS = [
  {
    name: 'Re',
    shrutis: [2, 3, 4, 5],
    labels: ['Komal 1', 'Komal 2', 'Shuddha 1', 'Shuddha 2'],
    shortLabels: ['k1', 'k2', 'श1', 'श2'],
    color: 'amber',
    defaultShruti: 4, // Shuddha Re
  },
  {
    name: 'Ga',
    shrutis: [6, 7, 8, 9],
    labels: ['Komal 1', 'Komal 2', 'Shuddha 1', 'Shuddha 2'],
    shortLabels: ['k1', 'k2', 'श1', 'श2'],
    color: 'yellow',
    defaultShruti: 8, // Shuddha Ga
  },
  {
    name: 'Ma',
    shrutis: [10, 11, 12, 13],
    labels: ['Shuddha 1', 'Shuddha 2', 'Tivra 1', 'Tivra 2'],
    shortLabels: ['श1', 'श2', 't1', 't2'],
    color: 'green',
    defaultShruti: 10, // Shuddha Ma
  },
  {
    name: 'Dha',
    shrutis: [15, 16, 17, 18],
    labels: ['Komal 1', 'Komal 2', 'Shuddha 1', 'Shuddha 2'],
    shortLabels: ['k1', 'k2', 'श1', 'श2'],
    color: 'blue',
    defaultShruti: 17, // Shuddha Dha
  },
  {
    name: 'Ni',
    shrutis: [19, 20, 21, 22],
    labels: ['Komal 1', 'Komal 2', 'Shuddha 1', 'Shuddha 2'],
    shortLabels: ['k1', 'k2', 'श1', 'श2'],
    color: 'purple',
    defaultShruti: 21, // Shuddha Ni
  },
];

export default function ShrutiMixer({ shrutiData, f0 = 165 }) {
  const audioContextRef = useRef(null);
  const oscillatorsRef = useRef(new Map());
  const masterGainRef = useRef(null);

  const [activeShrutis, setActiveShrutis] = useState(new Set([1])); // Start with Sa
  const [masterVolume, setMasterVolume] = useState(0.5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioState, setAudioState] = useState('idle');
  const [waveType, setWaveType] = useState('sine');
  const [showAllShrutis, setShowAllShrutis] = useState(false);
  const [showFineTuning, setShowFineTuning] = useState(true);

  // Subscribe to audio state changes
  useEffect(() => {
    const unsubscribe = subscribeToAudioState((state) => {
      if (state === 'running' && audioState === 'waiting') {
        setAudioState('idle');
      }
    });
    return unsubscribe;
  }, [audioState]);

  // Fine-tuning state: which shruti is selected for each tunable svara
  const [tunedShrutis, setTunedShrutis] = useState(() => {
    const initial = {};
    TUNABLE_SVARAS.forEach(svara => {
      initial[svara.name] = { shruti: svara.defaultShruti, enabled: false };
    });
    return initial;
  });

  if (!shrutiData) return null;
  const { scale } = shrutiData;

  // Get shruti data by number
  const getShrutiByNumber = (num) => scale.find(s => s.shruti === num);

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
      masterGainRef.current = ctx.createGain();
      masterGainRef.current.gain.value = masterVolume * 0.4;
      masterGainRef.current.connect(ctx.destination);
    }

    setAudioState('running');
    return ctx;
  }, [masterVolume]);

  // Start an oscillator for a shruti
  const startOscillator = useCallback(async (shrutiNum) => {
    const ctx = await initAudio();
    const shruti = getShrutiByNumber(shrutiNum);
    if (!shruti || oscillatorsRef.current.has(shrutiNum)) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = waveType;
    osc.frequency.value = shruti.hz;

    // Smooth fade in
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(masterGainRef.current);
    osc.start();

    oscillatorsRef.current.set(shrutiNum, { osc, gain });
  }, [initAudio, waveType, scale]);

  // Stop an oscillator for a shruti
  const stopOscillator = useCallback((shrutiNum) => {
    const entry = oscillatorsRef.current.get(shrutiNum);
    if (!entry) return;

    const ctx = audioContextRef.current;
    if (ctx) {
      entry.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
      setTimeout(() => {
        try {
          entry.osc.stop();
          entry.osc.disconnect();
        } catch (e) {}
        oscillatorsRef.current.delete(shrutiNum);
      }, 150);
    }
  }, []);

  // Toggle a shruti
  const toggleShruti = useCallback((shrutiNum) => {
    setActiveShrutis(prev => {
      const next = new Set(prev);
      if (next.has(shrutiNum)) {
        next.delete(shrutiNum);
        if (isPlaying) stopOscillator(shrutiNum);
      } else {
        next.add(shrutiNum);
        if (isPlaying) startOscillator(shrutiNum);
      }
      return next;
    });
  }, [isPlaying, startOscillator, stopOscillator]);

  // Start all active shrutis - CRITICAL: Must call unlockAudioSync FIRST for Safari
  const startAll = useCallback(() => {
    // CRITICAL: Sync unlock first for Safari
    unlockAudioSync();

    (async () => {
      await initAudio();
      for (const num of activeShrutis) {
        await startOscillator(num);
      }
      setIsPlaying(true);
    })();
  }, [initAudio, activeShrutis, startOscillator]);

  // Stop all oscillators
  const stopAll = useCallback(() => {
    oscillatorsRef.current.forEach((_, num) => stopOscillator(num));
    setIsPlaying(false);
  }, [stopOscillator]);

  // Toggle play/stop
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      stopAll();
    } else {
      startAll();
    }
  }, [isPlaying, startAll, stopAll]);

  // Apply preset
  const applyPreset = useCallback((preset) => {
    // Stop current playback
    if (isPlaying) {
      oscillatorsRef.current.forEach((_, num) => stopOscillator(num));
    }

    // Set new active shrutis
    setActiveShrutis(new Set(preset.shrutis));

    // If playing, start the new ones
    if (isPlaying) {
      setTimeout(() => {
        preset.shrutis.forEach(num => startOscillator(num));
      }, 100);
    }
  }, [isPlaying, stopOscillator, startOscillator]);

  // Toggle a tunable svara on/off
  const toggleTunedSvara = useCallback((svaraName) => {
    setTunedShrutis(prev => {
      const current = prev[svaraName];
      const newEnabled = !current.enabled;

      // Update active shrutis
      setActiveShrutis(active => {
        const next = new Set(active);
        if (newEnabled) {
          next.add(current.shruti);
          if (isPlaying) startOscillator(current.shruti);
        } else {
          next.delete(current.shruti);
          if (isPlaying) stopOscillator(current.shruti);
        }
        return next;
      });

      return { ...prev, [svaraName]: { ...current, enabled: newEnabled } };
    });
  }, [isPlaying, startOscillator, stopOscillator]);

  // Change the shruti for a tunable svara
  const changeTunedShruti = useCallback((svaraName, newShruti) => {
    setTunedShrutis(prev => {
      const current = prev[svaraName];
      const oldShruti = current.shruti;

      // If enabled, swap the oscillator
      if (current.enabled) {
        setActiveShrutis(active => {
          const next = new Set(active);
          next.delete(oldShruti);
          next.add(newShruti);
          return next;
        });

        if (isPlaying) {
          stopOscillator(oldShruti);
          setTimeout(() => startOscillator(newShruti), 50);
        }
      }

      return { ...prev, [svaraName]: { ...current, shruti: newShruti } };
    });
  }, [isPlaying, startOscillator, stopOscillator]);

  // Update master volume
  useEffect(() => {
    if (masterGainRef.current && audioContextRef.current) {
      masterGainRef.current.gain.linearRampToValueAtTime(
        masterVolume * 0.4,
        audioContextRef.current.currentTime + 0.1
      );
    }
  }, [masterVolume]);

  // Update wave type for all oscillators
  useEffect(() => {
    oscillatorsRef.current.forEach(({ osc }) => {
      osc.type = waveType;
    });
  }, [waveType]);

  // Cleanup oscillators (don't close shared audio context)
  useEffect(() => {
    return () => {
      oscillatorsRef.current.forEach(({ osc }) => {
        try { osc.stop(); } catch (e) {}
      });
    };
  }, []);

  // Calculate interval info for active shrutis
  const getIntervalInfo = () => {
    const sorted = Array.from(activeShrutis).sort((a, b) => a - b);
    if (sorted.length < 2) return null;

    const intervals = [];
    for (let i = 1; i < sorted.length; i++) {
      const lower = getShrutiByNumber(sorted[i - 1]);
      const upper = getShrutiByNumber(sorted[i]);
      if (lower && upper) {
        const cents = Math.round(1200 * Math.log2(upper.hz / lower.hz));
        intervals.push({
          from: lower.svara,
          to: upper.svara,
          cents
        });
      }
    }
    return intervals;
  };

  const intervalInfo = getIntervalInfo();

  return (
    <div className="bg-carbon-900 rounded-lg p-4 text-white font-mono">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-carbon-200 font-semibold flex items-center gap-2">
            <span>🎹</span>
            Shruti Harmony Mixer
          </h3>
          <p className="text-[10px] text-carbon-500 mt-0.5">
            Select multiple shrutis to hear them together
          </p>
        </div>
        <button
          onClick={togglePlay}
          className={`px-4 py-2 rounded flex items-center gap-2 transition-all border font-bold text-sm
            ${isPlaying
              ? 'bg-signal-orange/20 border-signal-orange text-signal-orange'
              : 'bg-carbon-800 border-carbon-600 text-carbon-400 hover:border-carbon-400'}`}
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
          <span>Tap "Enable Audio" above to play shrutis</span>
        </div>
      )}

      {/* Harmony Presets */}
      <div className="mb-4">
        <div className="text-[10px] text-carbon-500 uppercase tracking-wider mb-2">
          Harmony Presets
        </div>
        <div className="flex flex-wrap gap-1.5">
          {HARMONY_PRESETS.map(preset => {
            const isActive = preset.shrutis.every(s => activeShrutis.has(s)) &&
                            activeShrutis.size === preset.shrutis.length;
            return (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className={`px-2.5 py-1.5 text-[10px] rounded border transition-all
                  ${isActive
                    ? 'bg-signal-orange/20 border-signal-orange text-signal-orange'
                    : 'bg-carbon-800 border-carbon-700 text-carbon-400 hover:border-carbon-500'}`}
                title={preset.description}
              >
                <div className="font-medium">{preset.name}</div>
                <div className="text-[8px] opacity-60">{preset.ratio}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fine-Tuning Section */}
      <div className="mb-4">
        <button
          onClick={() => setShowFineTuning(!showFineTuning)}
          className="flex items-center gap-2 text-[10px] text-carbon-400 hover:text-carbon-200 mb-2"
        >
          <span>{showFineTuning ? '▼' : '▶'}</span>
          <span className="uppercase tracking-wider">Fine-Tune Svaras</span>
          <span className="text-carbon-600">(Re, Ga, Ma, Dha, Ni)</span>
        </button>

        <AnimatePresence>
          {showFineTuning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-carbon-800 rounded-lg p-3 space-y-3"
            >
              <p className="text-[9px] text-carbon-500 mb-3">
                Each variable svara has 4 shruti positions. Toggle on/off and slide to fine-tune.
              </p>

              {TUNABLE_SVARAS.map(svara => {
                const tuning = tunedShrutis[svara.name];
                const shruti = getShrutiByNumber(tuning.shruti);
                const shrutiIndex = svara.shrutis.indexOf(tuning.shruti);
                const isCurrentlyPlaying = isPlaying && tuning.enabled;

                return (
                  <div key={svara.name} className="flex items-center gap-2 sm:gap-3">
                    {/* Toggle button */}
                    <motion.button
                      onClick={() => toggleTunedSvara(svara.name)}
                      className={`w-11 sm:w-14 py-1.5 text-[10px] sm:text-xs rounded border font-bold transition-all flex-shrink-0
                        ${tuning.enabled
                          ? `bg-${svara.color}-500/30 border-${svara.color}-400 text-${svara.color}-300`
                          : 'bg-carbon-900 border-carbon-700 text-carbon-500 hover:border-carbon-500'}`}
                      animate={{
                        scale: isCurrentlyPlaying ? [1, 1.03, 1] : 1,
                      }}
                      transition={{
                        repeat: isCurrentlyPlaying ? Infinity : 0,
                        duration: 0.5,
                      }}
                    >
                      {svara.name}
                    </motion.button>

                    {/* Shruti slider */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="0"
                          max="3"
                          value={shrutiIndex}
                          onChange={(e) => changeTunedShruti(svara.name, svara.shrutis[parseInt(e.target.value)])}
                          className={`flex-1 h-2 rounded-full appearance-none cursor-pointer
                            ${tuning.enabled ? `bg-${svara.color}-900` : 'bg-carbon-700'}
                            [&::-webkit-slider-thumb]:appearance-none
                            [&::-webkit-slider-thumb]:w-5
                            [&::-webkit-slider-thumb]:h-5
                            [&::-webkit-slider-thumb]:rounded-full
                            [&::-webkit-slider-thumb]:cursor-pointer
                            ${tuning.enabled
                              ? `[&::-webkit-slider-thumb]:bg-${svara.color}-400`
                              : '[&::-webkit-slider-thumb]:bg-carbon-500'}`}
                        />
                      </div>
                      {/* Shruti labels - hidden on mobile, show short labels */}
                      <div className="hidden sm:flex justify-between mt-0.5">
                        {svara.labels.map((label, i) => (
                          <button
                            key={i}
                            onClick={() => changeTunedShruti(svara.name, svara.shrutis[i])}
                            className={`text-[8px] px-1 rounded transition-all
                              ${shrutiIndex === i
                                ? tuning.enabled
                                  ? `text-${svara.color}-300 font-bold`
                                  : 'text-carbon-300 font-bold'
                                : 'text-carbon-600 hover:text-carbon-400'}`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      {/* Mobile: show current position only */}
                      <div className="sm:hidden text-[8px] text-carbon-500 mt-0.5 text-center">
                        {svara.labels[shrutiIndex]}
                      </div>
                    </div>

                    {/* Hz display */}
                    <div className={`text-right w-14 sm:w-20 flex-shrink-0 ${tuning.enabled ? `text-${svara.color}-400` : 'text-carbon-600'}`}>
                      <div className="text-[10px] sm:text-xs font-medium">{shruti?.hzFormatted || '—'}</div>
                      <div className="text-[7px] sm:text-[8px]">{shruti?.cents || 0}¢</div>
                    </div>
                  </div>
                );
              })}

              {/* Quick actions for fine-tuning */}
              <div className="flex gap-2 pt-2 border-t border-carbon-700">
                <button
                  onClick={() => {
                    // Enable all with shuddha defaults
                    const newTuned = {};
                    TUNABLE_SVARAS.forEach(svara => {
                      newTuned[svara.name] = { shruti: svara.defaultShruti, enabled: true };
                    });
                    setTunedShrutis(newTuned);
                    // Add all to active
                    setActiveShrutis(prev => {
                      const next = new Set(prev);
                      next.add(1); // Sa
                      TUNABLE_SVARAS.forEach(s => next.add(s.defaultShruti));
                      return next;
                    });
                  }}
                  className="px-2 py-1 text-[9px] rounded border bg-carbon-900 border-carbon-700
                    text-carbon-400 hover:border-carbon-500 transition-all"
                >
                  All Shuddha
                </button>
                <button
                  onClick={() => {
                    // Disable all tuned svaras
                    const newTuned = {};
                    TUNABLE_SVARAS.forEach(svara => {
                      newTuned[svara.name] = { ...tunedShrutis[svara.name], enabled: false };
                    });
                    setTunedShrutis(newTuned);
                    // Remove from active
                    setActiveShrutis(prev => {
                      const next = new Set(prev);
                      TUNABLE_SVARAS.forEach(s => {
                        s.shrutis.forEach(sh => next.delete(sh));
                      });
                      return next;
                    });
                  }}
                  className="px-2 py-1 text-[9px] rounded border bg-carbon-900 border-carbon-700
                    text-carbon-400 hover:border-carbon-500 transition-all"
                >
                  Clear All
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Svara Selector Grid */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-carbon-500 uppercase tracking-wider">
            Select Shrutis
          </span>
          <button
            onClick={() => setShowAllShrutis(!showAllShrutis)}
            className="text-[9px] text-carbon-400 hover:text-carbon-200"
          >
            {showAllShrutis ? 'Show Main' : 'Show All 22'}
          </button>
        </div>

        <div className="grid grid-cols-8 gap-1">
          {SVARA_GROUPS.map(group => {
            const displayShrutis = showAllShrutis ? group.shrutis :
              (group.primary ? group.shrutis : [group.shrutis[0], group.shrutis[group.shrutis.length - 1]].filter((v, i, a) => a.indexOf(v) === i));

            return (
              <div key={group.name} className="space-y-1">
                <div className={`text-[9px] text-${group.color}-400 font-bold text-center`}>
                  {group.name}
                </div>
                {displayShrutis.map(shrutiNum => {
                  const shruti = getShrutiByNumber(shrutiNum);
                  if (!shruti) return null;

                  const isActive = activeShrutis.has(shrutiNum);
                  const isCurrentlyPlaying = isPlaying && isActive;

                  return (
                    <motion.button
                      key={shrutiNum}
                      onClick={() => toggleShruti(shrutiNum)}
                      className={`w-full py-1.5 px-1 text-[9px] rounded border transition-all
                        ${isActive
                          ? `bg-${group.color}-500/30 border-${group.color}-400 text-${group.color}-300`
                          : 'bg-carbon-800 border-carbon-700 text-carbon-500 hover:border-carbon-500'}`}
                      animate={{
                        scale: isCurrentlyPlaying ? [1, 1.05, 1] : 1,
                      }}
                      transition={{
                        repeat: isCurrentlyPlaying ? Infinity : 0,
                        duration: 0.5,
                      }}
                    >
                      <div className="font-medium truncate">{shruti.svara.split(' ')[0]}</div>
                      <div className="text-[7px] opacity-60">{shruti.hz.toFixed(0)}</div>
                    </motion.button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Shrutis Display */}
      <div className="bg-carbon-800 rounded p-3 mb-4">
        <div className="text-[9px] text-carbon-500 uppercase tracking-wider mb-2">
          Active Voices ({activeShrutis.size})
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from(activeShrutis).sort((a, b) => a - b).map(num => {
            const shruti = getShrutiByNumber(num);
            if (!shruti) return null;
            return (
              <div
                key={num}
                className="flex items-center gap-1.5 bg-carbon-700 rounded px-2 py-1"
              >
                {isPlaying && (
                  <div className="w-1.5 h-1.5 rounded-full bg-signal-orange animate-pulse" />
                )}
                <span className="text-xs text-carbon-200">{shruti.svara}</span>
                <span className="text-[9px] text-carbon-400">{shruti.hzFormatted}</span>
                <button
                  onClick={() => toggleShruti(num)}
                  className="text-carbon-500 hover:text-carbon-300 ml-1"
                >
                  ×
                </button>
              </div>
            );
          })}
          {activeShrutis.size === 0 && (
            <span className="text-xs text-carbon-500 italic">No shrutis selected</span>
          )}
        </div>

        {/* Interval Info */}
        {intervalInfo && intervalInfo.length > 0 && (
          <div className="mt-3 pt-2 border-t border-carbon-700">
            <div className="text-[9px] text-carbon-500 mb-1">Intervals:</div>
            <div className="flex flex-wrap gap-2">
              {intervalInfo.map((int, i) => (
                <span key={i} className="text-[10px] text-carbon-400">
                  {int.from}→{int.to}: <span className="text-carbon-300">{int.cents}¢</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="space-y-3">
        {/* Volume */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-carbon-500 uppercase tracking-wider w-16">Volume</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={masterVolume}
            onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-carbon-700 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-signal-orange
              [&::-webkit-slider-thumb]:cursor-pointer"
          />
          <span className="text-[10px] text-carbon-400 w-8">{Math.round(masterVolume * 100)}%</span>
        </div>

        {/* Wave Type */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-carbon-500 uppercase tracking-wider w-16">Tone</span>
          <div className="flex gap-1.5">
            {['sine', 'triangle', 'sawtooth'].map(type => (
              <button
                key={type}
                onClick={() => setWaveType(type)}
                className={`px-3 py-1 text-[10px] rounded border capitalize transition-all
                  ${waveType === type
                    ? 'bg-carbon-700 border-signal-coral text-signal-coral'
                    : 'bg-carbon-800 border-carbon-700 text-carbon-400 hover:border-carbon-500'}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 pt-3 border-t border-carbon-700 flex gap-2">
        <button
          onClick={() => setActiveShrutis(new Set([1]))}
          className="px-3 py-1.5 text-[10px] rounded border bg-carbon-800 border-carbon-700
            text-carbon-400 hover:border-carbon-500 transition-all"
        >
          Reset to Sa
        </button>
        <button
          onClick={() => setActiveShrutis(new Set())}
          className="px-3 py-1.5 text-[10px] rounded border bg-carbon-800 border-carbon-700
            text-carbon-400 hover:border-carbon-500 transition-all"
        >
          Clear All
        </button>
      </div>

      {/* Info */}
      <div className="mt-3 pt-3 border-t border-carbon-700">
        <details className="text-[10px] text-carbon-500">
          <summary className="cursor-pointer hover:text-carbon-300">About shruti harmonies</summary>
          <div className="mt-2 space-y-1 leading-relaxed">
            <p>In Indian classical music, certain shruti combinations create characteristic harmonic colors. The Sa-Pa (fifth) and Sa-Ma (fourth) are the most stable.</p>
            <p>Try adding shrutis one at a time to hear how each new voice changes the harmony. Notice how some combinations "beat" against each other while others blend smoothly.</p>
          </div>
        </details>
      </div>
    </div>
  );
}
