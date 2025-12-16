import { useCallback, useEffect, useRef, useState } from 'react';

type TapBlinkConfig = {
  enabled: boolean;
  bpm?: number;
};

/**
 * Simple tap blink helper: toggles a boolean at a rate derived from BPM or defaults
 * to ~120 BPM when enabled. Returns the current blink state and a trigger function
 * to restart the pulse on tap.
 */
const useTapBlink = ({ enabled, bpm }: TapBlinkConfig) => {
  const [blinkOn, setBlinkOn] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = () => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  };

  const start = useCallback(
    (nextBpm?: number) => {
      clear();
      if (!enabled) return;
      const interval = Math.max(
        100,
        Math.min(
          2000,
          Math.floor((60_000 / (nextBpm || bpm || 120)) / 2)
        )
      );
      timer.current = setInterval(() => {
        setBlinkOn((prev) => !prev);
      }, interval);
    },
    [bpm, enabled]
  );

  useEffect(() => {
    if (enabled) start();
    return () => clear();
  }, [enabled, start]);

  useEffect(() => {
    if (!enabled) return;
    // Restart when BPM changes to keep blink phase tight to tap tempo.
    start(bpm);
  }, [bpm, enabled, start]);

  return { blinkOn, trigger: start };
};

export default useTapBlink;
