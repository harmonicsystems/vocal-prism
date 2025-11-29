/**
 * Vedic / Indian Classical Framework Analysis
 * c. 200 BCE — The voice-centered tradition
 */

import { CHAKRAS, SAPTAKS, SHRUTIS, RAGA_SHRUTIS } from '../ratios';
import { formatHz } from '../pitchUtils';

/**
 * Determine saptak (octave position)
 */
function getSaptak(f0) {
  const saptak = SAPTAKS.find(s => f0 >= s.min && f0 < s.max) || SAPTAKS[1]; // Default to Madhya
  return {
    ...saptak,
    rangeFormatted: `${saptak.min}–${saptak.max} Hz`
  };
}

/**
 * Get chakra association based on f0
 */
function getChakraAssociation(f0) {
  return CHAKRAS.find(c => f0 < c.max) || CHAKRAS[CHAKRAS.length - 1];
}

/**
 * Generate 22 shruti scale from f0
 */
function generateShrutiScale(f0) {
  return SHRUTIS.map(shruti => ({
    ...shruti,
    hz: f0 * shruti.decimal,
    hzFormatted: formatHz(f0 * shruti.decimal)
  }));
}

/**
 * Full Vedic framework analysis
 */
export function analyzeVedic(f0, scale) {
  const saptak = getSaptak(f0);
  const chakra = getChakraAssociation(f0);
  const shrutiScale = generateShrutiScale(f0);

  return {
    saptak: {
      name: saptak.name,
      description: saptak.description,
      quality: saptak.quality,
      range: saptak.rangeFormatted,
      // Contextual explanation
      context: {
        what: "Saptak means 'containing seven' — it refers to the octave register your voice occupies.",
        why: "In Indian classical music, the register affects the emotional quality. Lower registers are grounding; higher registers are energizing.",
        yourPosition: `Your ${f0} Hz falls within ${saptak.name} (${saptak.rangeFormatted}). This is the ${saptak.description.toLowerCase()}.`
      }
    },
    chakra: {
      name: chakra.name,
      note: chakra.note,
      bija: chakra.bija,
      quality: chakra.quality,
      color: chakra.color,
      // Contextual explanation
      context: {
        what: "Chakras are energy centers in yogic tradition, each associated with specific frequencies and qualities.",
        why: "These associations come from traditional mappings, not medical claims. Think of them as a somatic vocabulary for understanding where your voice resonates.",
        note: "The bija (seed) mantra is a single-syllable sound traditionally chanted at that center."
      }
    },
    floatingSa: {
      concept: "In Indian classical music, Sa is floating—set to the singer's natural voice.",
      meaning: `Your f0 of ${f0} Hz becomes your Sa, and everything else relates to that center.`
    },
    shruti: {
      system: {
        what: "The 22 shruti system divides the octave into 22 microtonal intervals.",
        why: "Western music uses 12 semitones; Indian classical uses 22 shrutis for more nuanced expression.",
        note: "Each svara (note) has 2-4 shruti variants, allowing for subtle ornamental inflections (gamakas)."
      },
      scale: shrutiScale,
      ragas: RAGA_SHRUTIS
    },
    insight: "The 432 Hz myth, debunked: 432 Hz is simply the minor 7th (Komal Ni, 9:5 ratio) when Sa is 240 Hz—a reference chosen because the math is clean. The tradition teaches that YOUR Sa is what matters, not some universal frequency."
  };
}

export default analyzeVedic;
