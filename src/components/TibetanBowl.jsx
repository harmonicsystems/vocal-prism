/**
 * TibetanBowl Component
 * Interactive singing bowl with sacred geometry patterns and authentic audio
 * Click the bowl to play - features realistic singing bowl harmonics
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { unlockAudioSync, getAudioContext } from '../utils/mobileAudio';

// Sacred geometry pattern definitions
const SACRED_PATTERNS = {
  flowerOfLife: {
    name: 'Flower of Life',
    description: 'Ancient symbol of creation'
  },
  seedOfLife: {
    name: 'Seed of Life',
    description: '7 circles of genesis'
  },
  sriYantra: {
    name: 'Sri Yantra',
    description: '9 interlocking triangles'
  },
  metatron: {
    name: "Metatron's Cube",
    description: 'Platonic solids contained'
  },
  mandala: {
    name: 'Mandala',
    description: 'Traditional petal pattern'
  }
};

// Singing bowl harmonic ratios (not perfect integers - this gives the characteristic sound)
// Real singing bowls have inharmonic overtones due to the circular vibration modes
const BOWL_HARMONICS = [
  { ratio: 1.0, gain: 0.5, name: 'Fundamental' },
  { ratio: 2.71, gain: 0.3, name: '1st Overtone' },  // (2,0) mode
  { ratio: 5.0, gain: 0.15, name: '2nd Overtone' },  // (3,0) mode
  { ratio: 7.8, gain: 0.08, name: '3rd Overtone' },  // (4,0) mode
];

// Generate Flower of Life circles (19 circles)
function generateFlowerOfLife(radius) {
  const circles = [];
  const r = radius * 0.28;
  circles.push({ x: 0, y: 0, r });
  for (let i = 0; i < 6; i++) {
    const angle = (i * 60) * (Math.PI / 180);
    circles.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r, r });
  }
  for (let i = 0; i < 6; i++) {
    const angle1 = (i * 60) * (Math.PI / 180);
    const angle2 = ((i * 60) + 30) * (Math.PI / 180);
    circles.push({ x: Math.cos(angle1) * r * 2, y: Math.sin(angle1) * r * 2, r });
    circles.push({ x: Math.cos(angle2) * r * 1.732, y: Math.sin(angle2) * r * 1.732, r });
  }
  return circles;
}

// Generate Seed of Life (7 circles)
function generateSeedOfLife(radius) {
  const circles = [];
  const r = radius * 0.35;
  circles.push({ x: 0, y: 0, r });
  for (let i = 0; i < 6; i++) {
    const angle = (i * 60) * (Math.PI / 180);
    circles.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r, r });
  }
  return circles;
}

// Generate Sri Yantra triangles
function generateSriYantra(radius) {
  const triangles = [];
  const r = radius * 0.8;
  const upScales = [1.0, 0.7, 0.45, 0.25];
  upScales.forEach((scale, i) => {
    const size = r * scale;
    triangles.push({
      points: [
        { x: 0, y: -size },
        { x: -size * 0.866, y: size * 0.5 },
        { x: size * 0.866, y: size * 0.5 }
      ],
      direction: 'up',
      index: i
    });
  });
  const downScales = [0.95, 0.65, 0.4, 0.2, 0.08];
  downScales.forEach((scale, i) => {
    const size = r * scale;
    triangles.push({
      points: [
        { x: 0, y: size },
        { x: -size * 0.866, y: -size * 0.5 },
        { x: size * 0.866, y: -size * 0.5 }
      ],
      direction: 'down',
      index: i
    });
  });
  return triangles;
}

// Generate Metatron's Cube
function generateMetatronsCube(radius) {
  const r = radius * 0.12;
  const circles = [];
  const lines = [];
  circles.push({ x: 0, y: 0, r });
  const innerR = radius * 0.35;
  for (let i = 0; i < 6; i++) {
    const angle = (i * 60 - 90) * (Math.PI / 180);
    circles.push({ x: Math.cos(angle) * innerR, y: Math.sin(angle) * innerR, r });
  }
  const outerR = radius * 0.7;
  for (let i = 0; i < 6; i++) {
    const angle = (i * 60 - 90) * (Math.PI / 180);
    circles.push({ x: Math.cos(angle) * outerR, y: Math.sin(angle) * outerR, r });
  }
  for (let i = 0; i < circles.length; i++) {
    for (let j = i + 1; j < circles.length; j++) {
      lines.push({ x1: circles[i].x, y1: circles[i].y, x2: circles[j].x, y2: circles[j].y });
    }
  }
  return { circles, lines };
}

// Mandala petal generator
function generatePetals(count, radius, offset = 0) {
  const petals = [];
  for (let i = 0; i < count; i++) {
    const angle = (i * (360 / count) + offset) * (Math.PI / 180);
    petals.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      rotation: (i * (360 / count) + offset),
    });
  }
  return petals;
}

export default function TibetanBowl({
  f0 = 165,
  size = 300
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeHarmonics, setActiveHarmonics] = useState([]);
  const [ripples, setRipples] = useState([]);
  const [pulsePhase, setPulsePhase] = useState(0);
  const [pattern, setPattern] = useState('flowerOfLife');
  const [strikeIntensity, setStrikeIntensity] = useState(0);

  const rippleIdRef = useRef(0);
  const audioContextRef = useRef(null);
  const oscillatorsRef = useRef([]);
  const gainNodesRef = useRef([]);
  const masterGainRef = useRef(null);

  const center = size / 2;
  const bowlRadius = size * 0.4;

  // Mandala layers for that pattern
  const mandalaLayers = [
    { petals: 8, radius: bowlRadius * 0.3, color: '#f97316', width: 2 },
    { petals: 12, radius: bowlRadius * 0.5, color: '#fb923c', width: 1.5 },
    { petals: 16, radius: bowlRadius * 0.7, color: '#fdba74', width: 1 },
    { petals: 24, radius: bowlRadius * 0.85, color: '#fed7aa', width: 0.5 },
  ];

  // Strike the bowl - creates the characteristic attack and decay
  const strikeBowl = useCallback(async () => {
    // Sync unlock for mobile
    unlockAudioSync();

    const ctx = await getAudioContext();
    if (!ctx) return;

    audioContextRef.current = ctx;

    // Stop any existing sounds
    oscillatorsRef.current.forEach(osc => {
      try { osc.stop(); } catch (e) {}
    });
    oscillatorsRef.current = [];
    gainNodesRef.current = [];

    // Create master gain for overall volume control
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.4, ctx.currentTime);
    masterGain.connect(ctx.destination);
    masterGainRef.current = masterGain;

    const newOscillators = [];
    const newGainNodes = [];
    const activeHarmonicIndices = [];

    // Create oscillators for each harmonic
    BOWL_HARMONICS.forEach((harmonic, index) => {
      const freq = f0 * harmonic.ratio;

      // Skip if frequency is too high
      if (freq > 8000) return;

      // Main oscillator
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      // Slight detuning oscillator for beating effect (characteristic of singing bowls)
      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq + (Math.random() * 2 - 1), ctx.currentTime); // ±1 Hz beating

      // Individual gain node for this harmonic
      const gain = ctx.createGain();
      const gain2 = ctx.createGain();

      // Envelope: quick attack, long decay (singing bowl characteristic)
      const attackTime = 0.01;
      const decayTime = 8 + index * 2; // Higher harmonics decay faster
      const peakGain = harmonic.gain;

      // Attack
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(peakGain, ctx.currentTime + attackTime);
      // Decay
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + decayTime);

      // Same for beating oscillator but slightly quieter
      gain2.gain.setValueAtTime(0, ctx.currentTime);
      gain2.gain.linearRampToValueAtTime(peakGain * 0.5, ctx.currentTime + attackTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + decayTime);

      // Connect
      osc.connect(gain);
      osc2.connect(gain2);
      gain.connect(masterGain);
      gain2.connect(masterGain);

      // Start
      osc.start(ctx.currentTime);
      osc2.start(ctx.currentTime);

      // Schedule stop
      osc.stop(ctx.currentTime + decayTime + 0.1);
      osc2.stop(ctx.currentTime + decayTime + 0.1);

      newOscillators.push(osc, osc2);
      newGainNodes.push(gain, gain2);
      activeHarmonicIndices.push(index);
    });

    oscillatorsRef.current = newOscillators;
    gainNodesRef.current = newGainNodes;
    setActiveHarmonics(activeHarmonicIndices);
    setIsPlaying(true);

    // Visual strike effect
    setStrikeIntensity(1);
    setTimeout(() => setStrikeIntensity(0), 200);

    // Add ripple
    setRipples(prev => [...prev.slice(-5), {
      id: rippleIdRef.current++,
      startTime: Date.now(),
    }]);

    // Auto-stop after decay
    setTimeout(() => {
      setIsPlaying(false);
      setActiveHarmonics([]);
    }, 10000);

  }, [f0]);

  // Singing/rubbing the bowl - continuous tone
  const [isRubbing, setIsRubbing] = useState(false);

  const startRubbing = useCallback(async () => {
    if (isRubbing) return;

    unlockAudioSync();
    const ctx = await getAudioContext();
    if (!ctx) return;

    audioContextRef.current = ctx;

    // Stop any existing
    oscillatorsRef.current.forEach(osc => {
      try { osc.stop(); } catch (e) {}
    });
    oscillatorsRef.current = [];
    gainNodesRef.current = [];

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 2); // Slow build-up
    masterGain.connect(ctx.destination);
    masterGainRef.current = masterGain;

    const newOscillators = [];
    const newGainNodes = [];
    const activeHarmonicIndices = [];

    BOWL_HARMONICS.forEach((harmonic, index) => {
      const freq = f0 * harmonic.ratio;
      if (freq > 8000) return;

      // Main oscillator
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      // Beating oscillator
      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      // Slow wobble for rubbing effect
      osc2.frequency.setValueAtTime(freq + 0.5, ctx.currentTime);

      const gain = ctx.createGain();
      const gain2 = ctx.createGain();

      gain.gain.setValueAtTime(harmonic.gain, ctx.currentTime);
      gain2.gain.setValueAtTime(harmonic.gain * 0.4, ctx.currentTime);

      osc.connect(gain);
      osc2.connect(gain2);
      gain.connect(masterGain);
      gain2.connect(masterGain);

      osc.start(ctx.currentTime);
      osc2.start(ctx.currentTime);

      newOscillators.push(osc, osc2);
      newGainNodes.push(gain, gain2);
      activeHarmonicIndices.push(index);
    });

    oscillatorsRef.current = newOscillators;
    gainNodesRef.current = newGainNodes;
    setActiveHarmonics(activeHarmonicIndices);
    setIsPlaying(true);
    setIsRubbing(true);

  }, [f0, isRubbing]);

  const stopRubbing = useCallback(() => {
    if (!isRubbing) return;

    const ctx = audioContextRef.current;
    if (ctx && masterGainRef.current) {
      // Fade out
      masterGainRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);

      setTimeout(() => {
        oscillatorsRef.current.forEach(osc => {
          try { osc.stop(); } catch (e) {}
        });
        oscillatorsRef.current = [];
        gainNodesRef.current = [];
        setIsPlaying(false);
        setActiveHarmonics([]);
        setIsRubbing(false);
      }, 1100);
    }
  }, [isRubbing]);

  // Create ripple effect when playing
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setRipples(prev => [...prev.slice(-5), {
        id: rippleIdRef.current++,
        startTime: Date.now(),
      }]);
    }, 800);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Animate pulse
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setPulsePhase(prev => (prev + 1) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Remove old ripples
  useEffect(() => {
    const cleanup = setInterval(() => {
      setRipples(prev => prev.filter(r => Date.now() - r.startTime < 3000));
    }, 500);
    return () => clearInterval(cleanup);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      oscillatorsRef.current.forEach(osc => {
        try { osc.stop(); } catch (e) {}
      });
    };
  }, []);

  return (
    <div className="flex flex-col items-center">
      {/* Interactive Bowl SVG */}
      <motion.svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible cursor-pointer"
        onClick={strikeBowl}
        animate={strikeIntensity > 0 ? { scale: [1, 1.02, 1] } : {}}
        transition={{ duration: 0.2 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <defs>
          <radialGradient id="bowlGradient" cx="30%" cy="30%">
            <stop offset="0%" stopColor="#d4a574" />
            <stop offset="50%" stopColor="#b8860b" />
            <stop offset="100%" stopColor="#8b6914" />
          </radialGradient>
          <filter id="bowlGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <radialGradient id="innerShadow" cx="50%" cy="50%">
            <stop offset="70%" stopColor="transparent" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.3)" />
          </radialGradient>
        </defs>

        {/* Outer glow when playing */}
        <AnimatePresence>
          {isPlaying && (
            <motion.circle
              cx={center}
              cy={center}
              r={bowlRadius + 20}
              fill="none"
              stroke="#f97316"
              strokeWidth="2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.05, 1] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </AnimatePresence>

        {/* Ripple effects */}
        {ripples.map(ripple => (
          <motion.circle
            key={ripple.id}
            cx={center}
            cy={center}
            r={bowlRadius * 0.3}
            fill="none"
            stroke="#f97316"
            strokeWidth="2"
            initial={{ r: bowlRadius * 0.3, opacity: 0.8 }}
            animate={{ r: bowlRadius * 1.2, opacity: 0 }}
            transition={{ duration: 2.5, ease: 'easeOut' }}
          />
        ))}

        {/* Bowl base */}
        <circle
          cx={center}
          cy={center}
          r={bowlRadius}
          fill="url(#bowlGradient)"
          stroke="#8b6914"
          strokeWidth="3"
        />

        {/* Bowl inner surface */}
        <circle
          cx={center}
          cy={center}
          r={bowlRadius * 0.9}
          fill="#1a1a1a"
        />

        {/* Sacred Geometry Patterns */}
        <g transform={`translate(${center}, ${center})`}>
          {/* Flower of Life */}
          {pattern === 'flowerOfLife' && (
            <g>
              {generateFlowerOfLife(bowlRadius * 0.85).map((circle, i) => (
                <motion.circle
                  key={i}
                  cx={circle.x}
                  cy={circle.y}
                  r={circle.r}
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="1"
                  strokeOpacity={isPlaying ? 0.8 : 0.4}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: isPlaying ? [1, 1.02, 1] : 1,
                    opacity: isPlaying ? [0.4, 0.8, 0.4] : 0.4
                  }}
                  transition={{ duration: 2, repeat: isPlaying ? Infinity : 0, delay: i * 0.05 }}
                />
              ))}
            </g>
          )}

          {/* Seed of Life */}
          {pattern === 'seedOfLife' && (
            <g>
              {generateSeedOfLife(bowlRadius * 0.85).map((circle, i) => (
                <motion.circle
                  key={i}
                  cx={circle.x}
                  cy={circle.y}
                  r={circle.r}
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="1.5"
                  strokeOpacity={isPlaying ? 0.9 : 0.5}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: isPlaying ? [1, 1.03, 1] : 1,
                    opacity: isPlaying ? [0.5, 0.9, 0.5] : 0.5
                  }}
                  transition={{ duration: 1.5 + i * 0.2, repeat: isPlaying ? Infinity : 0, delay: i * 0.1 }}
                />
              ))}
            </g>
          )}

          {/* Sri Yantra */}
          {pattern === 'sriYantra' && (
            <g>
              {generateSriYantra(bowlRadius * 0.85).map((tri, i) => (
                <motion.polygon
                  key={i}
                  points={tri.points.map(p => `${p.x},${p.y}`).join(' ')}
                  fill="none"
                  stroke={tri.direction === 'up' ? '#f97316' : '#fb923c'}
                  strokeWidth="1.5"
                  strokeOpacity={isPlaying ? 0.9 : 0.5}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: isPlaying ? [1, 1.02, 1] : 1,
                    opacity: isPlaying ? [0.5, 0.9, 0.5] : 0.5
                  }}
                  transition={{ duration: 2 + tri.index * 0.3, repeat: isPlaying ? Infinity : 0, delay: i * 0.08 }}
                />
              ))}
              <motion.circle
                r={4}
                fill="#f97316"
                animate={isPlaying ? { scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </g>
          )}

          {/* Metatron's Cube */}
          {pattern === 'metatron' && (() => {
            const { circles, lines } = generateMetatronsCube(bowlRadius * 0.85);
            return (
              <g>
                {lines.map((line, i) => (
                  <motion.line
                    key={`line-${i}`}
                    x1={line.x1}
                    y1={line.y1}
                    x2={line.x2}
                    y2={line.y2}
                    stroke="#f97316"
                    strokeWidth="0.5"
                    strokeOpacity={isPlaying ? 0.6 : 0.2}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: isPlaying ? [0.2, 0.6, 0.2] : 0.2 }}
                    transition={{ duration: 3, repeat: isPlaying ? Infinity : 0, delay: i * 0.02 }}
                  />
                ))}
                {circles.map((circle, i) => (
                  <motion.circle
                    key={`circle-${i}`}
                    cx={circle.x}
                    cy={circle.y}
                    r={circle.r}
                    fill="#1a1a1a"
                    stroke="#f97316"
                    strokeWidth="1.5"
                    initial={{ scale: 0 }}
                    animate={{ scale: isPlaying ? [1, 1.1, 1] : 1 }}
                    transition={{ duration: 1.5, repeat: isPlaying ? Infinity : 0, delay: i * 0.08 }}
                  />
                ))}
              </g>
            );
          })()}

          {/* Mandala */}
          {pattern === 'mandala' && (
            <g>
              {mandalaLayers.map((layer, layerIndex) => {
                const petals = generatePetals(
                  layer.petals,
                  layer.radius,
                  isPlaying ? pulsePhase * (layerIndex % 2 === 0 ? 1 : -1) * 0.5 : 0
                );
                return (
                  <g key={layerIndex}>
                    <motion.circle
                      r={layer.radius}
                      fill="none"
                      stroke={layer.color}
                      strokeWidth={layer.width}
                      strokeOpacity={isPlaying ? 0.8 : 0.4}
                      initial={{ scale: 0 }}
                      animate={{ scale: isPlaying ? [1, 1.02, 1] : 1 }}
                      transition={{ scale: { duration: 1 + layerIndex * 0.3, repeat: Infinity } }}
                    />
                    {petals.map((petal, i) => (
                      <motion.circle
                        key={i}
                        cx={petal.x}
                        cy={petal.y}
                        r={3 - layerIndex * 0.5}
                        fill={layer.color}
                        initial={{ scale: 0 }}
                        animate={{
                          scale: isPlaying ? [1, 1.5, 1] : 1,
                          opacity: isPlaying ? [0.6, 1, 0.6] : 0.5,
                        }}
                        transition={{
                          duration: 0.5 + (i % 3) * 0.2,
                          repeat: isPlaying ? Infinity : 0,
                          delay: layerIndex * 0.1 + i * 0.02,
                        }}
                      />
                    ))}
                  </g>
                );
              })}
            </g>
          )}

          {/* Center - click hint or frequency */}
          <motion.g
            animate={isPlaying ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <circle r={25} fill="#1a1a1a" stroke="#f97316" strokeWidth="2" />
            <text
              textAnchor="middle"
              dominantBaseline="central"
              fill="#f97316"
              fontSize="12"
              fontWeight="bold"
            >
              {isPlaying ? Math.round(f0) : '▶'}
            </text>
            {isPlaying && (
              <text y={12} textAnchor="middle" fill="#fdba74" fontSize="8">
                Hz
              </text>
            )}
          </motion.g>
        </g>

        {/* Bowl rim highlight */}
        <ellipse
          cx={center}
          cy={center - bowlRadius * 0.1}
          rx={bowlRadius * 0.8}
          ry={bowlRadius * 0.15}
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="2"
        />

        {/* Inner shadow */}
        <circle
          cx={center}
          cy={center}
          r={bowlRadius * 0.9}
          fill="url(#innerShadow)"
          pointerEvents="none"
        />
      </motion.svg>

      {/* Play Controls */}
      <div className="mt-4 flex gap-3 justify-center">
        <button
          onClick={strikeBowl}
          className={`
            px-4 py-2 rounded-lg text-sm font-medium transition-all
            ${isPlaying && !isRubbing
              ? 'bg-signal-orange text-white'
              : 'bg-carbon-800 text-carbon-300 hover:bg-carbon-700 border border-carbon-600'}
          `}
        >
          Strike Bowl
        </button>
        <button
          onClick={isRubbing ? stopRubbing : startRubbing}
          className={`
            px-4 py-2 rounded-lg text-sm font-medium transition-all
            ${isRubbing
              ? 'bg-signal-orange text-white'
              : 'bg-carbon-800 text-carbon-300 hover:bg-carbon-700 border border-carbon-600'}
          `}
        >
          {isRubbing ? 'Stop Rubbing' : 'Rub Rim'}
        </button>
      </div>

      {/* Sacred Geometry Pattern Selector */}
      <div className="mt-4">
        <div className="text-[10px] uppercase tracking-wider text-carbon-400 text-center mb-2">
          Sacred Geometry Pattern
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          {Object.entries(SACRED_PATTERNS).map(([key, info]) => (
            <button
              key={key}
              onClick={() => setPattern(key)}
              className={`
                px-3 py-1.5 rounded-lg text-xs transition-all
                ${pattern === key
                  ? 'bg-signal-orange text-white'
                  : 'bg-carbon-800 text-carbon-400 hover:text-carbon-200 border border-carbon-700'}
              `}
              title={info.description}
            >
              {info.name}
            </button>
          ))}
        </div>
        <div className="text-[10px] text-carbon-500 text-center mt-2 italic">
          {SACRED_PATTERNS[pattern]?.description}
        </div>
      </div>

      {/* Harmonic indicators - now interactive */}
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {BOWL_HARMONICS.map((harmonic, index) => {
          const isActive = activeHarmonics.includes(index);
          const hz = f0 * harmonic.ratio;
          return (
            <motion.div
              key={index}
              className={`
                px-3 py-2 rounded-lg text-center min-w-[70px]
                ${isActive
                  ? 'bg-signal-orange/20 border border-signal-orange text-signal-orange'
                  : 'bg-carbon-800 border border-carbon-700 text-carbon-500'}
              `}
              animate={isActive && isPlaying ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <div className="text-[10px] font-medium">{harmonic.name}</div>
              <div className="text-xs font-mono">{hz.toFixed(0)} Hz</div>
              <div className="text-[9px] text-carbon-500">×{harmonic.ratio}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Wisdom text */}
      <div className="mt-4 p-3 bg-gradient-to-r from-orange-900/20 to-pink-900/20 rounded-lg text-center max-w-sm border border-orange-500/20">
        <p className="text-xs text-orange-200/80 italic">
          {!isPlaying && "Click the bowl or use the buttons below to hear its voice."}
          {isPlaying && pattern === 'flowerOfLife' && "The Flower of Life contains the patterns of creation - found in ancient temples from Egypt to China."}
          {isPlaying && pattern === 'seedOfLife' && "The Seed of Life represents the seven days of creation - the foundation from which the Flower of Life grows."}
          {isPlaying && pattern === 'sriYantra' && "The Sri Yantra's 9 interlocking triangles represent the union of Shiva and Shakti - masculine and feminine divine energies."}
          {isPlaying && pattern === 'metatron' && "Metatron's Cube contains all 5 Platonic solids - the geometric building blocks of the physical universe."}
          {isPlaying && pattern === 'mandala' && "The singing bowl's vibrations create both audible tones and subtle harmonic interference patterns."}
        </p>
      </div>
    </div>
  );
}
