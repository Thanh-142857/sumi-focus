import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  useReducedMotion,
} from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import {
  radius,
  space,
  type as typography,
  duration,
  hairline,
} from '../theme/tokens';
import { haptic } from '../lib/haptics';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost';
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  style,
}: ButtonProps) {
  const { colors } = useTheme();
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    if (disabled) return;
    if (!reducedMotion) {
      scale.value = withTiming(0.98, { duration: duration.fast });
    }
  };

  const handlePressOut = () => {
    if (disabled) return;
    if (!reducedMotion) {
      scale.value = withTiming(1, { duration: duration.fast });
    }
  };

  const handlePress = () => {
    if (disabled) return;
    haptic.press();
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isLatin = /^[A-Za-z0-9\s.,!?'"\-_/]+$/.test(label);
  const formattedLabel = isLatin ? label.toUpperCase() : label;
  const isPrimary = variant === 'primary';

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      style={[
        styles.button,
        {
          borderRadius: radius.pill,
          backgroundColor: isPrimary ? colors.accent : 'transparent',
          borderWidth: isPrimary ? 0 : hairline,
          borderColor: isPrimary ? 'transparent' : colors.border,
          opacity: disabled ? 0.4 : 1,
        },
        animatedStyle,
        style,
      ]}
    >
      <Text
        style={[
          typography.label,
          {
            color: isPrimary ? colors.accentText : colors.text,
          },
        ]}
      >
        {formattedLabel}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 56,
    paddingHorizontal: space[3],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
