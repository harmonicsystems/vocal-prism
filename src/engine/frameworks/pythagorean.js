/**
 * Pythagorean Framework Analysis
 * 6th Century BCE — The birth of acoustic science
 */

import { freqToNoteNameOnly, formatHz } from '../pitchUtils';
import { CIRCLE_OF_FIFTHS } from '../ratios';

/**
 * Calculate Pythagorean comma
 */
function getPythagoreanComma() {
  const twelveFifths = Math.pow(3/2, 12);
  const sevenOctaves = Math.pow(2, 7);
  const commaCents = 1200 * Math.log2(twelveFifths / sevenOctaves);

  return {
    ratio: "531441:524288",
    cents: Math.round(commaCents * 100) / 100,
    description: "The gap when 12 perfect fifths don't equal 7 octaves"
  };
}

/**
 * Get position in circle of fifths
 */
function getCircleOfFifthsPosition(f0) {
  const noteName = freqToNoteNameOnly(f0);

  // Map enharmonics
  const noteMap = {
    'C#': 'Db', 'D#': 'Eb', 'F#': 'F#', 'G#': 'Ab', 'A#': 'Bb'
  };
  const mappedNote = noteMap[noteName] || noteName;

  const position = CIRCLE_OF_FIFTHS.indexOf(mappedNote);

  // Calculate sharps/flats
  const sharps = ['G', 'D', 'A', 'E', 'B', 'F#', 'C#'];
  const flats = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'];

  let accidentals = 0;
  let accidentalType = 'none';

  if (sharps.includes(noteName) || sharps.includes(mappedNote)) {
    accidentals = sharps.indexOf(noteName) !== -1 ? sharps.indexOf(noteName) + 1 : sharps.indexOf(mappedNote) + 1;
    accidentalType = 'sharps';
  } else if (flats.includes(noteName) || flats.includes(mappedNote)) {
    accidentals = flats.indexOf(noteName) !== -1 ? flats.indexOf(noteName) + 1 : flats.indexOf(mappedNote) + 1;
    accidentalType = 'flats';
  }

  return {
    note: noteName,
    position: position >= 0 ? position : 0,
    accidentals,
    accidentalType
  };
}

/**
 * Full Pythagorean framework analysis
 */
export function analyzePythagorean(f0) {
  const fifth = f0 * 3/2;
  const fourth = f0 * 4/3;
  const octave = f0 * 2;

  return {
    circlePosition: getCircleOfFifthsPosition(f0),
    comma: getPythagoreanComma(),
    intervals: {
      unison: { hz: f0, hzFormatted: formatHz(f0), ratio: "1:1", name: "Unison" },
      fourth: { hz: fourth, hzFormatted: formatHz(fourth), ratio: "4:3", name: "Perfect Fourth" },
      fifth: { hz: fifth, hzFormatted: formatHz(fifth), ratio: "3:2", name: "Perfect Fifth" },
      octave: { hz: octave, hzFormatted: formatHz(octave), ratio: "2:1", name: "Octave" }
    },
    insight: "Pythagoras discovered that simple ratios create consonance. This is physics, not metaphysics—when two frequencies have a simple ratio, their waveforms align regularly, producing stability."
  };
}

export default analyzePythagorean;
