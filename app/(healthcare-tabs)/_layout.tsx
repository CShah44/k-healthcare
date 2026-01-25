import { Tabs, Redirect } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { View, ActivityIndicator, StatusBar, Platform } from 'react-native';
import { HealthcareTabBar } from '@/components/ui/HealthcareTabBar';

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
        barStyle={
          colors.background === Colors.light.background
            ? 'dark-content'
            : 'light-content'
        }
        backgroundColor={colors.background}
        translucent={Platform.OS === 'android'}
      />
      <Tabs
        tabBar={(props) => <HealthcareTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
          }}
        />
        <Tabs.Screen
          name="patients"
          options={{
            title: 'Patients',
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
          }}
        />

        {/* Hidden routes */}
        <Tabs.Screen
          name="create-prescription"
          options={{
            href: null,
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
