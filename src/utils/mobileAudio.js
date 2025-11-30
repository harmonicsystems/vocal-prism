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
 * IMPORTANT: This function now kicks off resume() synchronously before any awaits
 * to maintain the user gesture chain on Chrome mobile.
 *
 * @returns {Promise<AudioContext|null>}
 */
export async function getAudioContext() {
  const ctx = ensureContext();
  if (!ctx) return null;

  // CRITICAL: Kick off resume() SYNCHRONOUSLY before any awaits
  // Chrome mobile needs this in the direct gesture call stack
  if (ctx.state === 'suspended') {
    ctx.resume(); // Fire and forget - we'll check state later
  }

  // On mobile, also play unlock tone immediately (while still in gesture)
  if (isMobile() && ctx.state !== 'running') {
    playUnlockToneSync(ctx);
    unlockCount++;
  }

  // Now we can await - give time for resume to complete
  await new Promise(r => setTimeout(r, 100));

  // If still not running, try resume with retries
  if (ctx.state === 'suspended') {
    const resumed = await resumeContext(ctx);

    if (!resumed) {
      console.warn('AudioContext could not be resumed. User interaction may be required.');
      notifyListeners();
      return ctx; // Return it anyway, caller can check state
    }
  }

  notifyListeners();
  return ctx;
}

/**
 * Force unlock - call this directly from a user gesture (click/touchend)
 * Returns true if audio is now ready
 *
 * CRITICAL: On Chrome mobile, we must call resume() and start oscillator
 * SYNCHRONOUSLY in the user gesture call stack. No awaits before that!
 */
export async function forceUnlock() {
  const ctx = ensureContext();
  if (!ctx) return false;

  // CRITICAL: Call resume() IMMEDIATELY (synchronously) - don't await first!
  // Chrome mobile requires this to be in the direct call stack of the user gesture
  if (ctx.state === 'suspended') {
    ctx.resume(); // Don't await - just kick it off
  }

  // ALSO play unlock tone IMMEDIATELY (while still in gesture call stack)
  // This is more reliable than waiting for resume to complete first
  playUnlockToneSync(ctx);
  unlockCount++;

  // NOW we can await for things to settle
  await new Promise(r => setTimeout(r, 100));

  // Check if it worked
  if (ctx.state === 'running') {
    notifyListeners();
    return true;
  }

  // If still not running, try resume with retries
  const resumed = await resumeContext(ctx, 3);
  notifyListeners();
  return resumed;
}

/**
 * Synchronous version of unlock tone - doesn't return a promise
 * Call this immediately in user gesture handler
 */
function playUnlockToneSync(ctx) {
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Slightly louder than before to ensure Chrome registers it
    gain.gain.setValueAtTime(0.02, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

    osc.type = 'sine';
    osc.frequency.value = 440;

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);

    console.log('[MobileAudio] Unlock tone started (sync)');
  } catch (e) {
    console.warn('[MobileAudio] Sync unlock tone failed:', e);
  }
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
 * CRITICAL: Synchronous unlock function for Safari compatibility
 *
 * Safari requires resume() to be called in the DIRECT synchronous call stack
 * of the user gesture. Even calling it inside an async function that gets
 * called from the click handler doesn't work - Safari's gesture tracking
 * doesn't follow through async boundaries.
 *
 * Call this FIRST in any onClick handler, BEFORE any awaits.
 * Returns the AudioContext so you can chain further setup.
 *
 * Usage:
 *   onClick={() => {
 *     const ctx = unlockAudioSync();  // MUST be first, no await before this
 *     // then do async stuff
 *   }}
 */
export function unlockAudioSync() {
  // VERSION MARKER - if you see this, code is updated
  console.log('[MobileAudio] ===== UNLOCK v4 - NUCLEAR =====');

  // On mobile, use the NUCLEAR option - AudioContext from audio element
  if (isMobile()) {
    console.log('[MobileAudio] Mobile detected, using nuclear unlock');

    // Close any existing context
    if (sharedAudioContext) {
      try { sharedAudioContext.close(); } catch (e) {}
      sharedAudioContext = null;
    }

    // NUCLEAR APPROACH: Create Audio element FIRST, then derive AudioContext from it
    // Safari trusts contexts created this way more than standalone AudioContext
    try {
      // Create and play a silent audio element
      const audio = document.createElement('audio');
      audio.setAttribute('playsinline', ''); // iOS requires this
      audio.setAttribute('webkit-playsinline', '');

      // Tiny silent WAV
      audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

      // Play it - this is the key gesture unlock for Safari
      const playPromise = audio.play();
      console.log('[MobileAudio] Audio element play() called');

      if (playPromise) {
        playPromise.then(() => {
          console.log('[MobileAudio] Audio element playing!');
        }).catch(e => {
          console.log('[MobileAudio] Audio element play failed:', e.message);
        });
      }
    } catch (e) {
      console.log('[MobileAudio] Audio element error:', e);
    }

    // NOW create AudioContext - Safari should trust us after audio.play()
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    sharedAudioContext = new AudioCtx();
    console.log('[MobileAudio] Context created, state:', sharedAudioContext.state);

    // Set up state change listener
    sharedAudioContext.onstatechange = () => {
      console.log('[MobileAudio] !!! STATE CHANGED TO:', sharedAudioContext?.state);
      notifyListeners();
    };

    // Resume immediately
    sharedAudioContext.resume().then(() => {
      console.log('[MobileAudio] resume() resolved, state:', sharedAudioContext?.state);
    }).catch(e => {
      console.log('[MobileAudio] resume() rejected:', e);
    });

    // Play oscillator for Chrome
    playUnlockToneSync(sharedAudioContext);

    unlockCount++;
    console.log('[MobileAudio] Unlock attempt complete, state:', sharedAudioContext.state);

    // Check state after delays
    setTimeout(() => console.log('[MobileAudio] 100ms state:', sharedAudioContext?.state), 100);
    setTimeout(() => console.log('[MobileAudio] 500ms state:', sharedAudioContext?.state), 500);

    return sharedAudioContext;
  }

  // Desktop path
  const ctx = ensureContext();
  if (!ctx) return null;
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

/**
 * Warm up audio system - call early in app lifecycle
 * This creates the context but doesn't try to unlock
 *
 * NOTE: On mobile, we skip warmup because creating an AudioContext
 * outside a user gesture can permanently taint it on some Safari versions.
 */
export function warmupAudio() {
  // Skip on mobile - context must be created fresh in user gesture
  if (isMobile()) {
    console.log('[MobileAudio] Skipping warmup on mobile device');
    return;
  }
  ensureContext();
}
// v3 Sat Nov 29 20:05:35 EST 2025
