import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: any;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 40,
  color,
  strokeWidth = 3,
  style,
}) => {
  const { colors } = useTheme();
  const spinnerColor = color || Colors.primary;
  
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  React.useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000 }),
      -1,
      false
    );
    
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
      -1,
      true
    );
  }, []);

  const spinnerStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
  }));

  const dotStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      rotation.value,
      [0, 90, 180, 270, 360],
      [1, 0.3, 0.1, 0.3, 1]
    );
    return { opacity };
  });

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={[styles.spinner, spinnerStyle, { width: size, height: size }]}>
        <View style={[styles.dot, { backgroundColor: spinnerColor, width: strokeWidth, height: strokeWidth }]} />
        <View style={[styles.dot, { backgroundColor: spinnerColor, width: strokeWidth, height: strokeWidth, top: 0, right: 0 }]} />
        <View style={[styles.dot, { backgroundColor: spinnerColor, width: strokeWidth, height: strokeWidth, bottom: 0, left: 0 }]} />
        <View style={[styles.dot, { backgroundColor: spinnerColor, width: strokeWidth, height: strokeWidth, bottom: 0, right: 0 }]} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    borderRadius: 50,
  },
});