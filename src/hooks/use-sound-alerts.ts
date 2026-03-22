import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "sound-alerts-enabled";

/**
 * Hook to manage sound alert preferences
 * Stores preference in localStorage and provides methods to play notification sound
 */
export function useSoundAlerts() {
  const [enabled, setEnabled] = useState(false);

  // Load preference from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setEnabled(stored === "true");
    }
  }, []);

  // Toggle sound alerts and persist preference
  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const newValue = !prev;
      localStorage.setItem(STORAGE_KEY, String(newValue));
      return newValue;
    });
  }, []);

  // Play notification sound using Web Audio API
  const playSound = useCallback(() => {
    if (!enabled) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioContext.currentTime;

      // Create oscillator for notification beep
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc.connect(gain);
      gain.connect(audioContext.destination);

      // Double beep: 800Hz for 150ms, 1000Hz for 150ms
      osc.frequency.value = 800;
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);

      // Second beep
      const osc2 = audioContext.createOscillator();
      osc2.connect(gain);
      osc2.frequency.value = 1000;
      gain.gain.setValueAtTime(0.3, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc2.start(now + 0.2);
      osc2.stop(now + 0.35);
    } catch (error) {
      console.warn("Failed to play notification sound:", error);
    }
  }, [enabled]);

  return {
    enabled,
    toggle,
    playSound,
  };
}
