/**
 * AudioUnlockButton Component
 * Shows a tap-to-enable-audio button on mobile devices
 *
 * Uses SYNCHRONOUS unlock for maximum compatibility with mobile browsers
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  forceUnlock,
  isAudioReady,
  subscribeToAudioState,
  isMobileDevice,
  getAudioState,
  getAudioDebugInfo
} from '../utils/mobileAudio';

export default function AudioUnlockButton({ onUnlock, showAlways = false }) {
  const [audioState, setAudioState] = useState(getAudioState());
  const [showButton, setShowButton] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [tapped, setTapped] = useState(false);

  // Subscribe to audio state changes
  useEffect(() => {
    const unsubscribe = subscribeToAudioState((state) => {
      setAudioState(state);
      // Auto-hide when audio starts working
      if (state === 'running') {
        setShowButton(false);
        onUnlock?.();
      }
    });
    return unsubscribe;
  }, [onUnlock]);

  // Determine if we should show the button
  useEffect(() => {
    // Show on mobile when audio isn't ready, or always if showAlways
    const shouldShow = !dismissed && (
      showAlways ||
      (isMobileDevice() && audioState !== 'running')
    );
    setShowButton(shouldShow);
  }, [audioState, showAlways, dismissed]);

  // Handle unlock - MUST be synchronous for mobile browsers
  const handleUnlock = useCallback((e) => {
    // Prevent default to avoid any delays
    e.preventDefault();
    e.stopPropagation();

    setTapped(true);

    // Call forceUnlock synchronously - this is critical!
    const success = forceUnlock();

    // Check result after a short delay
    setTimeout(() => {
      if (isAudioReady()) {
        setShowButton(false);
        onUnlock?.();
      } else {
        // Still not working, but keep trying on next tap
        setTapped(false);
      }
    }, 150);
  }, [onUnlock]);

  // Handle dismiss
  const handleDismiss = useCallback((e) => {
    e.stopPropagation();
    setDismissed(true);
    setShowButton(false);
  }, []);

  // Don't render if not needed
  if (!showButton || audioState === 'running') {
    return null;
  }

  const debugInfo = getAudioDebugInfo();

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
                Your browser requires a tap to enable audio playback.
              </p>

              {/* Unlock Button - using onTouchEnd AND onClick for maximum compatibility */}
              <button
                onTouchEnd={handleUnlock}
                onClick={handleUnlock}
                className={`
                  w-full py-4 px-4 rounded-lg font-semibold text-base
                  flex items-center justify-center gap-2
                  transition-all duration-200
                  ${tapped
                    ? 'bg-carbon-700 text-carbon-400'
                    : 'bg-signal-orange text-carbon-900 hover:bg-signal-orange/90 active:bg-signal-orange/80 active:scale-[0.98]'}
                `}
              >
                {tapped ? (
                  <>
                    <motion.div
                      className="w-5 h-5 border-2 border-carbon-400 border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                    />
                    <span>Enabling audio...</span>
                  </>
                ) : (
                  <>
                    <span>TAP HERE TO ENABLE AUDIO</span>
                    <span>🎵</span>
                  </>
                )}
              </button>

              {/* Debug info (always show for troubleshooting) */}
              <div className="mt-3 text-[9px] text-carbon-600 font-mono text-center">
                State: {audioState} | Attempts: {debugInfo.unlockAttempts} | Mobile: {debugInfo.isMobile ? 'yes' : 'no'}
              </div>
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
  const [tapped, setTapped] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAudioState((state) => {
      setAudioState(state);
      if (state === 'running') {
        onUnlock?.();
      }
    });
    return unsubscribe;
  }, [onUnlock]);

  // Synchronous unlock handler
  const handleUnlock = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    setTapped(true);
    forceUnlock();

    setTimeout(() => {
      if (!isAudioReady()) {
        setTapped(false);
      }
    }, 200);
  }, []);

  // Only show on mobile when audio isn't ready
  if (!isMobileDevice() || audioState === 'running') {
    return null;
  }

  return (
    <button
      onTouchEnd={handleUnlock}
      onClick={handleUnlock}
      className={`
        w-full py-3 px-4 mb-3 rounded-lg text-sm font-medium
        flex items-center justify-center gap-2
        border transition-all
        ${tapped
          ? 'bg-carbon-800 border-carbon-600 text-carbon-400'
          : 'bg-signal-orange/10 border-signal-orange/50 text-signal-orange hover:bg-signal-orange/20 active:bg-signal-orange/30'}
      `}
    >
      {tapped ? (
        <>
          <motion.div
            className="w-4 h-4 border-2 border-signal-orange/50 border-t-signal-orange rounded-full"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
          />
          <span>Enabling audio...</span>
        </>
      ) : (
        <>
          <span>🔊</span>
          <span>TAP TO ENABLE AUDIO</span>
        </>
      )}
    </button>
  );
}
