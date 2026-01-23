import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import {
  Heart,
  FileText, // Changed from Calendar
  Plus,
  Users,
  User,
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
  ZoomIn,
  FadeIn,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

export function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDarkMode } = useTheme();

  const tabs = [
    { name: 'index', icon: Heart, label: 'Home' },
    { name: 'records', icon: FileText, label: 'Records' }, // Updated Icon and added label
    { name: 'upload-record', icon: Plus, isSpecial: true, label: 'Upload' },
    { name: 'family-tree', icon: Users, label: 'Family' },
    { name: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 10 }]}>
      <View
        style={[
          styles.pillContainer,
          {
            backgroundColor: isDarkMode ? colors.card : '#FFFFFF',
            shadowColor: colors.shadow,
            borderWidth: isDarkMode ? 1 : 0,
            borderColor: 'rgba(255,255,255,0.1)',
            minWidth: isWeb ? 500 : width * 0.8, // Wider on web
            paddingHorizontal: isWeb ? 30 : 20,
          },
        ]}
      >
        {tabs.map((tab, index) => {
          const isFocused = state.routes[state.index]?.name === tab.name;
          const iconColor = isFocused ? Colors.primary : colors.textSecondary;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: tab.name,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              if (tab.name === 'upload-record') {
                navigation.navigate('upload-record');
              } else {
                navigation.navigate(tab.name, { merge: true });
              }
            }
          };

          if (tab.isSpecial) {
            return (
              <TouchableOpacity
                key={tab.name}
                onPress={onPress}
                style={styles.specialButtonContainer}
                activeOpacity={0.8}
              >
                <Animated.View
                  entering={ZoomIn.delay(300)}
                  style={[
                    styles.specialButton,
                    { backgroundColor: Colors.primary },
                  ]}
                >
                  <Plus size={28} color="#FFFFFF" strokeWidth={2.5} />
                </Animated.View>
                {isWeb && (
                  <Text style={[styles.specialLabel, { color: colors.text }]}>
                    Upload
                  </Text>
                )}
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={tab.name}
              onPress={onPress}
              style={[
                styles.tabButton,
                isWeb && { width: 'auto', paddingHorizontal: 12 },
              ]}
              activeOpacity={0.7}
            >
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
              >
                <tab.icon
                  size={22}
                  color={iconColor}
                  strokeWidth={isFocused ? 2.5 : 2}
                />
                {isWeb && (
                  <Animated.Text
                    entering={FadeIn}
                    style={[
                      styles.webLabel,
                      {
                        color: iconColor,
                        fontFamily: 'Satoshi-Variable',
                        fontWeight: isFocused ? '600' : '400',
                      },
                    ]}
                  >
                    {tab.label}
                  </Animated.Text>
                )}
              </View>
              {isFocused && !isWeb && (
                <Animated.View
                  entering={ZoomIn}
                  style={[
                    styles.activeDot,
                    { backgroundColor: Colors.primary },
                  ]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  pillContainer: {
    flexDirection: 'row',
    borderRadius: 32,
    height: 60,
    width: 'auto',
    maxWidth: isWeb ? 800 : width * 0.9,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: Platform.OS === 'android' ? 10 : 0,
    gap: isWeb ? 40 : 20, // Increased gap for web
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: 40,
  },
  specialButtonContainer: {
    width: 58,
    height: 58,
    marginTop: -24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  specialButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  specialLabel: {
    position: 'absolute',
    bottom: -20,
    fontSize: 12,
    fontWeight: '600',
    opacity: 0, // Hidden for layout purposes or adjust if you want it visible
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    bottom: 8,
  },
  webLabel: {
    fontSize: 14,
    fontFamily: Platform.select({ web: 'system-ui', default: 'System' }),
  },
});
