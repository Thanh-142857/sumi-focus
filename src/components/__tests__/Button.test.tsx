import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';
import { renderWithTheme } from '../../test/utils';
import { haptic } from '../../lib/haptics';

jest.mock('../../lib/haptics', () => ({
  haptic: {
    press: jest.fn(),
  },
}));

describe('Button component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles onPress and fires haptic.press()', async () => {
    const onPress = jest.fn();
    const { getByRole } = await renderWithTheme(
      <Button label="Start" onPress={onPress} variant="primary" />
    );

    const button = getByRole('button', { name: 'Start' });
    fireEvent.press(button);

    expect(haptic.press).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('blocks press when disabled', async () => {
    const onPress = jest.fn();
    const { getByRole } = await renderWithTheme(
      <Button label="Submit" onPress={onPress} disabled={true} />
    );

    const button = getByRole('button', { name: 'Submit' });
    fireEvent.press(button);

    expect(haptic.press).not.toHaveBeenCalled();
    expect(onPress).not.toHaveBeenCalled();
  });

  it('supports custom accessibilityLabel', async () => {
    const { getByRole, getByLabelText } = await renderWithTheme(
      <Button
        label="Go"
        accessibilityLabel="Custom Go Action"
        onPress={() => {}}
      />
    );

    expect(getByRole('button', { name: 'Custom Go Action' })).toBeTruthy();
    expect(getByLabelText('Custom Go Action')).toBeTruthy();
  });
});
