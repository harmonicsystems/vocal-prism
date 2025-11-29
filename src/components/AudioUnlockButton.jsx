/**
 * AudioUnlockButton Component
 * Shows a tap-to-enable-audio button on mobile devices
 *
 * Mobile browsers require user interaction to enable audio.
 * This component provides clear UI feedback and handles the unlock.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  forceUnlock,
  isAudioReady,
  subscribeToAudioState,
  isMobileDevice,
  getAudioState,
  unlockAudioSync
} from '../utils/mobileAudio';

export default function AudioUnlockButton({ onUnlock, showAlways = false }) {
  const [audioState, setAudioState] = useState(getAudioState());
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Subscribe to audio state changes
  useEffect(() => {
    const unsubscribe = subscribeToAudioState((state) => {
      setAudioState(state);
    });
    return unsubscribe;
  }, []);

  // Determine if we should show the button
  useEffect(() => {
    const shouldShow = !dismissed && (
      showAlways ||
      (isMobileDevice() && !isAudioReady())
    );
    setShowButton(shouldShow);
  }, [audioState, showAlways, dismissed]);

  // Handle unlock - CRITICAL: Must call unlockAudioSync FIRST (synchronously)
  // Safari requires resume() in direct call stack of user gesture
  const handleUnlock = useCallback(() => {
    // CRITICAL: Call sync unlock FIRST, before any async/state updates
    // This must happen in the direct synchronous call stack of the click
    unlockAudioSync();

    setIsUnlocking(true);

    // Now we can do async stuff
    (async () => {
      try {
        const success = await forceUnlock();

        if (success) {
          setShowButton(false);
          onUnlock?.();
        }
      } catch (e) {
        console.error('Audio unlock failed:', e);
      } finally {
        setIsUnlocking(false);
      }
    })();
  }, [onUnlock]);

  // Handle dismiss (user doesn't want audio)
  const handleDismiss = useCallback(() => {
    setDismissed(true);
    setShowButton(false);
  }, []);

  // Don't render if audio is already working
  if (!showButton || isAudioReady()) {
    return null;
  }

  return (
    <AnimatePresence>
      {showButton && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed inset-x-0 bottom-0 z-50 p-4 pointer-events-none"
        >
          <div className="max-w-md mx-auto pointer-events-auto">
            <div className="bg-carbon-900 border border-carbon-700 rounded-xl p-4 shadow-2xl">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-signal-orange/20 flex items-center justify-center">
                    <span className="text-lg">🔊</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-carbon-100">
                      Enable Audio
                    </h3>
                    <p className="text-[10px] text-carbon-500">
                      Required for frequency generators
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDismiss}
                  className="text-carbon-500 hover:text-carbon-300 p-1"
                  aria-label="Dismiss"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Explanation */}
              <p className="text-xs text-carbon-400 mb-4">
                Mobile browsers require a tap to enable audio playback.
                Tap below to unlock the frequency generators.
              </p>

              {/* Unlock Button */}
              <motion.button
                onClick={handleUnlock}
                disabled={isUnlocking}
                className={`
                  w-full py-3 px-4 rounded-lg font-semibold text-sm
                  flex items-center justify-center gap-2
                  transition-all duration-200
                  ${isUnlocking
                    ? 'bg-carbon-700 text-carbon-400 cursor-wait'
                    : 'bg-signal-orange text-carbon-900 hover:bg-signal-orange/90 active:scale-[0.98]'}
                `}
                whileTap={{ scale: 0.98 }}
              >
                {isUnlocking ? (
                  <>
                    <motion.div
                      className="w-4 h-4 border-2 border-carbon-400 border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                    />
                    <span>Enabling...</span>
                  </>
                ) : (
                  <>
                    <span>Tap to Enable Audio</span>
                    <span>🎵</span>
                  </>
                )}
              </motion.button>

              {/* Debug info (in development) */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-2 text-[9px] text-carbon-600 font-mono">
                  State: {audioState} | Mobile: {isMobileDevice() ? 'yes' : 'no'}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Inline version for embedding within mixer components
 */
export function AudioUnlockInline({ onUnlock }) {
  const [audioState, setAudioState] = useState(getAudioState());
  const [isUnlocking, setIsUnlocking] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAudioState(setAudioState);
    return unsubscribe;
  }, []);

  // CRITICAL: Must call unlockAudioSync FIRST (synchronously) for Safari
  const handleUnlock = useCallback(() => {
    // Call sync unlock FIRST in the direct click call stack
    unlockAudioSync();

    setIsUnlocking(true);

    // Now do async stuff
    (async () => {
      try {
        const success = await forceUnlock();
        if (success) {
          onUnlock?.();
        }
      } finally {
        setIsUnlocking(false);
      }
    })();
  }, [onUnlock]);

  // Only show on mobile when audio isn't ready
  if (!isMobileDevice() || isAudioReady()) {
    return null;
  }

  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={handleUnlock}
      disabled={isUnlocking}
      className={`
        w-full py-2.5 px-4 mb-3 rounded-lg text-sm font-medium
        flex items-center justify-center gap-2
        border transition-all
        ${isUnlocking
          ? 'bg-carbon-800 border-carbon-600 text-carbon-400'
          : 'bg-signal-orange/10 border-signal-orange/50 text-signal-orange hover:bg-signal-orange/20'}
      `}
    >
      {isUnlocking ? (
        <>
          <motion.div
            className="w-3 h-3 border-2 border-signal-orange/50 border-t-signal-orange rounded-full"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
          />
          <span>Enabling audio...</span>
        </>
      ) : (
        <>
          <span>🔊</span>
          <span>Tap to enable audio</span>
        </>
      )}
    </motion.button>
  );
}
