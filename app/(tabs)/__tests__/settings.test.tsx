import React from 'react';
import { Alert } from 'react-native';
import { fireEvent } from '@testing-library/react-native';
import SettingsScreen from '../settings';
import { renderWithTheme } from '../../../src/test/utils';
import { useAppStore } from '../../../src/store/useAppStore';
import i18n from '../../../src/i18n';

describe('SettingsScreen', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
    useAppStore.setState({
      hydrated: true,
      language: 'en',
      themePref: 'dark',
      focusMinutes: 25,
      hapticsEnabled: true,
      habits: [{ id: '1', name: 'Habit', createdAt: '2026-01-01', doneDates: [] }],
      sessions: [{ id: '1', endedAt: '2026-01-01', minutes: 25 }],
    });
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await i18n.changeLanguage('en');
  });

  it('stepper increments and decrements by 5 within bounds 5..60', async () => {
    const { getByLabelText, findByText, unmount } = await renderWithTheme(<SettingsScreen />);

    const decBtn = getByLabelText(`${i18n.t('settings.focusLength')} -`);
    const incBtn = getByLabelText(`${i18n.t('settings.focusLength')} +`);

    // Decrement from 25 to 20
    fireEvent.press(decBtn);
    expect(useAppStore.getState().focusMinutes).toBe(20);
    expect(await findByText('20m')).toBeTruthy();

    // Increment from 20 to 25
    fireEvent.press(incBtn);
    expect(useAppStore.getState().focusMinutes).toBe(25);
    expect(await findByText('25m')).toBeTruthy();
    await unmount();

    // Test lower bound (5)
    useAppStore.setState({ focusMinutes: 5 });
    const screen5 = await renderWithTheme(<SettingsScreen />);
    fireEvent.press(screen5.getByLabelText(`${i18n.t('settings.focusLength')} -`));
    expect(useAppStore.getState().focusMinutes).toBe(5);
    await screen5.unmount();

    // Test upper bound (60)
    useAppStore.setState({ focusMinutes: 60 });
    const screen60 = await renderWithTheme(<SettingsScreen />);
    fireEvent.press(screen60.getByLabelText(`${i18n.t('settings.focusLength')} +`));
    expect(useAppStore.getState().focusMinutes).toBe(60);
    await screen60.unmount();
  });

  it('toggles haptics switch', async () => {
    const { getByRole } = await renderWithTheme(<SettingsScreen />);

    const switchControl = getByRole('switch');
    expect(switchControl.props.value).toBe(true);

    fireEvent(switchControl, 'valueChange', false);
    expect(useAppStore.getState().hapticsEnabled).toBe(false);
  });

  it('erase flow calls resetAll only after confirming Alert', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    const { getByRole } = await renderWithTheme(<SettingsScreen />);

    const resetButton = getByRole('button', { name: i18n.t('settings.reset') });
    fireEvent.press(resetButton);

    expect(alertSpy).toHaveBeenCalledWith(
      i18n.t('settings.reset'),
      i18n.t('settings.resetConfirm'),
      expect.any(Array)
    );

    // Ensure store is not reset prior to confirming
    expect(useAppStore.getState().habits).toHaveLength(1);

    // Trigger the destructive confirm button callback from the Alert
    const buttons = alertSpy.mock.calls[0][2];
    const confirmButton = buttons?.find((b) => b.style === 'destructive');
    expect(confirmButton).toBeDefined();

    confirmButton?.onPress?.();

    expect(useAppStore.getState().habits).toHaveLength(0);
    expect(useAppStore.getState().sessions).toHaveLength(0);

    alertSpy.mockRestore();
  });

  it('language switch to 日本語 updates store', async () => {
    const { getByRole } = await renderWithTheme(<SettingsScreen />);

    const jaRadio = getByRole('radio', { name: '日本語' });
    fireEvent.press(jaRadio);

    expect(useAppStore.getState().language).toBe('ja');
  });
});
