import { useAppStore } from '../useAppStore';
import i18n from '../../i18n';
import { dateKey } from '../../lib/date';

describe('useAppStore', () => {
  beforeEach(() => {
    useAppStore.setState({
      hydrated: true,
      language: 'en',
      themePref: 'dark',
      focusMinutes: 45,
      hapticsEnabled: true,
      habits: [],
      sessions: [],
    });
  });

  it('addHabit trims whitespace and ignores empty strings', () => {
    const { addHabit } = useAppStore.getState();

    addHabit('   ');
    expect(useAppStore.getState().habits).toHaveLength(0);

    addHabit('  Morning Meditation  ');
    expect(useAppStore.getState().habits).toHaveLength(1);
    expect(useAppStore.getState().habits[0].name).toBe('Morning Meditation');
    expect(useAppStore.getState().habits[0].doneDates).toEqual([]);
  });

  it('toggleHabitToday toggles today on and off', () => {
    const { addHabit, toggleHabitToday } = useAppStore.getState();
    addHabit('Read Book');

    const habitId = useAppStore.getState().habits[0].id;
    const today = dateKey();

    // Toggle on
    toggleHabitToday(habitId);
    expect(useAppStore.getState().habits[0].doneDates).toContain(today);

    // Toggle off
    toggleHabitToday(habitId);
    expect(useAppStore.getState().habits[0].doneDates).not.toContain(today);
  });

  it('removeHabit deletes the habit', () => {
    const { addHabit, removeHabit } = useAppStore.getState();
    addHabit('Write Code');
    const habitId = useAppStore.getState().habits[0].id;

    removeHabit(habitId);
    expect(useAppStore.getState().habits).toHaveLength(0);
  });

  it('logSession adds a session record with timestamp', () => {
    const { logSession } = useAppStore.getState();
    logSession(30);

    const sessions = useAppStore.getState().sessions;
    expect(sessions).toHaveLength(1);
    expect(sessions[0].minutes).toBe(30);
    expect(sessions[0].endedAt).toBeDefined();
  });

  it('resetAll keeps settings while clearing habits and sessions', () => {
    useAppStore.setState({
      language: 'ja',
      themePref: 'dark',
      focusMinutes: 50,
      hapticsEnabled: false,
      habits: [{ id: '1', name: 'Exercise', createdAt: '2026-01-01', doneDates: [] }],
      sessions: [{ id: '1', endedAt: '2026-01-01', minutes: 25 }],
    });

    useAppStore.getState().resetAll();

    const state = useAppStore.getState();
    // Cleared
    expect(state.habits).toHaveLength(0);
    expect(state.sessions).toHaveLength(0);

    // Settings kept
    expect(state.language).toBe('ja');
    expect(state.themePref).toBe('dark');
    expect(state.focusMinutes).toBe(50);
    expect(state.hapticsEnabled).toBe(false);
  });

  it('setLanguage updates store and calls i18n.changeLanguage', () => {
    const spy = jest.spyOn(i18n, 'changeLanguage');
    useAppStore.getState().setLanguage('ja');

    expect(useAppStore.getState().language).toBe('ja');
    expect(spy).toHaveBeenCalledWith('ja');
    spy.mockRestore();
  });
});
