import React, { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { palettes, type Palette, type ThemeMode } from './tokens';
import { useAppStore } from '../store/useAppStore';

interface ThemeContextValue {
  mode: ThemeMode;
  colors: Palette;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'dark',
  colors: palettes.dark,
});

export interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const themePref = useAppStore((state) => state.themePref);
  const systemScheme = useColorScheme();

  const value = useMemo<ThemeContextValue>(() => {
    let mode: ThemeMode;
    if (themePref === 'system') {
      mode = systemScheme === 'light' ? 'light' : 'dark';
    } else {
      mode = themePref;
    }
    return {
      mode,
      colors: palettes[mode],
    };
  }, [themePref, systemScheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
