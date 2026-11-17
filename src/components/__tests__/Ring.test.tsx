import React from 'react';
import { Ring } from '../Ring';
import { renderWithTheme } from '../../test/utils';

describe('Ring component', () => {
  it('renders with progressbar role and matches accessibilityValue.now', async () => {
    const { getByRole } = await renderWithTheme(
      <Ring
        progress={0.45}
        accessibilityLabel="Timer progress 45%"
      />
    );

    const progressBar = getByRole('progressbar', { name: 'Timer progress 45%' });
    expect(progressBar).toBeTruthy();
    expect(progressBar.props.accessibilityValue).toEqual({
      min: 0,
      max: 100,
      now: 45,
    });
  });

  it('clamps progress below 0 to 0', async () => {
    const { getByRole } = await renderWithTheme(
      <Ring
        progress={-0.2}
        accessibilityLabel="Negative progress"
      />
    );

    const progressBar = getByRole('progressbar');
    expect(progressBar.props.accessibilityValue.now).toBe(0);
  });

  it('clamps progress above 1 to 100', async () => {
    const { getByRole } = await renderWithTheme(
      <Ring
        progress={1.5}
        accessibilityLabel="Over 100% progress"
      />
    );

    const progressBar = getByRole('progressbar');
    expect(progressBar.props.accessibilityValue.now).toBe(100);
  });
});
