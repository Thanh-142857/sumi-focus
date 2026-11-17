import React, { useEffect, useMemo, type ReactNode } from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Line, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  useReducedMotion,
} from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { duration } from '../theme/tokens';

export interface RingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  accessibilityLabel: string;
  breathing?: boolean;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function Ring({
  progress,
  size = 288,
  strokeWidth = 6,
  accessibilityLabel,
  breathing = false,
  children,
  style,
}: RingProps) {
  const { colors } = useTheme();
  const reducedMotion = useReducedMotion();

  const cx = size / 2;
  const cy = size / 2;
  // Arc radius comfortably inside HUD tick marks
  const rArc = (size - 48) / 2;
  const circumference = 2 * Math.PI * rArc;

  const clampedProgress = Math.min(1, Math.max(0, progress));

  // Reanimated shared values
  const strokeOffset = useSharedValue(
    circumference * (1 - clampedProgress)
  );
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(breathing ? (reducedMotion ? 0.2 : 0.15) : 0);

  // Progress arc animation
  useEffect(() => {
    const target = circumference * (1 - clampedProgress);
    if (reducedMotion) {
      strokeOffset.value = target;
    } else {
      strokeOffset.value = withTiming(target, { duration: 400 });
    }
  }, [clampedProgress, circumference, reducedMotion]);

  // Breathing loop animation
  useEffect(() => {
    if (!breathing) {
      scale.value = withTiming(1, { duration: duration.fast });
      glowOpacity.value = withTiming(0, { duration: duration.fast });
      return;
    }

    if (reducedMotion) {
      scale.value = 1;
      glowOpacity.value = 0.2;
      return;
    }

    const halfPeriod = duration.breathe / 2;

    scale.value = withRepeat(
      withSequence(
        withTiming(1.025, {
          duration: halfPeriod,
          easing: Easing.inOut(Easing.sin),
        }),
        withTiming(1, {
          duration: halfPeriod,
          easing: Easing.inOut(Easing.sin),
        })
      ),
      -1,
      false
    );

    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.4, {
          duration: halfPeriod,
          easing: Easing.inOut(Easing.sin),
        }),
        withTiming(0.15, {
          duration: halfPeriod,
          easing: Easing.inOut(Easing.sin),
        })
      ),
      -1,
      false
    );
  }, [breathing, reducedMotion]);

  // Animated props for SVG elements
  const animatedArcProps = useAnimatedProps(() => ({
    strokeDashoffset: strokeOffset.value,
  }));

  const animatedGlowProps = useAnimatedProps(() => ({
    opacity: glowOpacity.value,
  }));

  const animatedDotProps = useAnimatedProps(() => {
    const currentProg =
      circumference > 0 ? 1 - strokeOffset.value / circumference : 0;
    const angle = -Math.PI / 2 + 2 * Math.PI * currentProg;
    return {
      cx: cx + rArc * Math.cos(angle),
      cy: cy + rArc * Math.sin(angle),
    };
  });

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // 60 HUD ticks around the outside (every 5th longer)
  const ticks = useMemo(() => {
    const rTickOuter = cx - 2;
    return Array.from({ length: 60 }, (_, i) => {
      const isMajor = i % 5 === 0;
      const rTickInner = rTickOuter - (isMajor ? 8 : 4);
      const angle = (i * 6 * Math.PI) / 180;
      return {
        key: i,
        x1: cx + rTickInner * Math.sin(angle),
        y1: cy - rTickInner * Math.cos(angle),
        x2: cx + rTickOuter * Math.sin(angle),
        y2: cy - rTickOuter * Math.cos(angle),
        opacity: isMajor ? 0.35 : 0.15,
      };
    });
  }, [cx, cy]);

  return (
    <Animated.View
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{
        min: 0,
        max: 100,
        now: Math.round(clampedProgress * 100),
      }}
      style={[
        styles.wrapper,
        { width: size, height: size },
        animatedContainerStyle,
        style,
      ]}
    >
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        {/* 60 fine HUD tick marks */}
        <G>
          {ticks.map((t) => (
            <Line
              key={t.key}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke={colors.textMuted}
              strokeWidth={1}
              opacity={t.opacity}
            />
          ))}
        </G>

        {/* Soft cyan blurred glow circle behind arc */}
        <AnimatedCircle
          cx={cx}
          cy={cy}
          r={rArc}
          stroke={colors.glow}
          strokeWidth={strokeWidth * 3}
          fill="none"
          animatedProps={animatedGlowProps}
        />

        {/* Track circle */}
        <Circle
          cx={cx}
          cy={cy}
          r={rArc}
          stroke={colors.track}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Vermilion progress arc starting at 12 o'clock */}
        <AnimatedCircle
          cx={cx}
          cy={cy}
          r={rArc}
          stroke={colors.accent}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${cx} ${cy})`}
          animatedProps={animatedArcProps}
        />

        {/* Tiny cyan dot at progress head */}
        <AnimatedCircle
          r={3}
          fill={colors.glow}
          animatedProps={animatedDotProps}
        />
      </Svg>

      {children ? <View style={styles.content}>{children}</View> : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
