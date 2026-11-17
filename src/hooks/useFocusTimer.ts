import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { formatClock } from '../lib/date';
import { haptic } from '../lib/haptics';

export type TimerState = 'idle' | 'running' | 'paused' | 'done';

export interface UseFocusTimerResult {
  status: TimerState;
  remainingSeconds: number;
  totalSeconds: number;
  progress: number;
  accessibleRingLabel: string;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
}

export function useFocusTimer(): UseFocusTimerResult {
  const { t } = useTranslation();
  const focusMinutes = useAppStore((state) => state.focusMinutes);
  const logSession = useAppStore((state) => state.logSession);

  const [status, setStatus] = useState<TimerState>('idle');
  const [sessionMinutes, setSessionMinutes] = useState<number>(focusMinutes);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(focusMinutes * 60);

  // Drift-proof reference timestamps (milliseconds)
  const endAtRef = useRef<number | null>(null);

  // Throttled accessibility announcement state
  const [accessibleTime, setAccessibleTime] = useState<string>(() =>
    formatClock(focusMinutes * 60)
  );
  const lastAnnouncedSecsRef = useRef<number>(focusMinutes * 60);

  // Sync remaining display when focusMinutes changes in Settings while idle
  useEffect(() => {
    if (status === 'idle') {
      setSessionMinutes(focusMinutes);
      setRemainingSeconds(focusMinutes * 60);
      setAccessibleTime(formatClock(focusMinutes * 60));
      lastAnnouncedSecsRef.current = focusMinutes * 60;
    }
  }, [focusMinutes, status]);

  // Throttled accessibility label updates: on state change, and every 30s while running
  useEffect(() => {
    setAccessibleTime(formatClock(remainingSeconds));
    lastAnnouncedSecsRef.current = remainingSeconds;
  }, [status]);

  useEffect(() => {
    if (status === 'running') {
      const diff = Math.abs(lastAnnouncedSecsRef.current - remainingSeconds);
      if (diff >= 30 || remainingSeconds === 0) {
        setAccessibleTime(formatClock(remainingSeconds));
        lastAnnouncedSecsRef.current = remainingSeconds;
      }
    }
  }, [remainingSeconds, status]);

  // Main tick and completion handler
  const handleTick = useCallback(() => {
    if (endAtRef.current === null) return;

    const diff = endAtRef.current - Date.now();
    if (diff <= 0) {
      endAtRef.current = null;
      setRemainingSeconds(0);
      setStatus('done');
      haptic.success();
      useAppStore.getState().logSession(sessionMinutes);
    } else {
      const secs = Math.ceil(diff / 1000);
      setRemainingSeconds((prev) => (prev !== secs ? secs : prev));
    }
  }, [sessionMinutes]);

  // 250ms interval loop while running
  useEffect(() => {
    if (status !== 'running') return;

    const intervalId = setInterval(handleTick, 250);
    return () => clearInterval(intervalId);
  }, [status, handleTick]);

  // Drift-proof AppState background/foreground synchronization
  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        if (nextState === 'active' && status === 'running') {
          handleTick();
        }
      }
    );

    return () => subscription.remove();
  }, [status, handleTick]);

  const start = useCallback(() => {
    const totalSecs = focusMinutes * 60;
    setSessionMinutes(focusMinutes);
    setRemainingSeconds(totalSecs);
    endAtRef.current = Date.now() + totalSecs * 1000;
    setStatus('running');
  }, [focusMinutes]);

  const pause = useCallback(() => {
    if (endAtRef.current !== null) {
      const rem = Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000));
      setRemainingSeconds(rem);
      endAtRef.current = null;
    }
    setStatus('paused');
  }, []);

  const resume = useCallback(() => {
    endAtRef.current = Date.now() + remainingSeconds * 1000;
    setStatus('running');
  }, [remainingSeconds]);

  const reset = useCallback(() => {
    endAtRef.current = null;
    setStatus('idle');
    setSessionMinutes(focusMinutes);
    setRemainingSeconds(focusMinutes * 60);
  }, [focusMinutes]);

  const totalSeconds = sessionMinutes * 60;
  const progress =
    status === 'idle'
      ? 0
      : totalSeconds > 0
      ? Math.min(1, Math.max(0, (totalSeconds - remainingSeconds) / totalSeconds))
      : 0;

  const accessibleRingLabel = t('timer.ringLabel', { time: accessibleTime });

  return {
    status,
    remainingSeconds,
    totalSeconds,
    progress,
    accessibleRingLabel,
    start,
    pause,
    resume,
    reset,
  };
}
