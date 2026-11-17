import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter, Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import Svg, { Circle, Line, Rect, Polyline } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  useReducedMotion,
} from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import {
  space,
  radius,
  hairline,
  type as typography,
  duration,
} from '../theme/tokens';
import { haptic } from '../lib/haptics';

export type BottomTabBarProps = Parameters<
  NonNullable<ComponentProps<typeof Tabs>['tabBar']>
>[0] & {
  navigation?: {
    emit: (event: { type: string; target: string; canPreventDefault?: boolean }) => {
      defaultPrevented: boolean;
    };
    navigate: (name: string, params?: any) => void;
  };
};

interface TabItemProps {
  name: string;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

function TabIcon({ name, color, bgColor }: { name: string; color: string; bgColor: string }) {
  if (name === 'index') {
    // Timer icon: circle with a short hand
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.5} />
        <Line
          x1={12}
          y1={12}
          x2={12}
          y2={7}
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        <Line
          x1={12}
          y1={12}
          x2={15}
          y2={12}
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      </Svg>
    );
  }

  if (name === 'habits') {
    // Habits icon: check inside a thin square
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Rect
          x={4}
          y={4}
          width={16}
          height={16}
          rx={3}
          stroke={color}
          strokeWidth={1.5}
        />
        <Polyline
          points="8 12 11 15 16 9"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  if (name === 'stats') {
    // Stats icon: three vertical bars
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Line
          x1={6.5}
          y1={19}
          x2={6.5}
          y2={13}
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
        />
        <Line
          x1={12}
          y1={19}
          x2={12}
          y2={6}
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
        />
        <Line
          x1={17.5}
          y1={19}
          x2={17.5}
          y2={10}
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </Svg>
    );
  }

  // Settings icon: two horizontal sliders
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Line
        x1={4}
        y1={8}
        x2={20}
        y2={8}
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Circle
        cx={9}
        cy={8}
        r={2.5}
        stroke={color}
        strokeWidth={1.5}
        fill={bgColor}
      />
      <Line
        x1={4}
        y1={16}
        x2={20}
        y2={16}
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Circle
        cx={15}
        cy={16}
        r={2.5}
        stroke={color}
        strokeWidth={1.5}
        fill={bgColor}
      />
    </Svg>
  );
}

function TabItem({ name, isFocused, onPress, onLongPress }: TabItemProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion();

  const indicatorOpacity = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    if (reducedMotion) {
      indicatorOpacity.value = isFocused ? 1 : 0;
    } else {
      indicatorOpacity.value = withTiming(isFocused ? 1 : 0, {
        duration: duration.fast,
      });
    }
  }, [isFocused, reducedMotion]);

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: indicatorOpacity.value,
  }));

  const tabKey = name === 'index' ? 'timer' : name;
  const label = t(`tabs.${tabKey}`);
  const color = isFocused ? colors.accent : colors.textMuted;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={label}
      style={styles.tabButton}
    >
      <Animated.View
        style={[
          styles.indicator,
          { backgroundColor: colors.accent, borderRadius: radius.pill },
          indicatorStyle,
        ]}
      />
      <TabIcon name={name} color={color} bgColor={colors.bg} />
      <Text
        style={[
          typography.caption,
          styles.label,
          { color },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function TabBar({
  state,
  descriptors,
  navigation,
  emitter,
  navigateToTab,
  insets,
}: BottomTabBarProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const safeAreaInsets = useSafeAreaInsets();
  const bottomInset = Math.max(safeAreaInsets.bottom, insets?.bottom ?? 0);

  return (
    <View
      style={[
        styles.barContainer,
        {
          backgroundColor: colors.bg,
          borderTopColor: colors.border,
          borderTopWidth: hairline,
          paddingBottom: bottomInset,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;

        const onPress = () => {
          haptic.select();
          const event = navigation
            ? navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              })
            : emitter?.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

          if (!isFocused && !event?.defaultPrevented) {
            if (navigation) {
              navigation.navigate(route.name, route.params);
            } else if (navigateToTab) {
              navigateToTab(route.key);
            } else {
              router.navigate(route.name as any);
            }
          }
        };

        const onLongPress = () => {
          if (navigation) {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          }
        };

        return (
          <TabItem
            key={route.key}
            name={route.name}
            isFocused={isFocused}
            onPress={onPress}
            onLongPress={onLongPress}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    elevation: 0,
    shadowOpacity: 0,
  },
  tabButton: {
    flex: 1,
    minHeight: 52,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space.half,
  },
  indicator: {
    width: 16,
    height: 2,
    marginBottom: space.half,
  },
  label: {
    fontSize: 10,
    lineHeight: 14,
    marginTop: space.half,
  },
});
