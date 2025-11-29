/**
 * Musical Ratios
 * Constants for just intonation, Pythagorean tuning, and interval calculations
 */

// Just Intonation ratios for the major scale
export const JUST_INTONATION = {
  Sa:   { ratio: [1, 1],   decimal: 1.0,     name: "Unison" },
  Re:   { ratio: [9, 8],   decimal: 9/8,     name: "Major Second" },
  Ga:   { ratio: [5, 4],   decimal: 5/4,     name: "Major Third" },
  Ma:   { ratio: [4, 3],   decimal: 4/3,     name: "Perfect Fourth" },
  Pa:   { ratio: [3, 2],   decimal: 3/2,     name: "Perfect Fifth" },
  Dha:  { ratio: [5, 3],   decimal: 5/3,     name: "Major Sixth" },
  Ni:   { ratio: [15, 8],  decimal: 15/8,    name: "Major Seventh" },
  "Sa'": { ratio: [2, 1],  decimal: 2.0,     name: "Octave" }
};

// Solfege mapping
export const SOLFEGE = {
  Sa: "Do",
  Re: "Re",
  Ga: "Mi",
  Ma: "Fa",
  Pa: "So",
  Dha: "La",
  Ni: "Ti",
  "Sa'": "Do'"
};

// Degree numbers
export const DEGREES = {
  Sa: 1,
  Re: 2,
  Ga: 3,
  Ma: 4,
  Pa: 5,
  Dha: 6,
  Ni: 7,
  "Sa'": 8
};

// Pythagorean ratios (built from pure fifths)
export const PYTHAGOREAN = {
  unison: { ratio: [1, 1], decimal: 1 },
  second: { ratio: [9, 8], decimal: 9/8 },
  third: { ratio: [81, 64], decimal: 81/64 },
  fourth: { ratio: [4, 3], decimal: 4/3 },
  fifth: { ratio: [3, 2], decimal: 3/2 },
  sixth: { ratio: [27, 16], decimal: 27/16 },
  seventh: { ratio: [243, 128], decimal: 243/128 },
  octave: { ratio: [2, 1], decimal: 2 }
};

// Circle of fifths order (starting from C)
export const CIRCLE_OF_FIFTHS = [
  'C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'
];

// Key signatures
export const KEY_SIGNATURES = {
  'C':  { sharps: 0, flats: 0, signature: 'No sharps or flats', character: 'Pure, innocent, simple' },
  'G':  { sharps: 1, flats: 0, signature: '1 sharp (F#)', character: 'Bright, rustic, pastoral' },
  'D':  { sharps: 2, flats: 0, signature: '2 sharps (F#, C#)', character: 'Triumphant, joyful' },
  'A':  { sharps: 3, flats: 0, signature: '3 sharps (F#, C#, G#)', character: 'Warm, clear, hopeful' },
  'E':  { sharps: 4, flats: 0, signature: '4 sharps (F#, C#, G#, D#)', character: 'Bright, joyful, heavenly' },
  'B':  { sharps: 5, flats: 0, signature: '5 sharps', character: 'Wild, passionate' },
  'F#': { sharps: 6, flats: 0, signature: '6 sharps', character: 'Brilliant, hard' },
  'C#': { sharps: 7, flats: 0, signature: '7 sharps', character: 'Intense, complex' },
  'F':  { sharps: 0, flats: 1, signature: '1 flat (Bb)', character: 'Pastoral, calm' },
  'Bb': { sharps: 0, flats: 2, signature: '2 flats (Bb, Eb)', character: 'Cheerful, joyous' },
  'Eb': { sharps: 0, flats: 3, signature: '3 flats', character: 'Heroic, bold' },
  'Ab': { sharps: 0, flats: 4, signature: '4 flats', character: 'Soft, gentle' },
  'Db': { sharps: 0, flats: 5, signature: '5 flats', character: 'Warm, rich' },
  'Gb': { sharps: 0, flats: 6, signature: '6 flats', character: 'Mellow, mysterious' }
};

// Gregorian modes
export const MODES = {
  'C': { mode: 'Ionian (Major)', character: 'Simple, direct', affect: 'Clarity, innocence', use: 'Straightforward texts' },
  'D': { mode: 'Dorian', character: 'Serious, balanced', affect: 'Can express any emotion', use: 'Versatile, commonly used' },
  'E': { mode: 'Phrygian', character: 'Mystic, introspective', affect: 'Incites to tears, penitential', use: 'Lenten, penitential chants' },
  'F': { mode: 'Lydian', character: 'Bright, joyful', affect: 'Happiness, modesty', use: 'Celebratory, gentle' },
  'G': { mode: 'Mixolydian', character: 'Uniting, moderate', affect: 'Brings extremes together', use: 'Balanced expression' },
  'A': { mode: 'Aeolian (Natural Minor)', character: 'Melancholic, serious', affect: 'Sadness, contemplation', use: 'Somber texts' },
  'B': { mode: 'Locrian (Theoretical)', character: 'Unstable, tense', affect: 'Rarely used due to diminished fifth', use: 'Theoretical only' }
};

// Chakra associations
export const CHAKRAS = [
  { max: 130, name: "Root (Muladhara)", note: "C", bija: "LAM", quality: "Grounding, stability, security", color: "#E53935" },
  { max: 147, name: "Sacral (Svadhisthana)", note: "D", bija: "VAM", quality: "Creativity, flow, emotion", color: "#FF9800" },
  { max: 165, name: "Solar Plexus (Manipura)", note: "E", bija: "RAM", quality: "Will, confidence, transformation", color: "#FDD835" },
  { max: 175, name: "Heart (Anahata)", note: "F", bija: "YAM", quality: "Connection, compassion, breath", color: "#4CAF50" },
  { max: 196, name: "Throat (Vishuddha)", note: "G", bija: "HAM", quality: "Expression, truth, communication", color: "#2196F3" },
  { max: 220, name: "Third Eye (Ajna)", note: "A", bija: "OM", quality: "Clarity, intuition, insight", color: "#673AB7" },
  { max: Infinity, name: "Crown (Sahasrara)", note: "B", bija: "Silence", quality: "Transcendence, unity, presence", color: "#9C27B0" }
];

// Vocal categories with proper Hz ranges
// Note: These are speaking voice fundamental frequencies, not singing ranges
export const VOCAL_CATEGORIES = [
  { min: 65,  max: 100, category: 'Bass', range: '65-100 Hz (E2-G2)', rangeNote: 'E2-G2', description: 'Lowest male speaking voice' },
  { min: 100, max: 140, category: 'Baritone', range: '100-140 Hz (G2-C#3)', rangeNote: 'G2-C#3', description: 'Most common male speaking voice' },
  { min: 140, max: 180, category: 'Tenor / Low Alto', range: '140-180 Hz (C#3-F#3)', rangeNote: 'C#3-F#3', description: 'Higher male or lower female speaking voice' },
  { min: 180, max: 220, category: 'Alto / Mezzo', range: '180-220 Hz (F#3-A3)', rangeNote: 'F#3-A3', description: 'Middle female speaking voice' },
  { min: 220, max: 280, category: 'Soprano', range: '220-280 Hz (A3-C#4)', rangeNote: 'A3-C#4', description: 'Higher female speaking voice' },
  { min: 280, max: 400, category: 'High Soprano', range: '280-400 Hz (C#4-G4)', rangeNote: 'C#4-G4', description: 'Highest female speaking voice' }
];

// Saptak (octave positions in Indian classical)
// Based on C as the reference, but applied relative to any Sa
export const SAPTAKS = [
  { min: 65,  max: 131, name: "Mandra Saptak", description: "Lower octave", quality: "Grounding, calming, associated with deep rest", range: "65-131 Hz" },
  { min: 131, max: 262, name: "Madhya Saptak", description: "Middle octave", quality: "Balanced, conversational, natural speaking range", range: "131-262 Hz" },
  { min: 262, max: 523, name: "Taar Saptak", description: "Upper octave", quality: "Energizing, expressive, associated with alertness", range: "262-523 Hz" }
];

// 22 Shruti System (Microtonal intervals in Indian classical music)
// Based on the traditional 22 shruti per octave system
// Values are ratios relative to Sa (the tonic)
export const SHRUTIS = [
  // Sa (Unison) - 1 shruti position
  { shruti: 1,  ratio: [1, 1],      decimal: 1.0,       svara: "Sa",         name: "Shadja", cents: 0 },

  // Re region - 4 shruti positions (komal + shuddha variants)
  { shruti: 2,  ratio: [256, 243],  decimal: 256/243,   svara: "Komal Re 1", name: "Ekashruti Rishabha", cents: 90 },
  { shruti: 3,  ratio: [16, 15],    decimal: 16/15,     svara: "Komal Re 2", name: "Dvishruti Rishabha", cents: 112 },
  { shruti: 4,  ratio: [10, 9],     decimal: 10/9,      svara: "Shuddha Re", name: "Trishruti Rishabha", cents: 182 },
  { shruti: 5,  ratio: [9, 8],      decimal: 9/8,       svara: "Re",         name: "Chatushruti Rishabha", cents: 204 },

  // Ga region - 4 shruti positions
  { shruti: 6,  ratio: [32, 27],    decimal: 32/27,     svara: "Komal Ga 1", name: "Ekashruti Gandhara", cents: 294 },
  { shruti: 7,  ratio: [6, 5],      decimal: 6/5,       svara: "Komal Ga 2", name: "Dvishruti Gandhara", cents: 316 },
  { shruti: 8,  ratio: [5, 4],      decimal: 5/4,       svara: "Shuddha Ga", name: "Trishruti Gandhara", cents: 386 },
  { shruti: 9,  ratio: [81, 64],    decimal: 81/64,     svara: "Ga",         name: "Chatushruti Gandhara", cents: 408 },

  // Ma region - 4 shruti positions
  { shruti: 10, ratio: [4, 3],      decimal: 4/3,       svara: "Shuddha Ma", name: "Dvishruti Madhyama", cents: 498 },
  { shruti: 11, ratio: [27, 20],    decimal: 27/20,     svara: "Ma",         name: "Trishruti Madhyama", cents: 520 },
  { shruti: 12, ratio: [45, 32],    decimal: 45/32,     svara: "Tivra Ma 1", name: "Chatushruti Madhyama", cents: 590 },
  { shruti: 13, ratio: [729, 512],  decimal: 729/512,   svara: "Tivra Ma 2", name: "Panchashruti Madhyama", cents: 612 },

  // Pa (Perfect Fifth) - 1 shruti position (always pure)
  { shruti: 14, ratio: [3, 2],      decimal: 3/2,       svara: "Pa",         name: "Panchama", cents: 702 },

  // Dha region - 4 shruti positions
  { shruti: 15, ratio: [128, 81],   decimal: 128/81,    svara: "Komal Dha 1", name: "Ekashruti Dhaivata", cents: 792 },
  { shruti: 16, ratio: [8, 5],      decimal: 8/5,       svara: "Komal Dha 2", name: "Dvishruti Dhaivata", cents: 814 },
  { shruti: 17, ratio: [5, 3],      decimal: 5/3,       svara: "Shuddha Dha", name: "Trishruti Dhaivata", cents: 884 },
  { shruti: 18, ratio: [27, 16],    decimal: 27/16,     svara: "Dha",         name: "Chatushruti Dhaivata", cents: 906 },

  // Ni region - 4 shruti positions
  { shruti: 19, ratio: [16, 9],     decimal: 16/9,      svara: "Komal Ni 1", name: "Ekashruti Nishada", cents: 996 },
  { shruti: 20, ratio: [9, 5],      decimal: 9/5,       svara: "Komal Ni 2", name: "Dvishruti Nishada", cents: 1018 },
  { shruti: 21, ratio: [15, 8],     decimal: 15/8,      svara: "Shuddha Ni", name: "Trishruti Nishada", cents: 1088 },
  { shruti: 22, ratio: [243, 128],  decimal: 243/128,   svara: "Ni",         name: "Chatushruti Nishada", cents: 1110 },

  // Sa' (Octave)
  { shruti: 23, ratio: [2, 1],      decimal: 2.0,       svara: "Sa'",        name: "Octave", cents: 1200 }
];

// Common raga patterns using shruti positions
export const RAGA_SHRUTIS = {
  bilawal: { name: "Bilawal", shrutis: [1, 5, 8, 10, 14, 17, 21, 23], description: "Major scale equivalent" },
  kafi: { name: "Kafi", shrutis: [1, 5, 7, 10, 14, 17, 20, 23], description: "Dorian-like scale" },
  bhairav: { name: "Bhairav", shrutis: [1, 3, 8, 10, 14, 16, 21, 23], description: "Morning raga with flat 2nd and 6th" },
  yaman: { name: "Yaman", shrutis: [1, 5, 8, 12, 14, 17, 21, 23], description: "Evening raga with sharp 4th" },
  todi: { name: "Todi", shrutis: [1, 3, 7, 12, 14, 16, 21, 23], description: "Complex raga with multiple komal notes" }
};

// Brainwave states
export const BRAINWAVE_STATES = {
  delta: { range: [0.5, 4], state: 'Delta (δ)', description: 'Deep rest, restoration, unconscious processing', color: '#2D3A4A' },
  theta: { range: [4, 8], state: 'Theta (θ)', description: 'Deep relaxation, creativity, intuition, light dreams', color: '#5B4B8A' },
  alpha: { range: [8, 12], state: 'Alpha (α)', description: 'Calm wakefulness, meditation, visualization', color: '#4A7B5B' },
  beta: { range: [12, 30], state: 'Beta (β)', description: 'Alert focus, active thinking, concentration', color: '#B8863B' },
  gamma: { range: [30, 100], state: 'Gamma (γ)', description: 'Peak performance, insight, heightened perception', color: '#A84A4A' }
};
