/**
 * Tibetan / Overtone Framework Analysis
 * Ancient — The physics of resonance
 */

import { freqToNoteName, formatHz } from '../pitchUtils';

/**
 * Get singing bowl equivalent
 */
function getBowlEquivalent(f0) {
  if (f0 < 150) {
    return {
      size: 'Large',
      diameter: '25-35cm',
      weight: '800-1500g',
      character: 'Deep, grounding, long sustain',
      note: 'These larger bowls produce fundamental frequencies in the bass range with rich, complex overtones.'
    };
  } else if (f0 < 250) {
    return {
      size: 'Medium',
      diameter: '15-25cm',
      weight: '400-800g',
      character: 'Balanced, warm, versatile',
      note: 'Medium bowls are the most common and versatile, suitable for most practices.'
    };
  } else if (f0 < 400) {
    return {
      size: 'Small',
      diameter: '10-15cm',
      weight: '200-400g',
      character: 'Bright, clear, penetrating',
      note: 'Smaller bowls have higher fundamentals with crisp, cutting overtones.'
    };
  } else {
    return {
      size: 'Very Small',
      diameter: '<10cm',
      weight: '<200g',
      character: 'High, ethereal, delicate',
      note: 'The smallest bowls produce bell-like tones in the upper registers.'
    };
  }
}

/**
 * Generate overtone series
 * Extended to 16 harmonics for comprehensive overtone exploration
 */
function getOvertones(f0, count = 16) {
  const overtones = [];
  // Extended interval names covering harmonics 1-16
  const intervalNames = [
    { harmonic: 1,  name: 'Fundamental', interval: 'P1', inOctave: true },
    { harmonic: 2,  name: 'Octave', interval: 'P8', inOctave: false },
    { harmonic: 3,  name: 'Perfect Fifth + Octave', interval: 'P5+P8', inOctave: false },
    { harmonic: 4,  name: 'Double Octave', interval: '2×P8', inOctave: false },
    { harmonic: 5,  name: 'Major Third + 2 Octaves', interval: 'M3+2×P8', inOctave: false },
    { harmonic: 6,  name: 'Perfect Fifth + 2 Octaves', interval: 'P5+2×P8', inOctave: false },
    { harmonic: 7,  name: 'Flat Seventh + 2 Octaves', interval: 'm7+2×P8', inOctave: false, note: '~31¢ flat of 12-TET' },
    { harmonic: 8,  name: 'Triple Octave', interval: '3×P8', inOctave: false },
    { harmonic: 9,  name: 'Major Second + 3 Octaves', interval: 'M2+3×P8', inOctave: false },
    { harmonic: 10, name: 'Major Third + 3 Octaves', interval: 'M3+3×P8', inOctave: false },
    { harmonic: 11, name: 'Tritone + 3 Octaves', interval: 'TT+3×P8', inOctave: false, note: '~49¢ sharp of 12-TET' },
    { harmonic: 12, name: 'Perfect Fifth + 3 Octaves', interval: 'P5+3×P8', inOctave: false },
    { harmonic: 13, name: 'Minor Sixth + 3 Octaves', interval: 'm6+3×P8', inOctave: false, note: '~41¢ sharp of 12-TET' },
    { harmonic: 14, name: 'Flat Seventh + 3 Octaves', interval: 'm7+3×P8', inOctave: false },
    { harmonic: 15, name: 'Major Seventh + 3 Octaves', interval: 'M7+3×P8', inOctave: false },
    { harmonic: 16, name: 'Quadruple Octave', interval: '4×P8', inOctave: false }
  ];

  for (let n = 1; n <= count; n++) {
    const freq = f0 * n;
    const info = intervalNames[n - 1] || { name: `Harmonic ${n}`, interval: `H${n}`, inOctave: false };

    overtones.push({
      harmonic: n,
      hz: freq,
      hzFormatted: formatHz(freq),
      noteName: freqToNoteName(freq),
      interval: info.name,
      intervalShort: info.interval,
      inFirstOctave: info.inOctave,
      note: info.note || null
    });
  }

  return overtones;
}

/**
 * Full Tibetan framework analysis
 */
export function analyzeTibetan(f0) {
  const overtones = getOvertones(f0);
  const bowl = getBowlEquivalent(f0);

  return {
    bowlEquivalent: bowl,
    overtones,
    overtonePhysics: {
      concept: "The Overtone Series",
      description: "The overtone series explains why certain intervals sound consonant. The octave (2:1) is the second harmonic. The fifth (3:2) comes from the third. These ratios are baked into the physics of vibration itself.",
      yourVoice: "Your voice already contains these overtones—you're a singing bowl."
    },
    bowlCaveat: {
      concept: "On Bowl Tuning Claims",
      description: "Traditional Tibetan bowls weren't tuned to any standard—they varied based on metals and crafting. Modern 'tuned' bowls are manufactured to meet Western expectations. Neither is wrong; just know what you're getting."
    },
    insight: "When you hum, you produce a fundamental plus overtones—a complex acoustic field, not a single tone. Vocal overtone singing (as in Tuvan throat singing) makes this explicit, but even ordinary humming produces the full series."
  };
}

export default analyzeTibetan;
