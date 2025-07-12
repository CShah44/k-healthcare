import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';

interface AnimatedCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
  animated?: boolean;
  delay?: number;
  scale?: number;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  onPress,
  style,
  animated = true,
  delay = 0,
  scale = 0.95,
}) => {
  const { colors } = useTheme();
  const cardScale = useSharedValue(animated ? 0 : 1);
  const pressScale = useSharedValue(1);
  const shadowOpacity = useSharedValue(0);

  React.useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        cardScale.value = withSpring(1, {
          damping: 15,
          stiffness: 100,
        });
        shadowOpacity.value = withTiming(1, { duration: 600 });
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [animated, delay]);

  const handlePressIn = () => {
    if (onPress) {
      pressScale.value = withSpring(scale, { damping: 15, stiffness: 300 });
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      pressScale.value = withSpring(1, { damping: 15, stiffness: 300 });
    }
  };

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: cardScale.value * pressScale.value },
    ],
    shadowOpacity: shadowOpacity.value,
  }));

  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <Animated.View style={[styles.container, cardStyle]}>
      <CardComponent
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            shadowColor: colors.shadow,
          },
          style,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {children}
      </CardComponent>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 12,
    elevation: 8,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
}); 