import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { Sun, Moon } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeToggleProps {
  size?: number;
  style?: any;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  size = 24, 
  style 
}) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const colors = useTheme().colors;

  // Animation values
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const iconOpacity = useSharedValue(1);

  // Animate on theme change
  React.useEffect(() => {
    rotation.value = withSpring(isDarkMode ? 180 : 0, {
      damping: 15,
      stiffness: 150,
    });
  }, [isDarkMode]);

  // Press animation
  const handlePress = () => {
    scale.value = withSpring(0.8, { damping: 10 }, () => {
      scale.value = withSpring(1, { damping: 10 });
    });
    
    iconOpacity.value = withTiming(0, { duration: 150 }, () => {
      runOnJS(toggleTheme)();
      iconOpacity.value = withTiming(1, { duration: 150 });
    });
  };

  // Animated styles
  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
  }));

  const backgroundStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(
      isDarkMode ? colors.surfaceSecondary : colors.surface,
      { duration: 300 }
    ),
    borderColor: withTiming(
      isDarkMode ? colors.border : colors.borderSecondary,
      { duration: 300 }
    ),
  }));

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[styles.container, style]}
      activeOpacity={0.8}
    >
      <Animated.View style={[styles.background, backgroundStyle]}>
        <Animated.View style={[styles.iconContainer, containerStyle]}>
          <Animated.View style={[styles.icon, iconStyle]}>
            {isDarkMode ? (
              <Moon size={size} color={colors.text} strokeWidth={2} />
            ) : (
              <Sun size={size} color={colors.text} strokeWidth={2} />
            )}
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  background: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 