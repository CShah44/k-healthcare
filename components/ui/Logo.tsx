import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';

interface LogoProps {
  size?: number;
  animated?: boolean;
  style?: any;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 40, 
  animated = false,
  style 
}) => {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    if (animated) {
      // Subtle breathing animation
      scale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 2000 }),
          withTiming(1, { duration: 2000 })
        ),
        -1,
        true
      );

      // Gentle rotation
      rotation.value = withRepeat(
        withSequence(
          withTiming(5, { duration: 3000 }),
          withTiming(-5, { duration: 3000 })
        ),
        -1,
        true
      );
    }
  }, [animated]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle, style]}>
      <Image
        source={require('@/assets/images/Logo-Main.png')}
        style={[styles.logo, { width: size, height: size }]}
        contentFit="contain"
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    // Default size will be overridden by props
  },
}); 