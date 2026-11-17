import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  Alert,
  Pressable,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Constants from 'expo-constants';
import Svg, { Line } from 'react-native-svg';
import { useTheme } from '../../src/theme/ThemeProvider';
import {
  space,
  radius,
  hairline,
  numeric,
  type as typography,
} from '../../src/theme/tokens';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { Skeleton } from '../../src/components/Skeleton';
import { Segmented } from '../../src/components/Segmented';
import { useAppStore, type Language, type ThemePref } from '../../src/store/useAppStore';
import { haptic } from '../../src/lib/haptics';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const hydrated = useAppStore((state) => state.hydrated);
  const language = useAppStore((state) => state.language);
  const themePref = useAppStore((state) => state.themePref);
  const focusMinutes = useAppStore((state) => state.focusMinutes);
  const hapticsEnabled = useAppStore((state) => state.hapticsEnabled);

  const setLanguage = useAppStore((state) => state.setLanguage);
  const setThemePref = useAppStore((state) => state.setThemePref);
  const setFocusMinutes = useAppStore((state) => state.setFocusMinutes);
  const setHapticsEnabled = useAppStore((state) => state.setHapticsEnabled);
  const resetAll = useAppStore((state) => state.resetAll);

  const handleDecrement = () => {
    if (focusMinutes > 5) {
      haptic.tap();
      setFocusMinutes(Math.max(5, focusMinutes - 5));
    }
  };

  const handleIncrement = () => {
    if (focusMinutes < 60) {
      haptic.tap();
      setFocusMinutes(Math.min(60, focusMinutes + 5));
    }
  };

  const handleToggleHaptics = (enabled: boolean) => {
    setHapticsEnabled(enabled);
    if (enabled) {
      haptic.tap();
    }
  };

  const handleResetConfirm = () => {
    Alert.alert(
      t('settings.reset'),
      t('settings.resetConfirm'),
      [
        {
          text: t('settings.cancel'),
          style: 'cancel',
        },
        {
          text: t('settings.confirm'),
          style: 'destructive',
          onPress: () => {
            haptic.warn();
            resetAll();
          },
        },
      ]
    );
  };

  const appName = Constants.expoConfig?.name ?? 'Sumi Focus';
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Screen Header */}
        <View style={styles.header}>
          <Text
            accessibilityRole="header"
            style={[typography.title, { color: colors.text }]}
          >
            {t('settings.title')}
          </Text>
        </View>

        {!hydrated ? (
          /* Loading Skeletons */
          <View style={styles.skeletonContainer}>
            <Skeleton width="100%" height={92} radius={radius.lg} />
            <Skeleton width="100%" height={92} radius={radius.lg} />
            <Skeleton width="100%" height={110} radius={radius.lg} />
            <Skeleton width="100%" height={68} radius={radius.lg} />
            <Skeleton width="100%" height={56} radius={radius.pill} />
          </View>
        ) : (
          <View style={styles.sectionsContainer}>
            {/* Language Setting */}
            <Card style={styles.sectionCard}>
              <Text
                style={[
                  typography.label,
                  styles.sectionLabel,
                  { color: colors.textMuted },
                ]}
              >
                {t('settings.language')}
              </Text>
              <Segmented<Language>
                accessibilityLabel={t('settings.language')}
                value={language}
                onChange={(val) => setLanguage(val)}
                options={[
                  { value: 'en', label: 'English' },
                  { value: 'ja', label: '日本語' },
                ]}
              />
            </Card>

            {/* Theme Setting */}
            <Card style={styles.sectionCard}>
              <Text
                style={[
                  typography.label,
                  styles.sectionLabel,
                  { color: colors.textMuted },
                ]}
              >
                {t('settings.theme')}
              </Text>
              <Segmented<ThemePref>
                accessibilityLabel={t('settings.theme')}
                value={themePref}
                onChange={(val) => setThemePref(val)}
                options={[
                  { value: 'system', label: t('settings.themeSystem') },
                  { value: 'light', label: t('settings.themeLight') },
                  { value: 'dark', label: t('settings.themeDark') },
                ]}
              />
            </Card>

            {/* Focus Duration Setting */}
            <Card style={styles.sectionCard}>
              <Text
                style={[
                  typography.label,
                  styles.sectionLabel,
                  { color: colors.textMuted },
                ]}
              >
                {t('settings.focusLength')}
              </Text>
              <View
                accessible={true}
                accessibilityRole="adjustable"
                accessibilityLabel={t('settings.focusLength')}
                accessibilityValue={{ min: 5, max: 60, now: focusMinutes }}
                accessibilityActions={[
                  { name: 'increment' },
                  { name: 'decrement' },
                ]}
                onAccessibilityAction={(event) => {
                  if (event.nativeEvent.actionName === 'increment') {
                    handleIncrement();
                  } else if (event.nativeEvent.actionName === 'decrement') {
                    handleDecrement();
                  }
                }}
                style={styles.stepperContainer}
              >
                {/* Decrement Button */}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${t('settings.focusLength')} -`}
                  accessibilityState={{ disabled: focusMinutes <= 5 }}
                  disabled={focusMinutes <= 5}
                  onPress={handleDecrement}
                  style={[
                    styles.stepperButton,
                    {
                      borderColor: colors.border,
                      borderWidth: hairline,
                      borderRadius: radius.pill,
                      opacity: focusMinutes <= 5 ? 0.3 : 1,
                    },
                  ]}
                >
                  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    <Line
                      x1={6}
                      y1={12}
                      x2={18}
                      y2={12}
                      stroke={focusMinutes <= 5 ? colors.textMuted : colors.text}
                      strokeWidth={2}
                      strokeLinecap="round"
                    />
                  </Svg>
                </Pressable>

                {/* Duration Value Display */}
                <View style={styles.stepperValueContainer}>
                  <Text
                    style={[
                      typography.hero,
                      numeric,
                      styles.stepperValue,
                      { color: colors.text },
                    ]}
                  >
                    {t('settings.minutesShort', { count: focusMinutes })}
                  </Text>
                </View>

                {/* Increment Button */}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${t('settings.focusLength')} +`}
                  accessibilityState={{ disabled: focusMinutes >= 60 }}
                  disabled={focusMinutes >= 60}
                  onPress={handleIncrement}
                  style={[
                    styles.stepperButton,
                    {
                      borderColor: colors.border,
                      borderWidth: hairline,
                      borderRadius: radius.pill,
                      opacity: focusMinutes >= 60 ? 0.3 : 1,
                    },
                  ]}
                >
                  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    <Line
                      x1={6}
                      y1={12}
                      x2={18}
                      y2={12}
                      stroke={focusMinutes >= 60 ? colors.textMuted : colors.text}
                      strokeWidth={2}
                      strokeLinecap="round"
                    />
                    <Line
                      x1={12}
                      y1={6}
                      x2={12}
                      y2={18}
                      stroke={focusMinutes >= 60 ? colors.textMuted : colors.text}
                      strokeWidth={2}
                      strokeLinecap="round"
                    />
                  </Svg>
                </Pressable>
              </View>
            </Card>

            {/* Haptic Feedback Setting */}
            <Card style={styles.sectionCard}>
              <View style={styles.switchRow}>
                <Text
                  style={[
                    typography.body,
                    { color: colors.text },
                  ]}
                >
                  {t('settings.haptics')}
                </Text>
                <Switch
                  value={hapticsEnabled}
                  onValueChange={handleToggleHaptics}
                  trackColor={{ false: colors.track, true: colors.accent }}
                  thumbColor={colors.accentText}
                  accessibilityRole="switch"
                  accessibilityLabel={t('settings.haptics')}
                  accessibilityState={{ checked: hapticsEnabled }}
                />
              </View>
            </Card>

            {/* Danger Zone: Reset Button */}
            <View style={styles.dangerZone}>
              <Button
                variant="ghost"
                label={t('settings.reset')}
                onPress={handleResetConfirm}
                style={styles.resetButton}
              />
            </View>

            {/* App Version Footer */}
            <View style={styles.footer}>
              <Text
                style={[
                  typography.caption,
                  { color: colors.textMuted },
                ]}
              >
                {appName} v{appVersion}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: space[3],
    paddingTop: space[2],
    paddingBottom: space[7] + space[4],
  },
  header: {
    marginBottom: space[3],
  },
  skeletonContainer: {
    gap: space[2],
  },
  sectionsContainer: {
    gap: space[2],
  },
  sectionCard: {
    padding: space[3],
  },
  sectionLabel: {
    marginBottom: space[2],
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: space[1],
  },
  stepperButton: {
    width: 44,
    height: 44,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValueContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    fontSize: 24,
    lineHeight: 28,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  dangerZone: {
    marginTop: space[3],
  },
  resetButton: {
    width: '100%',
  },
  footer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: space[4],
    paddingVertical: space[2],
  },
});
