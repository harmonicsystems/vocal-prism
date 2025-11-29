/**
 * Mobile Audio Utilities - Ultra Simple Edition
 *
 * After much debugging, the solution is: DO LESS, NOT MORE.
 *
 * Key insights:
 * 1. Don't create AudioContext until user actually taps PLAY
 * 2. Create context + resume + play sound ALL in same synchronous handler
 * 3. Don't try to be clever with pre-warming or global listeners
 */

let sharedAudioContext = null;
let unlockCount = 0;

/**
 * Create a fresh AudioContext and unlock it immediately
 * MUST be called directly from a user gesture (click/touch)
 * Returns the running context, or null if it failed
 */
export function createAndUnlockAudioContext() {
  // If we already have a running context, return it
  if (sharedAudioContext && sharedAudioContext.state === 'running') {
    return sharedAudioContext;
  }

  // If we have a suspended context, try to resume it
  if (sharedAudioContext && sharedAudioContext.state === 'suspended') {
    sharedAudioContext.resume();
    playUnlockSound(sharedAudioContext);
    unlockCount++;
    return sharedAudioContext;
  }

  // Create a fresh context
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      console.error('Web Audio API not supported');
      return null;
    }

    sharedAudioContext = new AudioCtx();

    // Immediately resume (required on some browsers)
    sharedAudioContext.resume();

    // Play unlock sound immediately
    playUnlockSound(sharedAudioContext);

    unlockCount++;
    console.log('AudioContext created, state:', sharedAudioContext.state);

    return sharedAudioContext;
  } catch (e) {
    console.error('Failed to create AudioContext:', e);
    return null;
  }
}

/**
 * Play a short sound to fully unlock audio
 * This needs to happen synchronously in the user gesture
 */
function playUnlockSound(ctx) {
  try {
    // Method 1: Silent buffer (works on iOS)
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);

    // Method 2: Very quiet oscillator (works on Android)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    gain.gain.value = 0.001; // Nearly silent
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(0);
    osc.stop(ctx.currentTime + 0.01);
  } catch (e) {
    // Ignore - unlock might still work
  }
}

/**
 * Get the existing context (may be null or suspended)
 */
export function getAudioContext() {
  return sharedAudioContext;
}

/**
 * Check if audio is ready to use
 */
export function isAudioReady() {
  return sharedAudioContext && sharedAudioContext.state === 'running';
}

/**
 * Get current state
 */
export function getAudioState() {
  if (!sharedAudioContext) return 'no-context';
  return sharedAudioContext.state;
}

/**
 * Force unlock - just calls createAndUnlockAudioContext
 */
export function forceUnlock() {
  createAndUnlockAudioContext();
  return isAudioReady();
}

/**
 * Subscribe to state changes (simplified)
 */
const listeners = new Set();

export function subscribeToAudioState(callback) {
  listeners.add(callback);
  // Call immediately with current state
  callback(getAudioState());

  // Set up polling since onstatechange isn't reliable on all browsers
  const interval = setInterval(() => {
    callback(getAudioState());
  }, 500);

  return () => {
    listeners.delete(callback);
    clearInterval(interval);
  };
}

/**
 * Debug info
 */
export function getAudioDebugInfo() {
  return {
    hasContext: !!sharedAudioContext,
    state: getAudioState(),
    unlockCount,
    sampleRate: sharedAudioContext?.sampleRate || 0,
  };
}

/**
 * Check if mobile
 */
export function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    ('ontouchstart' in window) ||
    (navigator.maxTouchPoints > 0);
}

/**
 * Close context
 */
export function closeAudioContext() {
  if (sharedAudioContext) {
    try { sharedAudioContext.close(); } catch (e) {}
    sharedAudioContext = null;
    unlockCount = 0;
  }
}

/**
 * Warmup - simplified, just logs
 */
export function warmupAudio() {
  console.log('Audio warmup called - will create context on first user interaction');
}
