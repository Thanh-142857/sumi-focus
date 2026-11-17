import React, { type ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react-native';
import { ThemeProvider } from '../theme/ThemeProvider';
import '../i18n';

export function renderWithTheme(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, {
    wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
    ...options,
  });
}

export * from '@testing-library/react-native';
