import { Platform, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '@/constants/Colors';

export const layoutStyles = {
  tabBarStyle: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopColor: 'rgba(59, 130, 246, 0.1)',
    borderTopWidth: 1,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 25 : 8,
    height: Platform.OS === 'ios' ? 85 : 65,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    borderRadius: 20,
    marginHorizontal: 10,
    marginBottom: 10,
    position: 'absolute' as const,
  } as ViewStyle,
  tabBarLabelStyle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
    marginTop: 4,
  } as TextStyle,
  tabBarIconStyle: {
    marginTop: 4,
  } as ViewStyle,
  tabBarActiveTintColor: Colors.primary,
  tabBarInactiveTintColor: Colors.light.text,
}; 