/**
 * Gregorian / Medieval Framework Analysis
 * 9th Century CE — Sacred sound in the West
 */

import { freqToNoteNameOnly, formatHz } from '../pitchUtils';
import { MODES } from '../ratios';

/**
 * Get modal character based on nearest pitch
 */
function getModalCharacter(noteName) {
  const baseNote = noteName.replace(/[#b]/g, '');
  return MODES[baseNote] || MODES['C'];
}

/**
 * Full Gregorian framework analysis
 */
export function analyzeGregorian(f0, nearestPitch) {
  const noteName = freqToNoteNameOnly(f0);
  const modal = getModalCharacter(noteName);
  const fifth = f0 * 3/2;
  const fourth = f0 * 4/3;

  return {
    mode: {
      name: modal.mode,
      character: modal.character,
      affect: modal.affect,
      use: modal.use,
      // Contextual explanation
      context: {
        what: "A mode is a specific pattern of whole and half steps. Unlike keys (which share the same pattern at different pitches), modes have different step patterns.",
        why: "Medieval theorists believed each mode had ethical and emotional power—specific effects on the soul. This wasn't superstition; they were observing how different scale patterns create different feelings.",
        how: "Your mode is determined by treating your f0 as the 'final' (home note) of the scale. The intervals above it create the modal character.",
        example: modal.mode.includes('Ionian')
          ? "Ionian (Major) is the 'default' mode we're most familiar with — bright, resolved, complete."
          : modal.mode.includes('Dorian')
          ? "Dorian has a minor third but major sixth — it's serious but not sad, often described as 'balanced.'"
          : modal.mode.includes('Phrygian')
          ? "Phrygian starts with a half step — this gives it an exotic, Spanish, or Middle Eastern quality."
          : modal.mode.includes('Lydian')
          ? "Lydian has a raised fourth — it sounds 'floating' or 'dreamy,' often used in film scores."
          : modal.mode.includes('Mixolydian')
          ? "Mixolydian is major with a flat seventh — it's the sound of rock, blues, and folk music."
          : modal.mode.includes('Aeolian')
          ? "Aeolian (Natural Minor) is the 'sad' mode — used for melancholic or contemplative expression."
          : "Locrian is theoretical — its diminished fifth makes it unstable and rarely used."
      }
    },
    organum: {
      voxPrincipalis: {
        hz: f0,
        hzFormatted: formatHz(f0),
        role: "Main voice (vox principalis)"
      },
      parallelFifth: {
        hz: fifth,
        hzFormatted: formatHz(fifth),
        role: "Parallel fifth above",
        ratio: "3:2"
      },
      parallelFourth: {
        hz: fourth,
        hzFormatted: formatHz(fourth),
        role: "Parallel fourth above",
        ratio: "4:3"
      }
    },
    diabolus: {
      concept: "Diabolus in Musica",
      description: "The tritone (augmented fourth) was called 'the devil in music'—not from superstition, but because it's the most acoustically dissonant interval. Interestingly, Tibetan singing bowls naturally produce this interval."
    },
    ison: {
      concept: "The Ison (Drone)",
      description: "Some chant traditions used a sustained drone under the melody—functionally identical to the Indian tanpura. The technology of drone is cross-cultural."
    },
    insight: "Medieval monks used parallel fourths and fifths because they're the most consonant intervals—the same ratios Pythagoras identified. Sacred music used consonance to create states of contemplation."
  };
}

export default analyzeGregorian;
