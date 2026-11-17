import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import HabitsScreen from '../habits';
import { renderWithTheme } from '../../../src/test/utils';
import { useAppStore } from '../../../src/store/useAppStore';
import i18n from '../../../src/i18n';

describe('HabitsScreen', () => {
  beforeEach(() => {
    useAppStore.setState({
      hydrated: true,
      language: 'en',
      themePref: 'dark',
      focusMinutes: 25,
      hapticsEnabled: true,
      habits: [],
      sessions: [],
    });
  });

  it('renders empty state when no habits exist', async () => {
    const { getByText } = await renderWithTheme(<HabitsScreen />);
    expect(getByText(i18n.t('habits.emptyTitle'))).toBeTruthy();
    expect(getByText(i18n.t('habits.emptyBody'))).toBeTruthy();
  });

  it('adds a new habit via input and button', async () => {
    const { getByPlaceholderText, findByRole, findByText } = await renderWithTheme(<HabitsScreen />);

    const input = getByPlaceholderText(i18n.t('habits.placeholder'));
    fireEvent.changeText(input, 'Meditation');

    const addButton = await findByRole('button', { name: i18n.t('habits.add') });
    fireEvent.press(addButton);

    expect(useAppStore.getState().habits).toHaveLength(1);
    expect(useAppStore.getState().habits[0].name).toBe('Meditation');
    expect(await findByText('Meditation')).toBeTruthy();
  });

  it('rejects blank or whitespace-only habit input', async () => {
    const { getByPlaceholderText, getByRole } = await renderWithTheme(<HabitsScreen />);

    const input = getByPlaceholderText(i18n.t('habits.placeholder'));
    fireEvent.changeText(input, '   ');

    const addButton = getByRole('button', { name: i18n.t('habits.add') });
    fireEvent.press(addButton);

    expect(useAppStore.getState().habits).toHaveLength(0);
  });

  it('checkbox toggles habit completion with translated accessible name', async () => {
    useAppStore.setState({
      habits: [{ id: 'h1', name: 'Exercise', createdAt: '2026-01-01', doneDates: [] }],
    });

    const { getByRole, findByRole } = await renderWithTheme(<HabitsScreen />);

    // Initially unchecked, accessible name asks to mark done
    const checkLabel = i18n.t('habits.markDone', { name: 'Exercise' });
    const checkbox = getByRole('checkbox', { name: checkLabel });
    expect(checkbox.props.accessibilityState.checked).toBe(false);

    // Press to mark done
    fireEvent.press(checkbox);
    expect(useAppStore.getState().habits[0].doneDates.length).toBe(1);

    // Accessible label updates to mark undone
    const uncheckLabel = i18n.t('habits.markUndone', { name: 'Exercise' });
    const updatedCheckbox = await findByRole('checkbox', { name: uncheckLabel });
    expect(updatedCheckbox.props.accessibilityState.checked).toBe(true);
  });
});
