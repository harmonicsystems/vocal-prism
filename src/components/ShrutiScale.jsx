/**
 * ShrutiScale Component
 * Displays the 22 shruti microtonal intervals with audio playback
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAudioContext } from '../utils/mobileAudio';

export default function ShrutiScale({ shrutiData, f0 = 165 }) {
  const [showFull, setShowFull] = useState(false);
  const [selectedRaga, setSelectedRaga] = useState(null);

  // Audio state
  const audioContextRef = useRef(null);
  const activeOscillatorsRef = useRef(new Map());
  const droneOscRef = useRef(null);
  const droneGainRef = useRef(null);
  const masterGainRef = useRef(null);

  const [isDronePlaying, setIsDronePlaying] = useState(false);
  const [playingShruti, setPlayingShruti] = useState(null);
  const [isPlayingSequence, setIsPlayingSequence] = useState(false);
  const [droneVolume, setDroneVolume] = useState(0.3);
  const sequenceTimeoutRef = useRef(null);

  if (!shrutiData) return null;

  const { scale, ragas, system } = shrutiData;

  // Initialize audio context with mobile-friendly unlocking
  const initAudio = useCallback(async () => {
    const ctx = await getAudioContext();
    if (!ctx || ctx.state !== 'running') return null;

    if (!audioContextRef.current || audioContextRef.current !== ctx) {
      audioContextRef.current = ctx;
      masterGainRef.current = ctx.createGain();
      masterGainRef.current.gain.value = 0.5;
      masterGainRef.current.connect(ctx.destination);
    }
    return ctx;
  }, []);

  // Play a single shruti tone
  const playShruti = useCallback(async (shruti, duration = 0.8) => {
    const ctx = await initAudio();
    const hz = shruti.hz;

    // Stop any existing tone for this shruti
    if (activeOscillatorsRef.current.has(shruti.shruti)) {
      const old = activeOscillatorsRef.current.get(shruti.shruti);
      old.osc.stop();
      old.osc.disconnect();
      activeOscillatorsRef.current.delete(shruti.shruti);
    }

    // Create oscillator
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = hz;

    // Envelope
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(masterGainRef.current);

    osc.start();
    osc.stop(ctx.currentTime + duration + 0.1);

    activeOscillatorsRef.current.set(shruti.shruti, { osc, gain });
    setPlayingShruti(shruti.shruti);

    setTimeout(() => {
      setPlayingShruti(prev => prev === shruti.shruti ? null : prev);
      activeOscillatorsRef.current.delete(shruti.shruti);
    }, duration * 1000);
  }, [initAudio]);

  // Toggle Sa drone
  const toggleDrone = useCallback(async () => {
    const ctx = await initAudio();

    if (isDronePlaying && droneOscRef.current) {
      droneGainRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
      setTimeout(() => {
        if (droneOscRef.current) {
          droneOscRef.current.stop();
          droneOscRef.current.disconnect();
          droneOscRef.current = null;
        }
      }, 350);
      setIsDronePlaying(false);
    } else {
      // Create drone oscillator (Sa)
      droneOscRef.current = ctx.createOscillator();
      droneGainRef.current = ctx.createGain();

      droneOscRef.current.type = 'sine';
      droneOscRef.current.frequency.value = f0;

      droneGainRef.current.gain.setValueAtTime(0, ctx.currentTime);
      droneGainRef.current.gain.linearRampToValueAtTime(droneVolume * 0.5, ctx.currentTime + 0.2);

      droneOscRef.current.connect(droneGainRef.current);
      droneGainRef.current.connect(masterGainRef.current);

      droneOscRef.current.start();
      setIsDronePlaying(true);
    }
  }, [initAudio, isDronePlaying, f0, droneVolume]);

  // Update drone volume
  useEffect(() => {
    if (droneGainRef.current && audioContextRef.current && isDronePlaying) {
      droneGainRef.current.gain.linearRampToValueAtTime(
        droneVolume * 0.5,
        audioContextRef.current.currentTime + 0.1
      );
    }
  }, [droneVolume, isDronePlaying]);

  // Play ascending scale
  const playScale = useCallback(async (shrutisToPlay = null) => {
    if (isPlayingSequence) {
      // Stop sequence
      if (sequenceTimeoutRef.current) {
        clearTimeout(sequenceTimeoutRef.current);
      }
      setIsPlayingSequence(false);
      setPlayingShruti(null);
      return;
    }

    setIsPlayingSequence(true);
    const toPlay = shrutisToPlay || scale;
    const noteDelay = 400; // ms between notes

    for (let i = 0; i < toPlay.length; i++) {
      if (!isPlayingSequence && i > 0) break;

      await new Promise(resolve => {
        sequenceTimeoutRef.current = setTimeout(() => {
          playShruti(toPlay[i], 0.5);
          resolve();
        }, i * noteDelay);
      });
    }

    setTimeout(() => setIsPlayingSequence(false), toPlay.length * noteDelay + 500);
  }, [scale, playShruti, isPlayingSequence]);

  // Play raga pattern
  const playRaga = useCallback(() => {
    if (!selectedRaga || !ragas[selectedRaga]) return;

    const ragaShrutiNumbers = ragas[selectedRaga].shrutis;
    const ragaShrutis = scale.filter(s => ragaShrutiNumbers.includes(s.shruti));
    playScale(ragaShrutis);
  }, [selectedRaga, ragas, scale, playScale]);

  // Cleanup oscillators (don't close shared audio context)
  useEffect(() => {
    return () => {
      if (sequenceTimeoutRef.current) {
        clearTimeout(sequenceTimeoutRef.current);
      }
      if (droneOscRef.current) {
        try { droneOscRef.current.stop(); droneOscRef.current.disconnect(); } catch (e) {}
      }
      activeOscillatorsRef.current.forEach(({ osc }) => {
        try { osc.stop(); } catch (e) {}
      });
    };
  }, []);

  // Group shrutis by svara region
  const regions = [
    { name: 'Sa', shrutis: [1], color: 'signal-orange' },
    { name: 'Re', shrutis: [2, 3, 4, 5], color: 'amber-500' },
    { name: 'Ga', shrutis: [6, 7, 8, 9], color: 'yellow-500' },
    { name: 'Ma', shrutis: [10, 11, 12, 13], color: 'green-500' },
    { name: 'Pa', shrutis: [14], color: 'cyan-500' },
    { name: 'Dha', shrutis: [15, 16, 17, 18], color: 'blue-500' },
    { name: 'Ni', shrutis: [19, 20, 21, 22], color: 'purple-500' },
    { name: "Sa'", shrutis: [23], color: 'signal-orange' },
  ];

  // Get shrutis in selected raga
  const ragaShrutis = selectedRaga ? ragas[selectedRaga]?.shrutis || [] : [];

  return (
    <div className="bg-carbon-800 rounded-lg p-4 text-white font-mono text-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-carbon-200 font-semibold">22 Shruti System</h3>
          <p className="text-[10px] text-carbon-500 mt-0.5">
            Microtonal intervals from Sa ({f0} Hz) — click to play
          </p>
        </div>
        <button
          onClick={() => setShowFull(!showFull)}
          className="text-xs text-carbon-400 hover:text-carbon-200"
        >
          {showFull ? '▼ Collapse' : '▶ Expand All'}
        </button>
      </div>

      {/* Audio Controls */}
      <div className="bg-carbon-900 rounded-lg p-3 mb-4 border border-carbon-700">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {/* Sa Drone Toggle */}
          <button
            onClick={toggleDrone}
            className={`px-3 py-1.5 text-xs rounded border transition-all flex items-center gap-1.5
              ${isDronePlaying
                ? 'bg-signal-orange/20 border-signal-orange text-signal-orange'
                : 'bg-carbon-800 border-carbon-600 text-carbon-400 hover:border-carbon-400'}`}
          >
            <span>{isDronePlaying ? '■' : '▶'}</span>
            <span>Sa Drone</span>
          </button>

          {/* Play Scale */}
          <button
            onClick={() => playScale()}
            className={`px-3 py-1.5 text-xs rounded border transition-all flex items-center gap-1.5
              ${isPlayingSequence
                ? 'bg-purple-500/20 border-purple-400 text-purple-400'
                : 'bg-carbon-800 border-carbon-600 text-carbon-400 hover:border-carbon-400'}`}
          >
            <span>{isPlayingSequence ? '■' : '▶'}</span>
            <span>{isPlayingSequence ? 'Stop' : 'Play All 22'}</span>
          </button>

          {/* Play Selected Raga */}
          {selectedRaga && (
            <button
              onClick={playRaga}
              className="px-3 py-1.5 text-xs rounded border transition-all flex items-center gap-1.5
                bg-amber-500/20 border-amber-400 text-amber-400 hover:bg-amber-500/30"
            >
              <span>▶</span>
              <span>Play {ragas[selectedRaga]?.name}</span>
            </button>
          )}
        </div>

        {/* Drone Volume */}
        {isDronePlaying && (
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-carbon-500 uppercase tracking-wider">Drone Vol</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={droneVolume}
              onChange={(e) => setDroneVolume(parseFloat(e.target.value))}
              className="flex-1 h-1.5 bg-carbon-700 rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-3
                [&::-webkit-slider-thumb]:h-3
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-signal-orange
                [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <span className="text-[9px] text-carbon-400 w-8">{Math.round(droneVolume * 100)}%</span>
          </div>
        )}

        {/* Now Playing Indicator */}
        <AnimatePresence>
          {(isDronePlaying || playingShruti) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 pt-2 border-t border-carbon-700 flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-signal-orange animate-pulse" />
              <span className="text-[9px] text-carbon-400">
                {isDronePlaying && `Sa drone (${f0} Hz)`}
                {isDronePlaying && playingShruti && ' + '}
                {playingShruti && (() => {
                  const s = scale.find(sh => sh.shruti === playingShruti);
                  return s ? `${s.svara} (${s.hzFormatted})` : '';
                })()}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Explanation */}
      <div className="bg-carbon-900 rounded p-3 mb-4 text-[10px] text-carbon-400 space-y-1">
        <p><span className="text-carbon-300">What:</span> {system.what}</p>
        <p><span className="text-carbon-300">Why:</span> {system.why}</p>
        <p><span className="text-carbon-300">Note:</span> {system.note}</p>
      </div>

      {/* Raga selector */}
      <div className="mb-4">
        <div className="text-[9px] text-carbon-500 uppercase tracking-wider mb-1.5">
          Raga Patterns (select to highlight)
        </div>
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setSelectedRaga(null)}
            className={`px-2 py-1 text-[10px] rounded border transition-all
              ${!selectedRaga
                ? 'bg-carbon-700 border-signal-orange text-signal-orange'
                : 'bg-carbon-900 border-carbon-700 text-carbon-400 hover:border-carbon-500'}`}
          >
            All
          </button>
          {Object.entries(ragas).map(([id, raga]) => (
            <button
              key={id}
              onClick={() => setSelectedRaga(id)}
              className={`px-2 py-1 text-[10px] rounded border transition-all
                ${selectedRaga === id
                  ? 'bg-carbon-700 border-signal-orange text-signal-orange'
                  : 'bg-carbon-900 border-carbon-700 text-carbon-400 hover:border-carbon-500'}`}
              title={raga.description}
            >
              {raga.name}
            </button>
          ))}
        </div>
      </div>

      {/* Shruti visualization */}
      <div className="space-y-2">
        {regions.map(region => {
          const regionShrutis = scale.filter(s => region.shrutis.includes(s.shruti));
          const isExpanded = showFull || region.shrutis.length === 1;

          return (
            <div key={region.name} className="bg-carbon-900 rounded p-2">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-${region.color} font-bold text-xs w-8`}>{region.name}</span>
                <span className="text-[9px] text-carbon-500">
                  {region.shrutis.length} shruti{region.shrutis.length > 1 ? 's' : ''}
                </span>
              </div>

              <AnimatePresence>
                {(isExpanded || region.shrutis.length <= 2) ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-0.5"
                  >
                    {regionShrutis.map(shruti => {
                      const inRaga = ragaShrutis.includes(shruti.shruti);
                      const highlight = !selectedRaga || inRaga;
                      const isPlaying = playingShruti === shruti.shruti;

                      return (
                        <button
                          key={shruti.shruti}
                          onClick={() => playShruti(shruti)}
                          className={`w-full flex items-center justify-between text-[10px] py-1 px-2 rounded
                            transition-all cursor-pointer
                            ${highlight ? '' : 'opacity-30'}
                            ${isPlaying
                              ? 'bg-signal-orange/30 border border-signal-orange'
                              : inRaga && selectedRaga
                                ? 'bg-signal-orange/10 hover:bg-signal-orange/20'
                                : 'hover:bg-carbon-700/50'}
                            `}
                        >
                          <div className="flex items-center gap-2">
                            {isPlaying && (
                              <span className="w-1.5 h-1.5 rounded-full bg-signal-orange animate-pulse" />
                            )}
                            <span className={`text-carbon-500 ${isPlaying ? 'w-2' : 'w-4'}`}>
                              {!isPlaying && `#${shruti.shruti}`}
                            </span>
                            <span className={`${isPlaying ? 'text-signal-orange font-medium' : 'text-carbon-300'}`}>
                              {shruti.svara}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-carbon-500">{shruti.ratio[0]}:{shruti.ratio[1]}</span>
                            <span className={`w-16 text-right ${isPlaying ? 'text-signal-orange' : 'text-carbon-400'}`}>
                              {shruti.hzFormatted}
                            </span>
                            <span className="text-carbon-500 w-12 text-right">{shruti.cents}¢</span>
                            <span className="text-carbon-600 text-[9px] w-4">▶</span>
                          </div>
                        </button>
                      );
                    })}
                  </motion.div>
                ) : (
                  <div className="text-[9px] text-carbon-600">
                    {regionShrutis[0].hzFormatted} – {regionShrutis[regionShrutis.length - 1].hzFormatted}
                  </div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-carbon-700">
        <p className="text-[9px] text-carbon-500 leading-relaxed">
          The 22 shrutis provide the microtonal palette for Indian classical music.
          Ragas use specific shruti selections to create distinct melodic personalities.
        </p>
      </div>
    </div>
  );
}
