import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const contentOpacity = useSharedValue(0);
  const lineWidth = useSharedValue(0);

  useEffect(() => {
    // Subtle fade in
    contentOpacity.value = withDelay(200, withTiming(1, { 
      duration: 800,
      easing: Easing.out(Easing.ease),
    }));
    
    // Elegant line animation
    lineWidth.value = withDelay(600, withTiming(1, {
      duration: 1200,
      easing: Easing.out(Easing.ease),
    }));
    
    // Finish splash screen
    const timer = setTimeout(() => {
      contentOpacity.value = withTiming(0, { 
        duration: 400,
        easing: Easing.in(Easing.ease),
      }, () => {
        runOnJS(onFinish)();
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const lineStyle = useAnimatedStyle(() => ({
    width: `${lineWidth.value * 100}%`,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, contentStyle]}>
        {/* App Name - Minimal and Elegant */}
        <View style={styles.textContainer}>
          <Text style={styles.appName}>Svastheya</Text>
          <Animated.View style={[styles.underline, lineStyle]} />
        </View>
        
        {/* Subtle Tagline */}
        <Text style={styles.tagline}>Secure Medical Records, Seamless Care</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  appName: {
    fontFamily: 'IvyMode-Regular',
    fontSize: 52,
    color: Colors.primary,
    letterSpacing: 3,
    marginBottom: 12,
  },
  underline: {
    height: 1.5,
    backgroundColor: Colors.primary,
    marginTop: 6,
    opacity: 0.6,
  },
  tagline: {
    fontFamily: 'Satoshi-Variable',
    fontSize: 14,
    color: Colors.light.textSecondary,
    letterSpacing: 2,
    opacity: 0.8,
  },
});
