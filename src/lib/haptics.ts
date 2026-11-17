import * as Haptics from 'expo-haptics';
import { useAppStore } from '../store/useAppStore';

function canTrigger(): boolean {
  try {
    return useAppStore.getState().hapticsEnabled;
  } catch {
    return false;
  }
}

export const haptic = {
  tap: async (): Promise<void> => {
    if (!canTrigger()) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
  },
  press: async (): Promise<void> => {
    if (!canTrigger()) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
  },
  select: async (): Promise<void> => {
    if (!canTrigger()) return;
    try {
      await Haptics.selectionAsync();
    } catch {}
  },
  success: async (): Promise<void> => {
    if (!canTrigger()) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
  },
  warn: async (): Promise<void> => {
    if (!canTrigger()) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {}
  },
};
