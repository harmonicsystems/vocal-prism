/**
 * Tuning Configuration System
 * Handles reference pitch standards and verifies musical math
 *
 * KEY CONCEPTS:
 * 1. Reference Pitch (A4) - The standard for naming notes (440, 432, 415, etc.)
 * 2. Just Intonation Ratios - Pure ratios applied to user's f0 (independent of reference)
 * 3. Equal Temperament - 12-TET for comparison/standard pitch lookup
 */

// ============================================
// REFERENCE TUNING STANDARDS
// ============================================

export const TUNING_STANDARDS = {
  'A440': {
    name: 'Modern Standard (A=440)',
    a4: 440,
    description: 'International standard since 1939 (ISO 16)',
    context: 'Most recorded music, modern orchestras, digital instruments'
  },
  'A432': {
    name: 'Verdi Pitch (A=432)',
    a4: 432,
    description: 'Advocated by Verdi, some claim "natural" properties',
    context: 'Historical interest, alternative tuning community'
  },
  'A415': {
    name: 'Baroque Pitch (A=415)',
    a4: 415,
    description: 'Common baroque tuning, ~1 semitone below modern',
    context: 'Period instrument performance, baroque music'
  },
  'A466': {
    name: 'High Baroque (A=466)',
    a4: 466,
    description: 'North German baroque organs',
    context: 'Some Bach organ works'
  },
  'A435': {
    name: 'French Diapason (A=435)',
    a4: 435,
    description: 'French standard from 1859',
    context: 'Historical French orchestras'
  },
  'A444': {
    name: 'Scientific Pitch (C=256)',
    a4: 444, // When C4 = 256, A4 ≈ 444
    description: 'Also called "Philosophical pitch"',
    context: 'Acoustics, some Waldorf education'
  }
};

// ============================================
// JUST INTONATION RATIOS (5-LIMIT)
// ============================================

// These are the mathematically correct 5-limit just intonation ratios
// Also known as Ptolemaic or Syntonic tuning
export const JUST_INTONATION_RATIOS = {
  // Unison
  P1: { ratio: [1, 1], decimal: 1.0, name: 'Unison', svara: 'Sa', solfege: 'Do' },

  // Seconds
  m2: { ratio: [16, 15], decimal: 16/15, name: 'Minor 2nd', svara: 'Komal Re', solfege: 'Ra' },
  M2: { ratio: [9, 8], decimal: 9/8, name: 'Major 2nd', svara: 'Re', solfege: 'Re' },

  // Thirds
  m3: { ratio: [6, 5], decimal: 6/5, name: 'Minor 3rd', svara: 'Komal Ga', solfege: 'Me' },
  M3: { ratio: [5, 4], decimal: 5/4, name: 'Major 3rd', svara: 'Ga', solfege: 'Mi' },

  // Fourth
  P4: { ratio: [4, 3], decimal: 4/3, name: 'Perfect 4th', svara: 'Ma', solfege: 'Fa' },

  // Tritone (augmented 4th / diminished 5th)
  A4: { ratio: [45, 32], decimal: 45/32, name: 'Augmented 4th', svara: 'Tivra Ma', solfege: 'Fi' },
  d5: { ratio: [64, 45], decimal: 64/45, name: 'Diminished 5th', svara: 'Komal Pa', solfege: 'Se' },

  // Fifth
  P5: { ratio: [3, 2], decimal: 3/2, name: 'Perfect 5th', svara: 'Pa', solfege: 'So' },

  // Sixths
  m6: { ratio: [8, 5], decimal: 8/5, name: 'Minor 6th', svara: 'Komal Dha', solfege: 'Le' },
  M6: { ratio: [5, 3], decimal: 5/3, name: 'Major 6th', svara: 'Dha', solfege: 'La' },

  // Sevenths
  m7: { ratio: [9, 5], decimal: 9/5, name: 'Minor 7th', svara: 'Komal Ni', solfege: 'Te' },
  M7: { ratio: [15, 8], decimal: 15/8, name: 'Major 7th', svara: 'Ni', solfege: 'Ti' },

  // Octave
  P8: { ratio: [2, 1], decimal: 2.0, name: 'Octave', svara: "Sa'", solfege: "Do'" }
};

// Shuddh (pure) major scale degrees used in our default scale
export const SHUDDH_SCALE = ['P1', 'M2', 'M3', 'P4', 'P5', 'M6', 'M7', 'P8'];

// ============================================
// PYTHAGOREAN TUNING (3-LIMIT)
// ============================================

// Built purely from stacking perfect fifths (3:2)
// Note: Pythagorean major 3rd (81:64) is sharper than just (5:4)
export const PYTHAGOREAN_RATIOS = {
  P1: { ratio: [1, 1], decimal: 1.0, name: 'Unison' },
  M2: { ratio: [9, 8], decimal: 9/8, name: 'Major 2nd' }, // Same as just
  M3: { ratio: [81, 64], decimal: 81/64, name: 'Ditone (Pythagorean 3rd)' }, // ~408 cents, sharper
  P4: { ratio: [4, 3], decimal: 4/3, name: 'Perfect 4th' }, // Same as just
  P5: { ratio: [3, 2], decimal: 3/2, name: 'Perfect 5th' }, // Same as just
  M6: { ratio: [27, 16], decimal: 27/16, name: 'Pythagorean 6th' }, // Sharper than just
  M7: { ratio: [243, 128], decimal: 243/128, name: 'Pythagorean 7th' }, // Sharper than just
  P8: { ratio: [2, 1], decimal: 2.0, name: 'Octave' }
};

// The Pythagorean comma: 12 fifths vs 7 octaves
export const PYTHAGOREAN_COMMA = {
  ratio: [531441, 524288], // (3/2)^12 / 2^7
  decimal: 531441 / 524288, // ≈ 1.01364
  cents: 23.46 // The gap that drove 2000 years of tuning debates
};

// ============================================
// EQUAL TEMPERAMENT
// ============================================

// 12-tone equal temperament ratios
export const EQUAL_TEMPERAMENT = {};
const INTERVAL_NAMES_ET = [
  'Unison', 'Minor 2nd', 'Major 2nd', 'Minor 3rd', 'Major 3rd',
  'Perfect 4th', 'Tritone', 'Perfect 5th', 'Minor 6th', 'Major 6th',
  'Minor 7th', 'Major 7th', 'Octave'
];

for (let i = 0; i <= 12; i++) {
  const ratio = Math.pow(2, i / 12);
  EQUAL_TEMPERAMENT[i] = {
    semitones: i,
    ratio: ratio,
    cents: i * 100,
    name: INTERVAL_NAMES_ET[i]
  };
}

// ============================================
// COMPARISON TABLE: Just vs Pythagorean vs ET
// ============================================

export const TUNING_COMPARISON = {
  'Unison':      { just: 1.0,      pythagorean: 1.0,       et: 1.0,      justCents: 0,    pythCents: 0,    etCents: 0 },
  'Major 2nd':   { just: 9/8,      pythagorean: 9/8,       et: Math.pow(2, 2/12),  justCents: 203.91, pythCents: 203.91, etCents: 200 },
  'Major 3rd':   { just: 5/4,      pythagorean: 81/64,     et: Math.pow(2, 4/12),  justCents: 386.31, pythCents: 407.82, etCents: 400 },
  'Perfect 4th': { just: 4/3,      pythagorean: 4/3,       et: Math.pow(2, 5/12),  justCents: 498.04, pythCents: 498.04, etCents: 500 },
  'Perfect 5th': { just: 3/2,      pythagorean: 3/2,       et: Math.pow(2, 7/12),  justCents: 701.96, pythCents: 701.96, etCents: 700 },
  'Major 6th':   { just: 5/3,      pythagorean: 27/16,     et: Math.pow(2, 9/12),  justCents: 884.36, pythCents: 905.87, etCents: 900 },
  'Major 7th':   { just: 15/8,     pythagorean: 243/128,   et: Math.pow(2, 11/12), justCents: 1088.27, pythCents: 1109.78, etCents: 1100 },
  'Octave':      { just: 2.0,      pythagorean: 2.0,       et: 2.0,      justCents: 1200, pythCents: 1200, etCents: 1200 }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Convert frequency to MIDI note number with configurable reference
 * @param {number} freq - Frequency in Hz
 * @param {number} a4 - Reference pitch for A4 (default 440)
 */
export function freqToMidi(freq, a4 = 440) {
  return 69 + 12 * Math.log2(freq / a4);
}

/**
 * Convert MIDI note number to frequency with configurable reference
 */
export function midiToFreq(midi, a4 = 440) {
  return a4 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Calculate cents between two frequencies
 * Result is positive if freq1 > freq2 (sharp)
 */
export function centsBetween(freq1, freq2) {
  return 1200 * Math.log2(freq1 / freq2);
}

/**
 * Convert ratio to cents
 */
export function ratioToCents(ratio) {
  return 1200 * Math.log2(ratio);
}

/**
 * Convert cents to ratio
 */
export function centsToRatio(cents) {
  return Math.pow(2, cents / 1200);
}

/**
 * Get note name from frequency with configurable reference
 */
export function freqToNoteName(freq, a4 = 440) {
  const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const midi = freqToMidi(freq, a4);
  const midiRounded = Math.round(midi);
  const noteIndex = ((midiRounded % 12) + 12) % 12;
  const octave = Math.floor(midiRounded / 12) - 1;
  return `${NOTE_NAMES[noteIndex]}${octave}`;
}

/**
 * Get nearest equal-tempered frequency with configurable reference
 */
export function nearestETFreq(freq, a4 = 440) {
  const midi = freqToMidi(freq, a4);
  const midiRounded = Math.round(midi);
  return midiToFreq(midiRounded, a4);
}

/**
 * Verify: Calculate where 432 Hz appears as a scale degree
 */
export function findF0For432() {
  const results = {};
  for (const [interval, data] of Object.entries(JUST_INTONATION_RATIOS)) {
    if (SHUDDH_SCALE.includes(interval)) {
      results[interval] = {
        svara: data.svara,
        f0: 432 / data.decimal,
        ratio: `${data.ratio[0]}:${data.ratio[1]}`
      };
    }
  }
  return results;
}

// ============================================
// VERIFICATION / SANITY CHECKS
// ============================================

/**
 * Verify our math is correct
 */
export function verifyMath() {
  const checks = [];

  // Check 1: A4 = 440 Hz should give MIDI 69
  const midi440 = freqToMidi(440, 440);
  checks.push({
    test: 'A4 (440 Hz) → MIDI 69',
    expected: 69,
    actual: midi440,
    pass: Math.abs(midi440 - 69) < 0.0001
  });

  // Check 2: MIDI 69 should give 440 Hz
  const hz69 = midiToFreq(69, 440);
  checks.push({
    test: 'MIDI 69 → 440 Hz',
    expected: 440,
    actual: hz69,
    pass: Math.abs(hz69 - 440) < 0.0001
  });

  // Check 3: Octave should be 1200 cents
  const octaveCents = ratioToCents(2);
  checks.push({
    test: 'Octave (2:1) → 1200 cents',
    expected: 1200,
    actual: octaveCents,
    pass: Math.abs(octaveCents - 1200) < 0.0001
  });

  // Check 4: Perfect fifth should be ~702 cents
  const fifthCents = ratioToCents(3/2);
  checks.push({
    test: 'Perfect 5th (3:2) → 701.96 cents',
    expected: 701.96,
    actual: fifthCents,
    pass: Math.abs(fifthCents - 701.96) < 0.01
  });

  // Check 5: Just major 3rd should be ~386 cents
  const thirdCents = ratioToCents(5/4);
  checks.push({
    test: 'Just Major 3rd (5:4) → 386.31 cents',
    expected: 386.31,
    actual: thirdCents,
    pass: Math.abs(thirdCents - 386.31) < 0.01
  });

  // Check 6: ET major 3rd should be 400 cents
  const etThirdCents = ratioToCents(Math.pow(2, 4/12));
  checks.push({
    test: 'ET Major 3rd → 400 cents',
    expected: 400,
    actual: etThirdCents,
    pass: Math.abs(etThirdCents - 400) < 0.0001
  });

  // Check 7: Syntonic comma (difference between Pythagorean and Just 3rd)
  // 81/64 ÷ 5/4 = 81/80 ≈ 21.5 cents
  const syntonicComma = ratioToCents(81/64) - ratioToCents(5/4);
  checks.push({
    test: 'Syntonic comma → 21.51 cents',
    expected: 21.51,
    actual: syntonicComma,
    pass: Math.abs(syntonicComma - 21.51) < 0.01
  });

  // Check 8: 432 Hz with 240 Hz as Sa
  const ratio432over240 = 432 / 240;
  const is432Minor7th = Math.abs(ratio432over240 - (9/5)) < 0.0001;
  checks.push({
    test: '432/240 = 1.8 = 9/5 (minor 7th)',
    expected: 9/5,
    actual: ratio432over240,
    pass: is432Minor7th
  });

  // Check 9: What f0 makes 432 the major 7th (15/8)?
  const f0For432AsMajor7th = 432 / (15/8);
  checks.push({
    test: 'f0 for 432 as Ni (15/8)',
    expected: 230.4,
    actual: f0For432AsMajor7th,
    pass: Math.abs(f0For432AsMajor7th - 230.4) < 0.01
  });

  return checks;
}

export default {
  TUNING_STANDARDS,
  JUST_INTONATION_RATIOS,
  PYTHAGOREAN_RATIOS,
  EQUAL_TEMPERAMENT,
  TUNING_COMPARISON,
  PYTHAGOREAN_COMMA,
  freqToMidi,
  midiToFreq,
  centsBetween,
  ratioToCents,
  centsToRatio,
  freqToNoteName,
  nearestETFreq,
  verifyMath,
  findF0For432
};
