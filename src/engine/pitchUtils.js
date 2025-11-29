/**
 * Pitch Utilities
 * Core functions for Hz ↔ MIDI ↔ Note Name conversions
 * Supports configurable reference tuning (A=440, 432, etc.)
 */

import { TUNING_STANDARDS } from './tuning';

// Default reference pitch
let currentTuning = 'A440';
let A4_FREQ = 440;
const A4_MIDI = 69;
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * Set the reference tuning
 * @param {string} tuningId - One of: 'A440', 'A432', 'A415', etc.
 */
export function setTuning(tuningId) {
  if (TUNING_STANDARDS[tuningId]) {
    currentTuning = tuningId;
    A4_FREQ = TUNING_STANDARDS[tuningId].a4;
  }
}

/**
 * Get current tuning info
 */
export function getTuning() {
  return {
    id: currentTuning,
    ...TUNING_STANDARDS[currentTuning]
  };
}

/**
 * Get A4 frequency for a specific tuning
 */
export function getA4(tuningId = null) {
  if (tuningId && TUNING_STANDARDS[tuningId]) {
    return TUNING_STANDARDS[tuningId].a4;
  }
  return A4_FREQ;
}

/**
 * Convert frequency to MIDI note number (continuous, not rounded)
 * A4 = MIDI 69 at the current reference pitch
 * @param {number} freq - Frequency in Hz
 * @param {number} a4 - Optional override for A4 reference
 */
export function freqToMidi(freq, a4 = A4_FREQ) {
  return A4_MIDI + 12 * Math.log2(freq / a4);
}

/**
 * Convert MIDI note number to frequency
 * @param {number} midi - MIDI note number
 * @param {number} a4 - Optional override for A4 reference
 */
export function midiToFreq(midi, a4 = A4_FREQ) {
  return a4 * Math.pow(2, (midi - A4_MIDI) / 12);
}

/**
 * Get note name with octave from frequency
 * e.g., 165 Hz → "E3" (at A=440)
 * @param {number} freq - Frequency in Hz
 * @param {number} a4 - Optional override for A4 reference
 */
export function freqToNoteName(freq, a4 = A4_FREQ) {
  const midi = freqToMidi(freq, a4);
  const midiRounded = Math.round(midi);
  const noteIndex = ((midiRounded % 12) + 12) % 12;
  const octave = Math.floor(midiRounded / 12) - 1;
  return `${NOTE_NAMES[noteIndex]}${octave}`;
}

/**
 * Get just the note name without octave
 * e.g., 165 Hz → "E"
 */
export function freqToNoteNameOnly(freq, a4 = A4_FREQ) {
  const midi = freqToMidi(freq, a4);
  const midiRounded = Math.round(midi);
  const noteIndex = ((midiRounded % 12) + 12) % 12;
  return NOTE_NAMES[noteIndex];
}

/**
 * Get the nearest standard pitch frequency (equal temperament)
 * @param {number} freq - Input frequency
 * @param {number} a4 - Optional override for A4 reference
 */
export function freqToNearestStandard(freq, a4 = A4_FREQ) {
  const midi = freqToMidi(freq, a4);
  const midiRounded = Math.round(midi);
  return midiToFreq(midiRounded, a4);
}

/**
 * Calculate cents difference between two frequencies
 * Positive = freq1 is sharp of freq2
 * Negative = freq1 is flat of freq2
 */
export function centsDifference(freq1, freq2) {
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
 * Format cents as string (e.g., "+2¢", "-14¢", "±0¢")
 */
export function formatCents(cents) {
  const rounded = Math.round(cents);
  if (Math.abs(rounded) < 1) return "±0¢";
  return `${rounded > 0 ? '+' : ''}${rounded}¢`;
}

/**
 * Format Hz with appropriate decimal places
 */
export function formatHz(hz) {
  if (hz >= 1000) return hz.toFixed(0);
  if (hz >= 100) return hz.toFixed(1);
  return hz.toFixed(2);
}

/**
 * Get the note name for interval above f0
 */
export function getNoteAtInterval(f0, ratio, a4 = A4_FREQ) {
  const hz = f0 * ratio;
  return freqToNoteName(hz, a4);
}

/**
 * Compare a frequency across different tuning standards
 * @param {number} freq - Frequency in Hz
 * @returns {Object} Object with note names in each tuning
 */
export function compareAcrossTunings(freq) {
  const results = {};
  for (const [id, tuning] of Object.entries(TUNING_STANDARDS)) {
    const nearest = freqToNearestStandard(freq, tuning.a4);
    const cents = centsDifference(freq, nearest);
    results[id] = {
      name: freqToNoteName(freq, tuning.a4),
      nearestHz: nearest,
      cents: Math.round(cents),
      a4: tuning.a4
    };
  }
  return results;
}

export { NOTE_NAMES, A4_MIDI, TUNING_STANDARDS };
