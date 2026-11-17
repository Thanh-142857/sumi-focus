import type { TextStyle } from 'react-native';

export const space = {
  half: 4,
  1: 8,
  2: 16,
  3: 24,
  4: 32,
  5: 48,
  6: 64,
  7: 96,
} as const;

export const radius = {
  sm: 4,
  md: 8,
  lg: 16,
  pill: 9999,
} as const;

export const hairline = 1;

export const fonts = {
  body: 'NotoSansJP_400Regular',
  bodyMedium: 'NotoSansJP_500Medium',
  bodyBold: 'NotoSansJP_700Bold',
  display: 'SpaceGrotesk_500Medium',
  displayBold: 'SpaceGrotesk_700Bold',
} as const;

export const numeric: TextStyle = {
  fontFamily: fonts.display,
  fontVariant: ['tabular-nums'],
  letterSpacing: 2,
};

export const type = {
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fonts.body,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fonts.body,
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.bodyMedium,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    fontFamily: fonts.bodyBold,
  },
  hero: {
    fontSize: 48,
    lineHeight: 52,
    fontFamily: fonts.displayBold,
  },
} as const satisfies Record<string, TextStyle>;

export const duration = {
  fast: 160,
  base: 280,
  breathe: 5200,
} as const;

export interface Palette {
  bg: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textMuted: string;
  border: string;
  accent: string;
  accentText: string;
  glow: string;
  track: string;
}

export type ThemeMode = 'light' | 'dark';

export const palettes: Record<ThemeMode, Palette> = {
  dark: {
    bg: '#0B0D12',
    surface: '#11141B',
    surfaceAlt: '#171B24',
    text: '#E8EAF0',
    textMuted: '#8A91A0',
    border: 'rgba(255, 255, 255, 0.08)',
    accent: '#E8472F',
    accentText: '#0B0D12',
    glow: '#5CE1E6',
    track: 'rgba(255, 255, 255, 0.07)',
  },
  light: {
    bg: '#F4F1EA',
    surface: '#FAF8F3',
    surfaceAlt: '#ECE8DF',
    text: '#14161C',
    textMuted: '#6B6F78',
    border: 'rgba(11, 13, 18, 0.10)',
    accent: '#D9381E',
    accentText: '#FAF8F3',
    glow: '#0FA3B1',
    track: 'rgba(11, 13, 18, 0.08)',
  },
};
