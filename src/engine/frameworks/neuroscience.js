/**
 * Neuroscience Framework Analysis
 * Modern — Brainwave entrainment and biofeedback
 */

import { BRAINWAVE_STATES } from '../ratios';
import { formatHz } from '../pitchUtils';

/**
 * Get brainwave state from beat frequency
 */
export function getBrainwaveState(beatHz) {
  const absBeat = Math.abs(beatHz);

  if (absBeat < 0.5) return { state: 'Unison', description: 'Perfect stillness, no beating', color: '#666666' };
  if (absBeat < 4) return { ...BRAINWAVE_STATES.delta };
  if (absBeat < 8) return { ...BRAINWAVE_STATES.theta };
  if (absBeat < 12) return { ...BRAINWAVE_STATES.alpha };
  if (absBeat < 30) return { ...BRAINWAVE_STATES.beta };
  return { ...BRAINWAVE_STATES.gamma };
}

/**
 * Generate brainwave target map for given f0
 */
function getBrainwaveMap(f0) {
  return {
    delta: {
      name: 'Delta (δ)',
      beatRange: '0.5-4 Hz',
      singRange: `${formatHz(f0 - 4)} - ${formatHz(f0 + 4)} Hz`,
      state: 'Deep rest, restoration',
      instruction: `Sing within 4 Hz of your ${formatHz(f0)} Hz drone`,
      color: BRAINWAVE_STATES.delta.color
    },
    theta: {
      name: 'Theta (θ)',
      beatRange: '4-8 Hz',
      singRange: `${formatHz(f0 - 8)} - ${formatHz(f0 - 4)} Hz or ${formatHz(f0 + 4)} - ${formatHz(f0 + 8)} Hz`,
      state: 'Creativity, dreams, intuition',
      instruction: 'Sing 4-8 Hz above or below drone',
      color: BRAINWAVE_STATES.theta.color
    },
    alpha: {
      name: 'Alpha (α)',
      beatRange: '8-12 Hz',
      singRange: `${formatHz(f0 - 12)} - ${formatHz(f0 - 8)} Hz or ${formatHz(f0 + 8)} - ${formatHz(f0 + 12)} Hz`,
      state: 'Calm focus, meditation',
      instruction: 'Sing 8-12 Hz above or below drone',
      color: BRAINWAVE_STATES.alpha.color
    },
    beta: {
      name: 'Beta (β)',
      beatRange: '12-30 Hz',
      singRange: `${formatHz(f0 - 30)} - ${formatHz(f0 - 12)} Hz or ${formatHz(f0 + 12)} - ${formatHz(f0 + 30)} Hz`,
      state: 'Active thinking, concentration',
      instruction: 'Sing 12-30 Hz above or below drone',
      color: BRAINWAVE_STATES.beta.color
    },
    gamma: {
      name: 'Gamma (γ)',
      beatRange: '30+ Hz',
      singRange: `Below ${formatHz(f0 - 30)} Hz or above ${formatHz(f0 + 30)} Hz`,
      state: 'Peak performance, insight',
      instruction: 'Sing 30+ Hz from drone',
      color: BRAINWAVE_STATES.gamma.color
    }
  };
}

/**
 * Full neuroscience framework analysis
 */
export function analyzeNeuroscience(f0) {
  return {
    brainwaveMap: getBrainwaveMap(f0),
    entrainment: {
      concept: "Brainwave Entrainment",
      description: "Rhythmic stimuli can influence EEG patterns. This works through beat frequencies—the difference between two tones—not through specific Hz values in isolation.",
      caveat: "'Listening to 432 Hz' doesn't do anything special; creating a 7 Hz beat by singing near a drone does."
    },
    vagalTone: {
      concept: "Vagal Stimulation",
      description: "Humming, chanting, and sustained vocalization stimulate the vagus nerve through vibration in the throat and chest. This activates parasympathetic response—lowering heart rate, reducing cortisol, promoting calm.",
      key: "The specific pitch matters less than the sustained, resonant quality."
    },
    tryThis: {
      title: "Try This",
      steps: [
        `Play your Sa drone (${formatHz(f0)} Hz)`,
        "Hum exactly at the drone pitch—notice the stillness (0 Hz beat)",
        "Slowly slide your pitch up by a few Hz—hear the beating begin",
        "Slide to about 6 Hz above—you're in Theta, the creative zone",
        "Return to unison—feel the settling"
      ]
    },
    insight: "You are the biofeedback instrument. Most binaural beat apps play frequencies AT you. The Vocal Prism shows you how to CREATE them with your voice—more effective because vocalization itself has physiological effects."
  };
}

export default analyzeNeuroscience;
