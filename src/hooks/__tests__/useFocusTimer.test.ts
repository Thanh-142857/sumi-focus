import { renderHook, act } from '@testing-library/react-native';
import { useFocusTimer } from '../useFocusTimer';
import { useAppStore } from '../../store/useAppStore';

describe('useFocusTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 10, 16, 12, 0, 0));
    useAppStore.setState({
      focusMinutes: 25,
      sessions: [],
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('counts down by wall-clock time', async () => {
    const { result } = await renderHook(() => useFocusTimer());

    expect(result.current.status).toBe('idle');
    expect(result.current.remainingSeconds).toBe(1500);

    await act(async () => {
      result.current.start();
    });

    expect(result.current.status).toBe('running');

    // Advance system time by 10 seconds and advance timers
    await act(async () => {
      jest.advanceTimersByTime(10000);
    });

    expect(result.current.remainingSeconds).toBe(1490);
  });

  it('pause freezes countdown and resume continues', async () => {
    const { result } = await renderHook(() => useFocusTimer());

    await act(async () => {
      result.current.start();
    });

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    expect(result.current.remainingSeconds).toBe(1495);

    await act(async () => {
      result.current.pause();
    });

    expect(result.current.status).toBe('paused');

    // Time passes while paused
    await act(async () => {
      jest.advanceTimersByTime(20000);
    });

    // Still frozen at 1495
    expect(result.current.remainingSeconds).toBe(1495);

    // Resume
    await act(async () => {
      result.current.resume();
    });

    expect(result.current.status).toBe('running');

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    expect(result.current.remainingSeconds).toBe(1490);
  });

  it('completion logs exactly one session on reaching zero', async () => {
    useAppStore.setState({ focusMinutes: 1 });
    const { result } = await renderHook(() => useFocusTimer());

    await act(async () => {
      result.current.start();
    });

    expect(result.current.remainingSeconds).toBe(60);

    // Advance to 60s
    await act(async () => {
      jest.advanceTimersByTime(60000);
    });

    expect(result.current.status).toBe('done');
    expect(result.current.remainingSeconds).toBe(0);
    expect(useAppStore.getState().sessions).toHaveLength(1);
    expect(useAppStore.getState().sessions[0].minutes).toBe(1);

    // Further timer ticks do not duplicate sessions
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    expect(useAppStore.getState().sessions).toHaveLength(1);
  });

  it('changing focusMinutes mid-run does not alter running session', async () => {
    useAppStore.setState({ focusMinutes: 25 });
    const { result } = await renderHook(() => useFocusTimer());

    await act(async () => {
      result.current.start();
    });

    await act(async () => {
      jest.advanceTimersByTime(10000); // 1490 remaining
    });

    expect(result.current.remainingSeconds).toBe(1490);

    // User changes setting to 10 minutes while timer is running
    await act(async () => {
      useAppStore.setState({ focusMinutes: 10 });
    });

    // Running session remains on the original schedule
    expect(result.current.totalSeconds).toBe(1500);
    expect(result.current.remainingSeconds).toBe(1490);

    // Advance 5 more seconds
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    expect(result.current.remainingSeconds).toBe(1485);
  });
});
