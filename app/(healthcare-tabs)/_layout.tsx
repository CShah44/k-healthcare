import { Tabs, Redirect } from 'expo-router';
import { Activity, Users, FileText, User } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { layoutStyles } from '../../styles/layout';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { View, ActivityIndicator, StatusBar } from 'react-native';

export default function HealthcareTabsLayout() {
  const { colors } = useTheme();
  const { userData, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (userData?.role !== 'doctor' && userData?.role !== 'lab_assistant') {
    return <Redirect href="/auth" />;
  }

  return (
    <>
      <StatusBar
        barStyle={colors.background === Colors.light.background ? "dark-content" : "light-content"}
        backgroundColor={colors.background}
        translucent={Platform.OS === 'android'}
      />
      <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          ...layoutStyles.tabBarStyle,
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          shadowColor: colors.shadow,
        },
        tabBarLabelStyle: {
          ...layoutStyles.tabBarLabelStyle,
          fontFamily: 'Satoshi-Variable',
        },
        tabBarIconStyle: layoutStyles.tabBarIconStyle,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Activity size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="patients"
        options={{
          title: 'Patients',
          tabBarIcon: ({ color, size }) => (
            <Users size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} strokeWidth={2} />
          ),
        }}
      />

      {/* Hidden routes */}
      <Tabs.Screen
        name="create-prescription"
        options={{
          href: null,
          tabBarStyle: { display: 'none' }, // Hide tab bar on this screen if desired, or keep it. Patient app hides tabs on sub-screens often.
        }}
      />
      <Tabs.Screen
        name="records"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="edit-profile"
        options={{
          href: null,
        }}
      />
    </Tabs>
    </>
  );
}
