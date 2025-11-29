/**
 * Mobile Audio Utilities
 * Robust audio context handling for mobile browsers (Chrome, Safari, etc.)
 *
 * Mobile browsers require:
 * 1. AudioContext created/resumed in response to user gesture (click/touch)
 * 2. Some browsers need actual audio playback to fully "unlock"
 * 3. Context can get suspended when tab goes to background
 *
 * This module provides a bulletproof approach that works on all mobile browsers.
 */

let sharedAudioContext = null;
let unlockCount = 0;
let stateListeners = new Set();

// Detect mobile/touch device
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    ('ontouchstart' in window) ||
    (navigator.maxTouchPoints > 0);
};

/**
 * Create the AudioContext if it doesn't exist
 */
function ensureContext() {
  if (!sharedAudioContext) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      console.error('Web Audio API not supported');
      return null;
    }
    sharedAudioContext = new AudioCtx();

    // Listen for state changes
    sharedAudioContext.onstatechange = () => {
      notifyListeners();
    };
  }
  return sharedAudioContext;
}

/**
 * Play a short, audible tone to unlock mobile audio
 * Chrome Mobile specifically requires actual audio output
 */
function playUnlockTone(ctx) {
  return new Promise((resolve) => {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Short but audible - some devices need this
      // Using a very low volume so user barely hears it
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.type = 'sine';
      osc.frequency.value = 440;

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);

      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
        resolve(true);
      };

      // Fallback timeout
      setTimeout(() => resolve(true), 100);
    } catch (e) {
      console.warn('Unlock tone failed:', e);
      resolve(false);
    }
  });
}

/**
 * Resume the AudioContext with retry logic
 */
async function resumeContext(ctx, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    if (ctx.state === 'running') {
      return true;
    }

    try {
      await ctx.resume();
      // Give it a moment to actually transition
      await new Promise(r => setTimeout(r, 50));

      if (ctx.state === 'running') {
        return true;
      }
    } catch (e) {
      console.warn(`Resume attempt ${i + 1} failed:`, e);
    }

    // Wait before retry
    if (i < maxRetries - 1) {
      await new Promise(r => setTimeout(r, 100));
    }
  }

  return ctx.state === 'running';
}

/**
 * Get or create a shared AudioContext
 * Call this from a click/touch handler for best results
 *
 * @returns {Promise<AudioContext|null>}
 */
export async function getAudioContext() {
  const ctx = ensureContext();
  if (!ctx) return null;

  // Always try to resume - context might have been suspended
  if (ctx.state === 'suspended') {
    const resumed = await resumeContext(ctx);

    if (!resumed) {
      console.warn('AudioContext could not be resumed. User interaction may be required.');
      notifyListeners();
      return ctx; // Return it anyway, caller can check state
    }
  }

  // Play unlock tone on mobile (every time to ensure it stays unlocked)
  if (isMobile() && ctx.state === 'running') {
    await playUnlockTone(ctx);
    unlockCount++;
  }

  notifyListeners();
  return ctx;
}

/**
 * Force unlock - call this directly from a user gesture (click/touchend)
 * Returns true if audio is now ready
 */
export async function forceUnlock() {
  const ctx = ensureContext();
  if (!ctx) return false;

  // Resume with retries
  const resumed = await resumeContext(ctx, 5);

  if (resumed) {
    // Always play unlock tone on force unlock
    await playUnlockTone(ctx);
    unlockCount++;
    notifyListeners();
    return true;
  }

  notifyListeners();
  return false;
}

/**
 * Check if audio is ready to play
 */
export function isAudioReady() {
  return sharedAudioContext && sharedAudioContext.state === 'running';
}

/**
 * Get the current audio context state
 */
export function getAudioState() {
  if (!sharedAudioContext) return 'no-context';
  return sharedAudioContext.state;
}

/**
 * Check if we're on a mobile device
 */
export function isMobileDevice() {
  return isMobile();
}

/**
 * Get debug info about audio state
 */
export function getAudioDebugInfo() {
  return {
    hasContext: !!sharedAudioContext,
    state: sharedAudioContext?.state || 'none',
    sampleRate: sharedAudioContext?.sampleRate || 0,
    unlockCount,
    isMobile: isMobile(),
  };
}

/**
 * Subscribe to audio state changes
 */
export function subscribeToAudioState(callback) {
  stateListeners.add(callback);
  return () => stateListeners.delete(callback);
}

/**
 * Notify all listeners of state change
 */
function notifyListeners() {
  const state = getAudioState();
  stateListeners.forEach(cb => {
    try {
      cb(state);
    } catch (e) {
      console.warn('Audio state listener error:', e);
    }
  });
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
    unlockCount = 0;
    notifyListeners();
  }
}

/**
 * Warm up audio system - call early in app lifecycle
 * This creates the context but doesn't try to unlock
 */
export function warmupAudio() {
  ensureContext();
}
