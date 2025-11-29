/**
 * Prism Engine
 * The heart of Vocal Prism — takes f0, returns complete analysis
 */

import {
  freqToNoteName,
  freqToNearestStandard,
  centsDifference,
  formatCents,
  formatHz
} from './pitchUtils';

import { JUST_INTONATION, SOLFEGE, DEGREES } from './ratios';

import { analyzePythagorean } from './frameworks/pythagorean';
import { analyzeVedic } from './frameworks/vedic';
import { analyzeGregorian } from './frameworks/gregorian';
import { analyzeWestern } from './frameworks/western';
import { analyzeTibetan } from './frameworks/tibetan';
import { analyzeNeuroscience } from './frameworks/neuroscience';

/**
 * Generate the complete personalized scale from f0
 */
function generateScale(f0) {
  const scale = [];

  for (const [svara, data] of Object.entries(JUST_INTONATION)) {
    const hz = f0 * data.decimal;
    const nearestStd = freqToNearestStandard(hz);
    const cents = centsDifference(hz, nearestStd);

    scale.push({
      degree: DEGREES[svara],
      svara,
      solfege: SOLFEGE[svara],
      hz: Math.round(hz * 100) / 100,
      hzFormatted: formatHz(hz),
      ratio: Array.isArray(data.ratio) ? `${data.ratio[0]}:${data.ratio[1]}` : "1:1",
      ratioDecimal: data.decimal,
      intervalName: data.name,
      nearestPitch: freqToNoteName(hz),
      nearestPitchHz: Math.round(nearestStd * 100) / 100,
      cents: Math.round(cents),
      centsFormatted: formatCents(cents)
    });
  }

  return scale;
}

/**
 * Generate narrative summaries
 */
function generateNarrative(input, frameworks) {
  const { f0, nearestPitch, centsFormatted } = input;
  const { vedic, gregorian, western } = frameworks;

  const short = `${western.vocalCategory.category} voice at ${f0} Hz (${nearestPitch}), ${gregorian.mode.name} mode.`;

  const medium = `At ${f0} Hz, your fundamental frequency aligns nearest to ${nearestPitch} (${centsFormatted} from standard). In the Vedic tradition, this is your Sa—your home note—sitting in ${vedic.saptak.name}. The Gregorian monks would have called this ${gregorian.mode.name}: ${gregorian.mode.character.toLowerCase()}. Your natural key is ${western.keySignature.key}.`;

  return { short, medium };
}

/**
 * Main prism calculation - takes f0, returns complete analysis
 */
export function calculatePrism(f0) {
  // Validate input
  if (typeof f0 !== 'number' || f0 < 50 || f0 > 1000) {
    throw new Error('f0 must be a number between 50 and 1000 Hz');
  }

  // Basic pitch info
  const nearestPitch = freqToNoteName(f0);
  const nearestPitchHz = freqToNearestStandard(f0);
  const cents = centsDifference(f0, nearestPitchHz);

  const input = {
    f0,
    f0Formatted: formatHz(f0),
    nearestPitch,
    nearestPitchHz: Math.round(nearestPitchHz * 100) / 100,
    cents: Math.round(cents),
    centsFormatted: formatCents(cents)
  };

  // Generate scale
  const scale = generateScale(f0);

  // Calculate all frameworks
  const frameworks = {
    pythagorean: analyzePythagorean(f0),
    vedic: analyzeVedic(f0, scale),
    gregorian: analyzeGregorian(f0, nearestPitch),
    western: analyzeWestern(f0, nearestPitch),
    tibetan: analyzeTibetan(f0),
    neuroscience: analyzeNeuroscience(f0)
  };

  // Generate narratives
  const narrative = generateNarrative(input, frameworks);

  return {
    input,
    scale,
    frameworks,
    narrative,
    generated: new Date().toISOString()
  };
}

export { generateScale };
export default calculatePrism;
