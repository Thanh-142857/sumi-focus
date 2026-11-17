import React, { type ReactNode } from 'react';
import {
  View,
  Pressable,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { radius, space, hairline } from '../theme/tokens';
import { haptic } from '../lib/haptics';

export interface CardProps {
  children?: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function Card({
  children,
  onPress,
  style,
  padded = true,
  accessibilityLabel,
  accessibilityHint,
}: CardProps) {
  const { colors } = useTheme();

  const containerStyle: ViewStyle = {
    backgroundColor: colors.surface,
    borderWidth: hairline,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: padded ? space[3] : 0,
    minHeight: onPress ? 44 : undefined,
  };

  if (onPress) {
    const handlePress = () => {
      haptic.tap();
      onPress();
    };

    return (
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        style={({ pressed }) => [
          containerStyle,
          pressed && { opacity: 0.9 },
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={[containerStyle, style]}>{children}</View>;
}
