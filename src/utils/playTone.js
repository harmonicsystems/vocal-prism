/**
 * Simple tone playback utility
 * For quick audio feedback throughout the app
 */

import { getAudioContext, isAudioReady, unlockAudioSync } from './mobileAudio';

// Active oscillators for cleanup
const activeOscillators = new Map();

/**
 * Play a single tone at a given frequency
 * @param {number} frequency - Frequency in Hz
 * @param {object} options - Playback options
 */
export function playTone(frequency, options = {}) {
  const {
    duration = 0.5,
    type = 'sine',
    volume = 0.3,
    attack = 0.02,
    release = 0.3,
  } = options;

  // Ensure audio is unlocked
  if (!isAudioReady()) {
    unlockAudioSync();
  }

  const ctx = getAudioContext();
  if (!ctx) return null;

  // Create nodes
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.value = frequency;

  // Envelope
  const now = ctx.currentTime;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + attack);
  gain.gain.setValueAtTime(volume, now + duration - release);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  // Connect
  osc.connect(gain);
  gain.connect(ctx.destination);

  // Play
  osc.start(now);
  osc.stop(now + duration);

  // Track for cleanup
  const id = `${frequency}-${Date.now()}`;
  activeOscillators.set(id, { osc, gain });
  osc.onended = () => {
    activeOscillators.delete(id);
    osc.disconnect();
    gain.disconnect();
  };

  return { osc, gain, id };
}

/**
 * Play multiple tones simultaneously (chord)
 * @param {number[]} frequencies - Array of frequencies
 * @param {object} options - Playback options
 */
export function playChord(frequencies, options = {}) {
  const { volume = 0.3, ...rest } = options;
  // Reduce volume per note to prevent clipping
  const perNoteVolume = volume / Math.sqrt(frequencies.length);

  return frequencies.map(freq =>
    playTone(freq, { ...rest, volume: perNoteVolume })
  );
}

/**
 * Play a sequence of tones
 * @param {Array<{freq: number, duration?: number}>} notes - Notes to play
 * @param {object} options - Base options
 */
export function playSequence(notes, options = {}) {
  const { tempo = 120, ...rest } = options;
  const beatDuration = 60 / tempo;

  let delay = 0;
  notes.forEach(note => {
    const noteDuration = note.duration || beatDuration;
    setTimeout(() => {
      playTone(note.freq, { duration: noteDuration * 0.9, ...rest });
    }, delay * 1000);
    delay += noteDuration;
  });
}

/**
 * Play an interval (two notes)
 * @param {number} baseFreq - Base frequency
 * @param {number} ratio - Frequency ratio (e.g., 1.5 for perfect fifth)
 * @param {object} options - Playback options
 */
export function playInterval(baseFreq, ratio, options = {}) {
  const { sequential = false, delay = 0.3, ...rest } = options;

  if (sequential) {
    playTone(baseFreq, rest);
    setTimeout(() => {
      playTone(baseFreq * ratio, rest);
    }, delay * 1000);
  } else {
    playChord([baseFreq, baseFreq * ratio], rest);
  }
}

/**
 * Play the harmonic series from a fundamental
 * @param {number} fundamental - Fundamental frequency
 * @param {number} harmonics - Number of harmonics to play
 * @param {object} options - Playback options
 */
export function playHarmonicSeries(fundamental, harmonics = 8, options = {}) {
  const { sequential = true, delay = 0.3, ...rest } = options;

  const freqs = Array.from({ length: harmonics }, (_, i) => fundamental * (i + 1));

  if (sequential) {
    playSequence(freqs.map(freq => ({ freq, duration: delay })), rest);
  } else {
    // Play all at once with decreasing volume per harmonic
    freqs.forEach((freq, i) => {
      const harmonicVolume = 0.3 / (i + 1); // Natural harmonic decay
      playTone(freq, { ...rest, volume: harmonicVolume });
    });
  }
}

/**
 * Stop all currently playing tones
 */
export function stopAllTones() {
  activeOscillators.forEach(({ osc, gain }) => {
    try {
      const ctx = osc.context;
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      // Already stopped
    }
  });
  activeOscillators.clear();
}
