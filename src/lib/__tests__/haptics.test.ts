import * as Haptics from 'expo-haptics';
import { haptic } from '../haptics';
import { useAppStore } from '../../store/useAppStore';

describe('haptics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const methods: (keyof typeof haptic)[] = ['tap', 'press', 'select', 'success', 'warn'];

  describe('when hapticsEnabled is true', () => {
    beforeEach(() => {
      useAppStore.setState({ hapticsEnabled: true });
    });

    it('fires impact/notification for every method', async () => {
      await haptic.tap();
      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);

      await haptic.press();
      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Medium);

      await haptic.select();
      expect(Haptics.selectionAsync).toHaveBeenCalledTimes(1);

      await haptic.success();
      expect(Haptics.notificationAsync).toHaveBeenCalledWith(Haptics.NotificationFeedbackType.Success);

      await haptic.warn();
      expect(Haptics.notificationAsync).toHaveBeenCalledWith(Haptics.NotificationFeedbackType.Warning);
    });
  });

  describe('when hapticsEnabled is false', () => {
    beforeEach(() => {
      useAppStore.setState({ hapticsEnabled: false });
    });

    it('is completely silent for every method', async () => {
      for (const m of methods) {
        await haptic[m]();
      }

      expect(Haptics.impactAsync).not.toHaveBeenCalled();
      expect(Haptics.selectionAsync).not.toHaveBeenCalled();
      expect(Haptics.notificationAsync).not.toHaveBeenCalled();
    });
  });
});
