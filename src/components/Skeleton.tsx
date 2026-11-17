import React, { useEffect } from 'react';
import { type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  useReducedMotion,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { radius as tokenRadius } from '../theme/tokens';

export interface SkeletonProps {
  width: DimensionValue;
  height: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

export function Skeleton({
  width,
  height,
  radius = tokenRadius.sm,
  style,
}: SkeletonProps) {
  const { colors } = useTheme();
  const reducedMotion = useReducedMotion();
  const opacity = useSharedValue(reducedMotion ? 0.7 : 0.5);

  useEffect(() => {
    if (reducedMotion) {
      opacity.value = 0.7;
      return;
    }

    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.5, { duration: 700, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      accessible={false}
      accessibilityElementsHidden={true}
      importantForAccessibility="no-hide-descendants"
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: colors.surfaceAlt,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}
