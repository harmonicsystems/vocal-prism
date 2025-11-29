/**
 * AudioUnlockButton Component
 * BULLETPROOF mobile audio unlock
 *
 * Mobile Safari is EXTREMELY strict about audio unlock:
 * - resume() MUST be called in the DIRECT synchronous call stack of user gesture
 * - NO React synthetic events (they're async)
 * - NO Framer Motion wrappers (they intercept events)
 * - NO awaits before resume()
 *
 * This component uses native DOM events attached directly to bypass React's event system.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  unlockAudioSync,
  isAudioReady,
  subscribeToAudioState,
  isMobileDevice,
  getAudioState,
  getAudioDebugInfo
} from '../utils/mobileAudio';

/**
 * Full-screen overlay for first-time mobile unlock
 * Uses native DOM events to ensure gesture chain is preserved
 */
export default function AudioUnlockButton({ onUnlock }) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const overlayRef = useRef(null);

  // Check if we need to show overlay on mount
  useEffect(() => {
    // Only show on mobile when audio isn't ready
    if (isMobileDevice() && !isAudioReady()) {
      setShowOverlay(true);
    }
  }, []);

  // Subscribe to audio state changes
  useEffect(() => {
    const unsubscribe = subscribeToAudioState((state) => {
      if (state === 'running') {
        setIsUnlocked(true);
        setShowOverlay(false);
      }
    });
    return unsubscribe;
  }, []);

  // Attach NATIVE event listener to bypass React's synthetic event system
  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay || !showOverlay) return;

    const handleNativeClick = (e) => {
      // CRITICAL: This runs in the DIRECT native event call stack
      // No React batching, no async boundaries

      console.log('[AudioUnlock] Native click detected, attempting unlock...');

      // Call unlock IMMEDIATELY - this is the key
      unlockAudioSync();

      // Log debug info
      console.log('[AudioUnlock] Debug:', getAudioDebugInfo());

      // Hide overlay
      setShowOverlay(false);
      setIsUnlocked(true);
      onUnlock?.();

      e.preventDefault();
      e.stopPropagation();
    };

    // Use multiple event types for maximum compatibility
    overlay.addEventListener('click', handleNativeClick, { capture: true });
    overlay.addEventListener('touchend', handleNativeClick, { capture: true, passive: false });

    return () => {
      overlay.removeEventListener('click', handleNativeClick, { capture: true });
      overlay.removeEventListener('touchend', handleNativeClick, { capture: true });
    };
  }, [showOverlay, onUnlock]);

  // Don't render if already unlocked or not on mobile
  if (!showOverlay) {
    return null;
  }

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        cursor: 'pointer',
        touchAction: 'manipulation', // Prevents double-tap zoom
      }}
    >
      {/* Pulsing circle */}
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          backgroundColor: 'rgba(249, 115, 22, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'pulse 2s ease-in-out infinite',
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: '#f97316',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 36,
          }}
        >
          🔊
        </div>
      </div>

      <h2
        style={{
          marginTop: 24,
          color: 'white',
          fontSize: 24,
          fontWeight: 600,
          textAlign: 'center',
        }}
      >
        Tap Anywhere to Enable Audio
      </h2>

      <p
        style={{
          marginTop: 12,
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: 14,
          textAlign: 'center',
          maxWidth: 280,
          lineHeight: 1.5,
        }}
      >
        Mobile browsers require a tap to enable sound playback
      </p>

      {/* CSS animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}

/**
 * Inline unlock button for embedding in components
 * Uses native DOM events for reliable unlock
 */
export function AudioUnlockInline({ onUnlock }) {
  const [isReady, setIsReady] = useState(isAudioReady());
  const buttonRef = useRef(null);

  useEffect(() => {
    const unsubscribe = subscribeToAudioState((state) => {
      setIsReady(state === 'running');
    });
    return unsubscribe;
  }, []);

  // Attach native event listener
  useEffect(() => {
    const button = buttonRef.current;
    if (!button || isReady) return;

    const handleNativeClick = (e) => {
      console.log('[AudioUnlockInline] Native click, unlocking...');
      unlockAudioSync();
      console.log('[AudioUnlockInline] Debug:', getAudioDebugInfo());
      onUnlock?.();
      e.preventDefault();
    };

    button.addEventListener('click', handleNativeClick, { capture: true });
    button.addEventListener('touchend', handleNativeClick, { capture: true, passive: false });

    return () => {
      button.removeEventListener('click', handleNativeClick, { capture: true });
      button.removeEventListener('touchend', handleNativeClick, { capture: true });
    };
  }, [isReady, onUnlock]);

  // Don't show if not mobile or already ready
  if (!isMobileDevice() || isReady) {
    return null;
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      style={{
        width: '100%',
        padding: '12px 16px',
        marginBottom: 12,
        borderRadius: 8,
        border: '1px solid rgba(249, 115, 22, 0.5)',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        color: '#f97316',
        fontSize: 14,
        fontWeight: 500,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        touchAction: 'manipulation',
      }}
    >
      <span>🔊</span>
      <span>Tap to Enable Audio</span>
    </button>
  );
}

/**
 * Hook for components that need audio
 * Returns a function that MUST be called as the FIRST thing in any click handler
 */
export function useAudioUnlock() {
  const [isReady, setIsReady] = useState(isAudioReady());

  useEffect(() => {
    const unsubscribe = subscribeToAudioState((state) => {
      setIsReady(state === 'running');
    });
    return unsubscribe;
  }, []);

  // This function should be called FIRST in any click handler
  const ensureUnlocked = useCallback(() => {
    if (!isReady) {
      unlockAudioSync();
    }
  }, [isReady]);

  return { isReady, ensureUnlocked, unlockAudioSync };
}
