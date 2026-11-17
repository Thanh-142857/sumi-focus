import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Svg, { Line, Polyline } from 'react-native-svg';
import { useTheme } from '../../src/theme/ThemeProvider';
import {
  space,
  radius,
  hairline,
  type as typography,
} from '../../src/theme/tokens';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { Skeleton } from '../../src/components/Skeleton';
import { EmptyState } from '../../src/components/EmptyState';
import { useAppStore, type Habit } from '../../src/store/useAppStore';
import { computeStreak } from '../../src/lib/streak';
import { dateKey } from '../../src/lib/date';
import { haptic } from '../../src/lib/haptics';

export default function HabitsScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const hydrated = useAppStore((state) => state.hydrated);
  const habits = useAppStore((state) => state.habits);
  const addHabit = useAppStore((state) => state.addHabit);
  const toggleHabitToday = useAppStore((state) => state.toggleHabitToday);
  const removeHabit = useAppStore((state) => state.removeHabit);

  const [inputTitle, setInputTitle] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);

  const today = dateKey();

  const handleAdd = () => {
    const trimmed = inputTitle.trim();
    if (!trimmed || trimmed.length > 40) return;

    haptic.success();
    addHabit(trimmed);
    setInputTitle('');
  };

  const renderHabitItem = ({ item }: { item: Habit }) => {
    const isDoneToday = item.doneDates.includes(today);
    const streak = computeStreak(item.doneDates);

    return (
      <Card padded={true} style={styles.cardItem}>
        {/* 28x28 round check control with 44x44 touch hit area */}
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isDoneToday }}
          accessibilityLabel={
            isDoneToday
              ? t('habits.markUndone', { name: item.name })
              : t('habits.markDone', { name: item.name })
          }
          onPress={() => {
            haptic.tap();
            toggleHabitToday(item.id);
          }}
          style={styles.checkHitArea}
        >
          <View
            style={[
              styles.checkboxCircle,
              {
                borderRadius: radius.pill,
                borderWidth: hairline,
                borderColor: isDoneToday ? colors.accent : colors.border,
                backgroundColor: isDoneToday ? colors.accent : 'transparent',
              },
            ]}
          >
            {isDoneToday ? (
              <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
                <Polyline
                  points="2.5 7.5 5.5 10.5 11.5 3.5"
                  stroke={colors.accentText}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            ) : null}
          </View>
        </Pressable>

        {/* Habit Name & Streak */}
        <View style={styles.habitDetails}>
          <Text
            style={[
              typography.body,
              isDoneToday
                ? [styles.dimmedText, { color: colors.textMuted }]
                : { color: colors.text },
            ]}
            numberOfLines={2}
          >
            {item.name}
          </Text>
          <Text
            style={[
              typography.caption,
              styles.streakText,
              { color: colors.textMuted },
            ]}
          >
            {t('habits.streak', { count: streak })}
          </Text>
        </View>

        {/* 44x44 Delete Control with Small SVG 'x' */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('habits.delete', { name: item.name })}
          onPress={() => {
            haptic.warn();
            removeHabit(item.id);
          }}
          style={styles.deleteHitArea}
        >
          <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
            <Line
              x1={4}
              y1={4}
              x2={12}
              y2={12}
              stroke={colors.textMuted}
              strokeWidth={1.5}
              strokeLinecap="round"
            />
            <Line
              x1={12}
              y1={4}
              x2={4}
              y2={12}
              stroke={colors.textMuted}
              strokeWidth={1.5}
              strokeLinecap="round"
            />
          </Svg>
        </Pressable>
      </Card>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        {/* Screen Header */}
        <View style={styles.header}>
          <Text
            accessibilityRole="header"
            style={[typography.title, { color: colors.text }]}
          >
            {t('habits.title')}
          </Text>
        </View>

        {/* Add Habit Row */}
        <View style={styles.addRow}>
          <TextInput
            value={inputTitle}
            onChangeText={setInputTitle}
            placeholder={t('habits.placeholder')}
            placeholderTextColor={colors.textMuted}
            maxLength={40}
            returnKeyType="done"
            onSubmitEditing={handleAdd}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            style={[
              typography.body,
              styles.input,
              {
                borderRadius: radius.md,
                borderWidth: hairline,
                borderColor: isInputFocused ? colors.glow : colors.border,
                backgroundColor: colors.surface,
                color: colors.text,
              },
            ]}
          />
          <Button
            variant="ghost"
            label={t('habits.add')}
            onPress={handleAdd}
            disabled={!inputTitle.trim()}
            style={styles.addButton}
          />
        </View>

        {/* Content Area */}
        {!hydrated ? (
          <View style={styles.skeletonContainer}>
            <Skeleton width="100%" height={72} radius={radius.lg} />
            <Skeleton
              width="100%"
              height={72}
              radius={radius.lg}
              style={styles.skeletonSpacing}
            />
            <Skeleton
              width="100%"
              height={72}
              radius={radius.lg}
              style={styles.skeletonSpacing}
            />
          </View>
        ) : (
          <FlatList
            data={habits}
            keyExtractor={(item) => item.id}
            renderItem={renderHabitItem}
            ItemSeparatorComponent={() => <View style={{ height: space[1] }} />}
            ListEmptyComponent={
              <EmptyState
                title={t('habits.emptyTitle')}
                body={t('habits.emptyBody')}
              />
            }
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: space[3],
    paddingTop: space[2],
    paddingBottom: space[1],
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space[3],
    paddingVertical: space[2],
    gap: space[1],
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: space[2],
  },
  addButton: {
    height: 48,
    minHeight: 48,
    paddingHorizontal: space[2],
  },
  listContent: {
    paddingHorizontal: space[3],
    paddingTop: space[1],
    paddingBottom: space[7] + space[4],
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkHitArea: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCircle: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitDetails: {
    flex: 1,
    marginHorizontal: space[1],
  },
  dimmedText: {
    opacity: 0.6,
  },
  streakText: {
    marginTop: space.half,
  },
  deleteHitArea: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skeletonContainer: {
    paddingHorizontal: space[3],
    paddingTop: space[1],
  },
  skeletonSpacing: {
    marginTop: space[1],
  },
});
