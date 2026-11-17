import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/theme/ThemeProvider';
import {
  space,
  radius,
  numeric,
  type as typography,
} from '../../src/theme/tokens';
import { Button } from '../../src/components/Button';
import { Ring } from '../../src/components/Ring';
import { Skeleton } from '../../src/components/Skeleton';
import { useAppStore } from '../../src/store/useAppStore';
import { useFocusTimer } from '../../src/hooks/useFocusTimer';
import { formatClock } from '../../src/lib/date';

export default function TimerScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const hydrated = useAppStore((state) => state.hydrated);

  const {
    status,
    remainingSeconds,
    progress,
    accessibleRingLabel,
    start,
    pause,
    resume,
    reset,
  } = useFocusTimer();

  const handlePrimaryPress = () => {
    if (status === 'idle') {
      start();
    } else if (status === 'running') {
      pause();
    } else if (status === 'paused') {
      resume();
    } else if (status === 'done') {
      start();
    }
  };

  const getPrimaryLabel = () => {
    switch (status) {
      case 'idle':
        return t('timer.start');
      case 'running':
        return t('timer.pause');
      case 'paused':
        return t('timer.resume');
      case 'done':
        return t('timer.start');
    }
  };

  const getSubtitle = () => {
    if (status === 'idle') {
      return t('timer.idleHint');
    }
    if (status === 'done') {
      return t('timer.completed');
    }
    const minutesLeft = Math.max(1, Math.ceil(remainingSeconds / 60));
    return t('timer.minutesLeft', { count: minutesLeft });
  };

  const isBreathing = status === 'idle' || status === 'running';
  const showReset = status === 'paused' || status === 'done';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      {/* Top Header: Small calm label */}
      <View style={styles.header}>
        <Text
          accessibilityRole="header"
          style={[typography.label, { color: colors.textMuted }]}
        >
          {t('timer.title')}
        </Text>
      </View>

      {/* Main Focus Area with Generous Negative Space */}
      <View style={styles.centerSection}>
        {!hydrated ? (
          <View style={styles.skeletonContainer}>
            <Skeleton width={288} height={288} radius={radius.pill} />
            <Skeleton
              width="100%"
              height={56}
              radius={radius.pill}
              style={styles.skeletonButton}
            />
          </View>
        ) : (
          <>
            <Ring
              size={288}
              progress={progress}
              breathing={isBreathing}
              accessibilityLabel={accessibleRingLabel}
            >
              <View style={styles.ringInnerContent}>
                <Text
                  style={[
                    typography.hero,
                    numeric,
                    styles.timerDigits,
                    { color: colors.text },
                  ]}
                >
                  {formatClock(remainingSeconds)}
                </Text>
                <Text
                  style={[
                    typography.caption,
                    styles.subtitleText,
                    { color: colors.textMuted },
                  ]}
                >
                  {getSubtitle()}
                </Text>
              </View>
            </Ring>

            {/* Action Buttons Below Ring */}
            <View style={styles.actionsContainer}>
              <Button
                variant="primary"
                label={getPrimaryLabel()}
                onPress={handlePrimaryPress}
                style={styles.actionButton}
              />

              {showReset ? (
                <Button
                  variant="ghost"
                  label={t('timer.reset')}
                  onPress={reset}
                  style={[styles.actionButton, styles.resetButton]}
                />
              ) : null}
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: space[3],
    paddingTop: space[2],
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space[3],
  },
  ringInnerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerDigits: {
    textAlign: 'center',
  },
  subtitleText: {
    marginTop: space.half,
    textAlign: 'center',
  },
  actionsContainer: {
    marginTop: space[5],
    width: '100%',
    alignItems: 'center',
  },
  actionButton: {
    width: '100%',
    maxWidth: 320,
  },
  resetButton: {
    marginTop: space[2],
  },
  skeletonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  skeletonButton: {
    maxWidth: 320,
    marginTop: space[5],
  },
});
