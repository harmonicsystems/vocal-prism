/**
 * AudioUnlockButton Component
 * Shows a tap-to-enable-audio button on mobile devices
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  createAndUnlockAudioContext,
  isAudioReady,
  subscribeToAudioState,
  isMobileDevice,
  getAudioState,
  getAudioDebugInfo
} from '../utils/mobileAudio';

export default function AudioUnlockButton({ onUnlock }) {
  const [audioState, setAudioState] = useState(getAudioState());
  const [showButton, setShowButton] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [tapping, setTapping] = useState(false);

  // Subscribe to audio state changes
  useEffect(() => {
    const unsubscribe = subscribeToAudioState((state) => {
      setAudioState(state);
      if (state === 'running') {
        setShowButton(false);
      }
    });
    return unsubscribe;
  }, []);

  // Show button on mobile when audio isn't ready
  useEffect(() => {
    const shouldShow = !dismissed && isMobileDevice() && audioState !== 'running';
    setShowButton(shouldShow);
  }, [audioState, dismissed]);

  // Handle tap - create and unlock audio context
  const handleTap = useCallback((e) => {
    e.preventDefault();
    setTapping(true);

    // Create and unlock - this must happen in the tap handler
    const ctx = createAndUnlockAudioContext();

    // Check result
    setTimeout(() => {
      if (isAudioReady()) {
        setShowButton(false);
        onUnlock?.();
      }
      setTapping(false);
    }, 200);
  }, [onUnlock]);

  if (!showButton) return null;

  const debug = getAudioDebugInfo();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed inset-x-0 bottom-0 z-50 p-4"
      >
        <div className="max-w-md mx-auto">
          <div className="bg-carbon-900 border border-carbon-700 rounded-xl p-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-2xl">🔊</div>
              <div>
                <h3 className="text-sm font-bold text-white">Enable Audio</h3>
                <p className="text-xs text-carbon-400">Required for frequency generators</p>
              </div>
              <button
                onClick={() => setDismissed(true)}
                className="ml-auto text-carbon-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <button
              onTouchStart={handleTap}
              onTouchEnd={(e) => e.preventDefault()}
              onClick={handleTap}
              disabled={tapping}
              className={`
                w-full py-4 rounded-lg font-bold text-lg
                transition-all
                ${tapping
                  ? 'bg-carbon-700 text-carbon-400'
                  : 'bg-signal-orange text-black active:scale-95'}
              `}
            >
              {tapping ? 'Enabling...' : 'TAP TO ENABLE AUDIO'}
            </button>

            <div className="mt-2 text-center text-[10px] text-carbon-600 font-mono">
              State: {debug.state} | Unlocks: {debug.unlockCount}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Inline version for embedding in mixers
 */
export function AudioUnlockInline({ onUnlock }) {
  const [audioState, setAudioState] = useState(getAudioState());
  const [tapping, setTapping] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAudioState((state) => {
      setAudioState(state);
      if (state === 'running') {
        onUnlock?.();
      }
    });
    return unsubscribe;
  }, [onUnlock]);

  const handleTap = useCallback((e) => {
    e.preventDefault();
    setTapping(true);
    createAndUnlockAudioContext();
    setTimeout(() => setTapping(false), 200);
  }, []);

  // Only show on mobile when not ready
  if (!isMobileDevice() || audioState === 'running') {
    return null;
  }

  return (
    <button
      onTouchStart={handleTap}
      onTouchEnd={(e) => e.preventDefault()}
      onClick={handleTap}
      className={`
        w-full py-3 mb-3 rounded-lg font-medium
        flex items-center justify-center gap-2
        border transition-all
        ${tapping
          ? 'bg-carbon-800 border-carbon-600 text-carbon-400'
          : 'bg-signal-orange/20 border-signal-orange text-signal-orange active:scale-95'}
      `}
    >
      🔊 {tapping ? 'Enabling...' : 'TAP TO ENABLE AUDIO'}
    </button>
  );
}
