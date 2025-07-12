import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(50);
  const backgroundOpacity = useSharedValue(0);

  useEffect(() => {
    // Start animations
    backgroundOpacity.value = withTiming(1, { duration: 800 });
    
    logoScale.value = withDelay(300, withSpring(1, { damping: 12, stiffness: 100 }));
    logoOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));
    
    textOpacity.value = withDelay(800, withTiming(1, { duration: 600 }));
    textTranslateY.value = withDelay(800, withSpring(0, { damping: 15, stiffness: 100 }));
    
    // Finish splash screen after animations
    const timer = setTimeout(() => {
      logoScale.value = withTiming(0.8, { duration: 300 });
      logoOpacity.value = withTiming(0, { duration: 300 });
      textOpacity.value = withTiming(0, { duration: 300 });
      backgroundOpacity.value = withTiming(0, { duration: 300 }, () => {
        runOnJS(onFinish)();
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const backgroundStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  return (
    <Animated.View style={[styles.container, backgroundStyle]}>
      <LinearGradient
        colors={['#009485', '#004d40']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Animated background elements */}
        <View style={styles.backgroundCircle1} />
        <View style={styles.backgroundCircle2} />
        <View style={styles.backgroundCircle3} />
        
        {/* Logo */}
        <Animated.View style={[styles.logoContainer, logoStyle]}>
          <Image
            source={require('@/assets/images/Logo-Main.png')}
            style={styles.logo}
            contentFit="contain"
          />
        </Animated.View>
        
        {/* App Name */}
        <Animated.View style={[styles.textContainer, textStyle]}>
          <Text style={styles.appName}>Svastheya</Text>
          <Text style={styles.tagline}>Your Health, Our Priority</Text>
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backgroundCircle1: {
    position: 'absolute',
    top: height * 0.1,
    right: -width * 0.2,
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  backgroundCircle2: {
    position: 'absolute',
    bottom: height * 0.2,
    left: -width * 0.15,
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  backgroundCircle3: {
    position: 'absolute',
    top: height * 0.6,
    right: width * 0.1,
    width: width * 0.2,
    height: width * 0.2,
    borderRadius: width * 0.1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
  },
  textContainer: {
    alignItems: 'center',
  },
  appName: {
    fontFamily: 'IvyMode-Regular',
    fontSize: 36,
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 1,
  },
  tagline: {
    fontFamily: 'Satoshi-Variable',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 0.5,
  },
}); 