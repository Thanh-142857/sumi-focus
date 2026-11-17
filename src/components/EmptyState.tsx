import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../theme/ThemeProvider';
import { space, type as typography } from '../theme/tokens';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function EmptyState({
  title,
  body,
  actionLabel,
  onAction,
  style,
}: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      {/* Abstract Ensō Glyph: thin circle with short vermilion arc */}
      <Svg width={64} height={64} viewBox="0 0 64 64">
        <Circle
          cx={32}
          cy={32}
          r={24}
          stroke={colors.border}
          strokeWidth={1.5}
          fill="none"
        />
        <Circle
          cx={32}
          cy={32}
          r={24}
          stroke={colors.accent}
          strokeWidth={2}
          strokeDasharray="28 123"
          strokeLinecap="round"
          fill="none"
          transform="rotate(-45 32 32)"
        />
      </Svg>

      <View style={styles.textBlock}>
        <Text
          accessibilityRole="header"
          style={[typography.title, styles.title, { color: colors.text }]}
        >
          {title}
        </Text>
        <Text
          style={[typography.body, styles.body, { color: colors.textMuted }]}
        >
          {body}
        </Text>
      </View>

      {actionLabel && onAction ? (
        <View style={styles.actionContainer}>
          <Button
            variant="ghost"
            label={actionLabel}
            onPress={onAction}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: space[6],
    paddingHorizontal: space[4],
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    marginTop: space[3],
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
  },
  body: {
    marginTop: space[1],
    textAlign: 'center',
    maxWidth: 300,
  },
  actionContainer: {
    marginTop: space[4],
    width: '100%',
    maxWidth: 240,
  },
});
