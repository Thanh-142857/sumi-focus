import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { radius, space, hairline, type as typography } from '../theme/tokens';
import { haptic } from '../lib/haptics';

export interface SegmentedOption<T extends string = string> {
  value: T;
  label: string;
}

export interface SegmentedProps<T extends string = string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
}

export function Segmented<T extends string = string>({
  options,
  value,
  onChange,
  accessibilityLabel,
  style,
}: SegmentedProps<T>) {
  const { colors } = useTheme();

  return (
    <View
      accessible={true}
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: hairline,
          borderRadius: radius.pill,
        },
        style,
      ]}
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;

        const handlePress = () => {
          if (!isSelected) {
            haptic.select();
            onChange(opt.value);
          }
        };

        return (
          <Pressable
            key={opt.value}
            onPress={handlePress}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={opt.label}
            style={[
              styles.optionButton,
              {
                borderRadius: radius.pill,
                backgroundColor: isSelected ? colors.surfaceAlt : 'transparent',
                borderColor: isSelected ? colors.accent : 'transparent',
                borderWidth: hairline,
              },
            ]}
          >
            <Text
              style={[
                typography.label,
                styles.optionText,
                {
                  color: isSelected ? colors.text : colors.textMuted,
                },
              ]}
              numberOfLines={1}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    padding: space.half,
  },
  optionButton: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space[1],
  },
  optionText: {
    textAlign: 'center',
  },
});
