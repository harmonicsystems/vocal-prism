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
// Force cache bust by adding comment with timestamp: 2024-11-30-v3
import {
  unlockAudioSync,
  isAudioReady,
  subscribeToAudioState,
  isMobileDevice,
  getAudioState,
  getAudioDebugInfo
} from '../utils/mobileAudio.js';

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
    const mobile = isMobileDevice();
    const ready = isAudioReady();
    console.log('[AudioUnlock] Mount check - isMobile:', mobile, 'isAudioReady:', ready);
    console.log('[AudioUnlock] Audio state:', getAudioState());
    console.log('[AudioUnlock] Debug info:', getAudioDebugInfo());

    // Only show on mobile when audio isn't ready
    if (mobile && !ready) {
      console.log('[AudioUnlock] Showing overlay');
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

    let unlocked = false;

    const handleUnlock = (e) => {
      // Prevent double-firing from touch + click
      if (unlocked) return;
      unlocked = true;

      // CRITICAL: This runs in the DIRECT native event call stack
      // No React batching, no async boundaries
      console.log('[AudioUnlock] Native event detected:', e.type);

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

    // TOUCHSTART is the earliest possible event in the gesture chain
    // Safari is more likely to trust this than touchend
    overlay.addEventListener('touchstart', handleUnlock, { capture: true, passive: false });
    // Fallback for non-touch devices
    overlay.addEventListener('click', handleUnlock, { capture: true });

    return () => {
      overlay.removeEventListener('touchstart', handleUnlock, { capture: true });
      overlay.removeEventListener('click', handleUnlock, { capture: true });
    };
  }, [showOverlay, onUnlock]);

  // Don't render if already unlocked or not on mobile
  if (!showOverlay) {
    return null;
  }

  // Use a BUTTON element - iOS Safari may require interactive element for audio unlock
  return (
    <button
      ref={overlayRef}
      type="button"
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
        touchAction: 'manipulation',
        border: 'none',
        padding: 0,
        margin: 0,
        width: '100%',
        height: '100%',
        outline: 'none',
        WebkitTapHighlightColor: 'transparent',
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
          pointerEvents: 'none',
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
            pointerEvents: 'none',
          }}
        >
          🔊
        </div>
      </div>

      <span
        style={{
          marginTop: 24,
          color: 'white',
          fontSize: 24,
          fontWeight: 600,
          textAlign: 'center',
          pointerEvents: 'none',
        }}
      >
        Tap to Enable Audio
      </span>

      <span
        style={{
          marginTop: 12,
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: 14,
          textAlign: 'center',
          maxWidth: 280,
          lineHeight: 1.5,
          pointerEvents: 'none',
        }}
      >
        Mobile browsers require a tap to enable sound playback
      </span>

      {/* CSS animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
      `}</style>
    </button>
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
