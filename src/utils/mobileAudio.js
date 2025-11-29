/**
 * Mobile Audio Utilities
 * Robust audio context handling for mobile browsers
 *
 * Mobile browsers (especially Chrome/Safari) require:
 * 1. AudioContext created in response to user gesture
 * 2. resume() called on user gesture
 * 3. Some actual audio played to fully "unlock"
 */

let sharedAudioContext = null;
let isUnlocked = false;

/**
 * Get or create a shared AudioContext
 * Call this from a click/touch handler
 */
export async function getAudioContext() {
  // Create context if needed
  if (!sharedAudioContext) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    sharedAudioContext = new AudioCtx();
  }

  // Always try to resume (in case it got suspended)
  if (sharedAudioContext.state === 'suspended') {
    try {
      await sharedAudioContext.resume();
    } catch (e) {
      console.warn('AudioContext resume failed:', e);
    }
  }

  // Unlock with a short tone if not already unlocked
  if (!isUnlocked && sharedAudioContext.state === 'running') {
    unlockWithTone(sharedAudioContext);
    isUnlocked = true;
  }

  return sharedAudioContext;
}

/**
 * Play a very short, quiet tone to unlock mobile audio
 * This is more reliable than a silent buffer on some devices
 */
function unlockWithTone(ctx) {
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Very quiet, very short
    gain.gain.value = 0.001;
    osc.frequency.value = 440;

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.001);
  } catch (e) {
    console.warn('Unlock tone failed:', e);
  }
}

/**
 * Check if audio is available and working
 */
export function isAudioReady() {
  return sharedAudioContext && sharedAudioContext.state === 'running';
}

/**
 * Force unlock attempt - call from a click handler
 */
export async function forceUnlock() {
  const ctx = await getAudioContext();
  if (ctx && ctx.state === 'running') {
    unlockWithTone(ctx);
    isUnlocked = true;
    return true;
  }
  return false;
}

/**
 * Get the current audio context state for debugging
 */
export function getAudioState() {
  if (!sharedAudioContext) return 'no-context';
  return sharedAudioContext.state;
}

/**
 * Close and reset the audio context
 */
export function closeAudioContext() {
  if (sharedAudioContext) {
    try {
      sharedAudioContext.close();
    } catch (e) {}
    sharedAudioContext = null;
    isUnlocked = false;
  }
}
