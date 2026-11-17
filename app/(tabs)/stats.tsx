import React, { useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  useWindowDimensions,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  useReducedMotion,
} from 'react-native-reanimated';
import { useTheme } from '../../src/theme/ThemeProvider';
import {
  space,
  radius,
  numeric,
  type as typography,
  duration,
} from '../../src/theme/tokens';
import { Card } from '../../src/components/Card';
import { Skeleton } from '../../src/components/Skeleton';
import { EmptyState } from '../../src/components/EmptyState';
import { useAppStore } from '../../src/store/useAppStore';
import { computeStats, type DayStat } from '../../src/lib/stats';

const LANE_HEIGHT = 128;

interface AnimatedBarProps {
  day: DayStat;
  maxMinutes: number;
  index: number;
}

function AnimatedBar({ day, maxMinutes, index }: AnimatedBarProps) {
  const { colors } = useTheme();
  const reducedMotion = useReducedMotion();

  const targetHeight =
    day.minutes > 0 ? Math.max(2, (day.minutes / maxMinutes) * LANE_HEIGHT) : 0;

  const barHeight = useSharedValue(reducedMotion ? targetHeight : 0);

  useEffect(() => {
    if (reducedMotion) {
      barHeight.value = targetHeight;
    } else {
      barHeight.value = withDelay(
        index * 40,
        withTiming(targetHeight, { duration: duration.base })
      );
    }
  }, [targetHeight, index, reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: barHeight.value,
  }));

  return (
    <View style={styles.barColumn}>
      {/* Background Lane */}
      <View
        style={[
          styles.lane,
          {
            height: LANE_HEIGHT,
            backgroundColor: colors.track,
            borderRadius: radius.pill,
          },
        ]}
      >
        {day.minutes > 0 ? (
          <Animated.View
            style={[
              styles.fillBar,
              {
                backgroundColor: colors.accent,
                borderRadius: radius.pill,
              },
              animatedStyle,
            ]}
          >
            {day.isToday ? (
              <View
                style={[
                  styles.glowCap,
                  {
                    backgroundColor: colors.glow,
                  },
                ]}
              />
            ) : null}
          </Animated.View>
        ) : day.isToday ? (
          // Thin cyan base marker for today if no minutes yet
          <View
            style={[
              styles.todayBaseCap,
              {
                backgroundColor: colors.glow,
              },
            ]}
          />
        ) : null}
      </View>

      {/* Weekday initial */}
      <Text
        style={[
          typography.caption,
          styles.weekdayLabel,
          { color: day.isToday ? colors.text : colors.textMuted },
        ]}
      >
        {day.label}
      </Text>
    </View>
  );
}

export default function StatsScreen() {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();

  const hydrated = useAppStore((state) => state.hydrated);
  const sessions = useAppStore((state) => state.sessions);

  const stats = useMemo(
    () => computeStats(sessions, i18n.language),
    [sessions, i18n.language]
  );

  const maxMinutes = useMemo(() => {
    const maxInWeek = Math.max(0, ...stats.last7.map((d) => d.minutes));
    return maxInWeek > 0 ? maxInWeek : 1;
  }, [stats.last7]);

  const isStacked = width < 360;

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
            {t('stats.title')}
          </Text>
        </View>

        {!hydrated ? (
          /* Loading Skeletons */
          <View style={styles.skeletonContainer}>
            <View style={isStacked ? styles.metricStack : styles.metricRow}>
              <Skeleton width={isStacked ? '100%' : '32%'} height={96} radius={radius.lg} />
              <Skeleton width={isStacked ? '100%' : '32%'} height={96} radius={radius.lg} />
              <Skeleton width={isStacked ? '100%' : '32%'} height={96} radius={radius.lg} />
            </View>
            <Skeleton width="100%" height={220} radius={radius.lg} style={styles.chartSkeleton} />
          </View>
        ) : sessions.length === 0 ? (
          /* Empty State */
          <EmptyState
            title={t('stats.emptyTitle')}
            body={t('stats.emptyBody')}
          />
        ) : (
          <>
            {/* Metric Summary Cards */}
            <View style={isStacked ? styles.metricStack : styles.metricRow}>
              {/* Today Card */}
              <Card style={styles.metricCard}>
                <Text style={[typography.caption, { color: colors.textMuted }]}>
                  {t('stats.today')}
                </Text>
                <Text
                  style={[
                    typography.hero,
                    numeric,
                    styles.metricHero,
                    { color: colors.text },
                  ]}
                >
                  {stats.todayMinutes}
                </Text>
                <Text style={[typography.caption, { color: colors.textMuted }]}>
                  {t('stats.minutes')}
                </Text>
              </Card>

              {/* This Week Card */}
              <Card style={styles.metricCard}>
                <Text style={[typography.caption, { color: colors.textMuted }]}>
                  {t('stats.week')}
                </Text>
                <Text
                  style={[
                    typography.hero,
                    numeric,
                    styles.metricHero,
                    { color: colors.text },
                  ]}
                >
                  {stats.weekMinutes}
                </Text>
                <Text style={[typography.caption, { color: colors.textMuted }]}>
                  {t('stats.minutes')}
                </Text>
              </Card>

              {/* All Time Card */}
              <Card style={styles.metricCard}>
                <Text style={[typography.caption, { color: colors.textMuted }]}>
                  {t('stats.total')}
                </Text>
                <Text
                  style={[
                    typography.hero,
                    numeric,
                    styles.metricHero,
                    { color: colors.text },
                  ]}
                >
                  {stats.totalMinutes}
                </Text>
                <Text style={[typography.caption, { color: colors.textMuted }]}>
                  {t('stats.minutes')}
                </Text>
                <Text
                  style={[
                    typography.caption,
                    styles.sessionsCount,
                    { color: colors.textMuted },
                  ]}
                >
                  {stats.totalSessions} {t('stats.sessions')}
                </Text>
              </Card>
            </View>

            {/* 7-Day Bar Chart */}
            <Card
              style={styles.chartCard}
              accessibilityLabel={`${t('stats.chartLabel')}. ${stats.accessibilitySummary}`}
            >
              <Text
                style={[
                  typography.label,
                  styles.chartTitle,
                  { color: colors.textMuted },
                ]}
              >
                {t('stats.chartLabel')}
              </Text>

              <View
                accessible={true}
                accessibilityRole="summary"
                accessibilityLabel={`${t('stats.chartLabel')}. ${stats.accessibilitySummary}`}
                style={styles.barsContainer}
              >
                {stats.last7.map((day, idx) => (
                  <AnimatedBar
                    key={day.key}
                    day={day}
                    maxMinutes={maxMinutes}
                    index={idx}
                  />
                ))}
              </View>
            </Card>
          </>
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
  chartSkeleton: {
    marginTop: space[2],
  },
  metricRow: {
    flexDirection: 'row',
    gap: space[1],
    marginBottom: space[2],
  },
  metricStack: {
    flexDirection: 'column',
    gap: space[1],
    marginBottom: space[2],
  },
  metricCard: {
    flex: 1,
    padding: space[2],
    alignItems: 'flex-start',
  },
  metricHero: {
    fontSize: 32,
    lineHeight: 36,
    marginVertical: space.half,
  },
  sessionsCount: {
    marginTop: space.half,
  },
  chartCard: {
    padding: space[3],
    marginTop: space[1],
  },
  chartTitle: {
    marginBottom: space[3],
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: space[1],
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    maxWidth: 36,
  },
  lane: {
    width: 14,
    justifyContent: 'flex-end',
    alignItems: 'center',
    overflow: 'hidden',
  },
  fillBar: {
    width: '100%',
    position: 'relative',
  },
  glowCap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  todayBaseCap: {
    width: '100%',
    height: 2,
  },
  weekdayLabel: {
    marginTop: space[1],
    textAlign: 'center',
  },
});
