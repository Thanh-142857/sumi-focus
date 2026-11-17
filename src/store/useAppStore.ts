import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';
import { dateKey } from '../lib/date';

export type Language = 'en' | 'ja';
export type ThemePref = 'system' | 'light' | 'dark';

export interface Habit {
  id: string;
  name: string;
  createdAt: string;
  doneDates: string[];
}

export interface Session {
  id: string;
  endedAt: string;
  minutes: number;
}

export interface AppState {
  hydrated: boolean;
  language: Language;
  themePref: ThemePref;
  focusMinutes: number;
  hapticsEnabled: boolean;
  habits: Habit[];
  sessions: Session[];

  setLanguage: (language: Language) => void;
  setThemePref: (themePref: ThemePref) => void;
  setFocusMinutes: (focusMinutes: number) => void;
  setHapticsEnabled: (hapticsEnabled: boolean) => void;
  addHabit: (name: string) => void;
  toggleHabitToday: (id: string) => void;
  removeHabit: (id: string) => void;
  logSession: (minutes: number) => void;
  resetAll: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      hydrated: false,
      language: (i18n.language?.startsWith('ja') ? 'ja' : 'en') as Language,
      themePref: 'system',
      focusMinutes: 25,
      hapticsEnabled: true,
      habits: [],
      sessions: [],

      setLanguage: (language: Language) => {
        i18n.changeLanguage(language);
        set({ language });
      },

      setThemePref: (themePref: ThemePref) => {
        set({ themePref });
      },

      setFocusMinutes: (focusMinutes: number) => {
        set({ focusMinutes });
      },

      setHapticsEnabled: (hapticsEnabled: boolean) => {
        set({ hapticsEnabled });
      },

      addHabit: (name: string) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        const newHabit: Habit = {
          id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
          name: trimmed,
          createdAt: new Date().toISOString(),
          doneDates: [],
        };
        set((state) => ({ habits: [newHabit, ...state.habits] }));
      },

      toggleHabitToday: (id: string) => {
        const today = dateKey();
        set((state) => ({
          habits: state.habits.map((habit) => {
            if (habit.id !== id) return habit;
            const isDone = habit.doneDates.includes(today);
            return {
              ...habit,
              doneDates: isDone
                ? habit.doneDates.filter((d) => d !== today)
                : [...habit.doneDates, today],
            };
          }),
        }));
      },

      removeHabit: (id: string) => {
        set((state) => ({
          habits: state.habits.filter((habit) => habit.id !== id),
        }));
      },

      logSession: (minutes: number) => {
        const newSession: Session = {
          id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
          endedAt: new Date().toISOString(),
          minutes,
        };
        set((state) => ({
          sessions: [newSession, ...state.sessions],
        }));
      },

      resetAll: () => {
        set({
          habits: [],
          sessions: [],
        });
      },
    }),
    {
      name: 'sumi-focus-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        language: state.language,
        themePref: state.themePref,
        focusMinutes: state.focusMinutes,
        hapticsEnabled: state.hapticsEnabled,
        habits: state.habits,
        sessions: state.sessions,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.language) {
          i18n.changeLanguage(state.language);
        }
        useAppStore.setState({ hydrated: true });
      },
    }
  )
);
