/**
 * Mobile Audio Utilities - Bulletproof Edition
 *
 * The KEY insight: Mobile browsers track user gestures through the SYNCHRONOUS
 * call stack. Once you `await` anything, you lose the gesture context.
 *
 * This implementation:
 * 1. Does all critical work SYNCHRONOUSLY in the gesture handler
 * 2. Uses a global touch/click listener to catch the first interaction
 * 3. Creates a silent buffer (more reliable than oscillator on iOS)
 * 4. Keeps trying on every user interaction until it works
 */

let sharedAudioContext = null;
let isUnlocked = false;
let unlockAttempts = 0;
let stateListeners = new Set();

/**
 * Synchronously create and unlock the AudioContext
 * MUST be called from within a user gesture (click/touch/keydown)
 */
function unlockAudioSync() {
  // Create context if needed
  if (!sharedAudioContext) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      console.error('Web Audio API not supported');
      return false;
    }
    sharedAudioContext = new AudioCtx();
    sharedAudioContext.onstatechange = notifyListeners;
  }

  // If already running, we're good
  if (sharedAudioContext.state === 'running') {
    isUnlocked = true;
    return true;
  }

  // Resume (this returns a promise but we call it synchronously for the gesture)
  sharedAudioContext.resume();

  // Play a silent buffer - this is the most reliable unlock method
  // Works on iOS Safari, Chrome Mobile, Firefox Mobile, etc.
  try {
    const buffer = sharedAudioContext.createBuffer(1, 1, 22050);
    const source = sharedAudioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(sharedAudioContext.destination);
    source.start(0);

    // Also try with an oscillator as backup (some Android devices prefer this)
    const osc = sharedAudioContext.createOscillator();
    const gain = sharedAudioContext.createGain();
    gain.gain.value = 0; // Silent
    osc.connect(gain);
    gain.connect(sharedAudioContext.destination);
    osc.start(0);
    osc.stop(sharedAudioContext.currentTime + 0.001);
  } catch (e) {
    // Ignore errors, the unlock might still work
  }

  unlockAttempts++;

  // Check if it worked (might take a moment)
  setTimeout(() => {
    if (sharedAudioContext && sharedAudioContext.state === 'running') {
      isUnlocked = true;
      notifyListeners();
    }
  }, 100);

  return sharedAudioContext.state === 'running';
}

/**
 * Global unlock handler - catches ANY user interaction
 */
function globalUnlockHandler(e) {
  // Try to unlock
  const success = unlockAudioSync();

  // If unlocked, remove the listeners
  if (isUnlocked || (sharedAudioContext && sharedAudioContext.state === 'running')) {
    isUnlocked = true;
    document.removeEventListener('touchstart', globalUnlockHandler, true);
    document.removeEventListener('touchend', globalUnlockHandler, true);
    document.removeEventListener('click', globalUnlockHandler, true);
    document.removeEventListener('keydown', globalUnlockHandler, true);
    notifyListeners();
  }
}

/**
 * Install global unlock listeners
 * Call this early in your app
 */
export function installGlobalUnlock() {
  // Use capture phase to get the event first
  document.addEventListener('touchstart', globalUnlockHandler, true);
  document.addEventListener('touchend', globalUnlockHandler, true);
  document.addEventListener('click', globalUnlockHandler, true);
  document.addEventListener('keydown', globalUnlockHandler, true);
}

/**
 * Get the shared AudioContext
 * If not unlocked yet, returns the context anyway (caller should check state)
 */
export function getAudioContext() {
  if (!sharedAudioContext) {
    // Create it, but it won't be usable until unlocked
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      sharedAudioContext = new AudioCtx();
      sharedAudioContext.onstatechange = notifyListeners;
    }
  }
  return sharedAudioContext;
}

/**
 * Get the context, trying to unlock it
 * This is async but the unlock attempt is still sync
 */
export async function getAudioContextAsync() {
  const ctx = getAudioContext();
  if (!ctx) return null;

  // If suspended, the caller needs to trigger from a user gesture
  if (ctx.state === 'suspended') {
    // Try resume (might work if we're still in a gesture context)
    ctx.resume();

    // Wait a bit to see if it works
    await new Promise(r => setTimeout(r, 100));
  }

  return ctx;
}

/**
 * Force unlock - call this directly from a click/touch handler
 * Returns true if audio is ready
 */
export function forceUnlock() {
  return unlockAudioSync();
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
 * Get debug info
 */
export function getAudioDebugInfo() {
  return {
    hasContext: !!sharedAudioContext,
    state: sharedAudioContext?.state || 'none',
    sampleRate: sharedAudioContext?.sampleRate || 0,
    isUnlocked,
    unlockAttempts,
    isMobile: isMobileDevice(),
  };
}

/**
 * Check if we're on a mobile/touch device
 */
export function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    ('ontouchstart' in window) ||
    (navigator.maxTouchPoints > 0);
}

/**
 * Subscribe to audio state changes
 */
export function subscribeToAudioState(callback) {
  stateListeners.add(callback);
  // Immediately call with current state
  callback(getAudioState());
  return () => stateListeners.delete(callback);
}

/**
 * Notify all listeners
 */
function notifyListeners() {
  const state = getAudioState();
  stateListeners.forEach(cb => {
    try {
      cb(state);
    } catch (e) {}
  });
}

/**
 * Warm up - creates context and installs global listeners
 */
export function warmupAudio() {
  getAudioContext();
  installGlobalUnlock();
}

/**
 * Close and reset
 */
export function closeAudioContext() {
  if (sharedAudioContext) {
    try { sharedAudioContext.close(); } catch (e) {}
    sharedAudioContext = null;
    isUnlocked = false;
    notifyListeners();
  }
}
