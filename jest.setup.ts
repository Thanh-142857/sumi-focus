import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
}));

// Mock expo-localization
jest.mock('expo-localization', () => ({
  getLocales: () => [{ languageCode: 'en', languageTag: 'en-US' }],
  getCalendars: () => [],
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);

// Mock react-native-worklets
jest.mock('react-native-worklets', () => require('react-native-worklets/src/mock'));

// Workaround for Reanimated 4.7.1 Jest initialization bug where JSReanimated throws on setCSSEventHandler
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { createJSReanimatedModule } = require('react-native-reanimated/src/ReanimatedModule/js-reanimated/JSReanimated');
  if (createJSReanimatedModule) {
    const jsReanimated = createJSReanimatedModule();
    Object.getPrototypeOf(jsReanimated).setCSSEventHandler = () => {};
  }
} catch {
  // ignore
}

// Mock react-native-reanimated
require('react-native-reanimated').setUpTests();
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  return {
    ...Reanimated,
    useReducedMotion: jest.fn(() => false),
  };
});
