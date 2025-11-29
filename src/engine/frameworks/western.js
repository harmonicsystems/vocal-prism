/**
 * Western Classical Framework Analysis
 * 1600s–Present — The common practice tradition
 */

import { freqToNoteNameOnly, freqToNoteName, formatHz, getNoteAtInterval } from '../pitchUtils';
import { KEY_SIGNATURES, VOCAL_CATEGORIES } from '../ratios';

/**
 * Get key signature information
 */
function getKeySignature(noteName) {
  const baseNote = noteName.replace(/[0-9]/g, '');
  return KEY_SIGNATURES[baseNote] || KEY_SIGNATURES['C'];
}

/**
 * Get vocal range category with proper range display
 */
function getVocalCategory(f0) {
  const category = VOCAL_CATEGORIES.find(v => f0 >= v.min && f0 < v.max) || VOCAL_CATEGORIES[2]; // Default to Tenor/Alto
  return {
    ...category,
    rangeFormatted: `${category.min}–${category.max} Hz`,
    positionInRange: Math.round(((f0 - category.min) / (category.max - category.min)) * 100)
  };
}

/**
 * Full Western framework analysis
 */
export function analyzeWestern(f0, nearestPitch) {
  const noteName = freqToNoteNameOnly(f0);
  const keySig = getKeySignature(noteName);
  const vocal = getVocalCategory(f0);

  const fourthHz = f0 * 4/3;
  const fifthHz = f0 * 3/2;

  return {
    keySignature: {
      key: `${noteName} Major`,
      sharps: keySig.sharps,
      flats: keySig.flats,
      signature: keySig.signature,
      character: keySig.character
    },
    vocalCategory: {
      category: vocal.category,
      range: vocal.rangeFormatted,
      rangeNote: vocal.rangeNote,
      description: vocal.description,
      positionInRange: vocal.positionInRange,
      // Contextual explanation
      context: {
        what: "Vocal categories classify speaking and singing voices by their typical fundamental frequency range.",
        why: "This is your *speaking* voice range, not your singing range. Singers typically have a range of 1.5-2 octaves beyond their speaking fundamental.",
        note: `Your ${f0} Hz is ${vocal.positionInRange}% through the ${vocal.category} range (${vocal.rangeFormatted}).`
      }
    },
    I_IV_V: {
      I: {
        degree: "I",
        role: "Tonic",
        note: noteName,
        hz: f0,
        hzFormatted: formatHz(f0)
      },
      IV: {
        degree: "IV",
        role: "Subdominant",
        note: freqToNoteNameOnly(fourthHz),
        hz: fourthHz,
        hzFormatted: formatHz(fourthHz)
      },
      V: {
        degree: "V",
        role: "Dominant",
        note: freqToNoteNameOnly(fifthHz),
        hz: fifthHz,
        hzFormatted: formatHz(fifthHz)
      }
    },
    a440: {
      concept: "A=440 Hz Standard",
      description: "In 1939, an international conference standardized A4 = 440 Hz for orchestral tuning. This was a bureaucratic compromise—there is nothing cosmically special about 440 Hz."
    },
    equalTemperament: {
      concept: "Equal Temperament",
      description: "Equal temperament makes every key equally usable but equally imperfect. Fifths are 2 cents flat of pure; major thirds are 14 cents sharp."
    },
    insight: `The I-IV-V progression is the harmonic foundation of blues, rock, folk, country, and most popular music. In your key: ${noteName} - ${freqToNoteNameOnly(fourthHz)} - ${freqToNoteNameOnly(fifthHz)}.`
  };
}

export default analyzeWestern;
