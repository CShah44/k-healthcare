import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="role-selection" />
      <Stack.Screen name="patient-login" />
      <Stack.Screen name="patient-signup" />
      <Stack.Screen name="healthcare-login" />
      <Stack.Screen name="healthcare-signup" />
    </Stack>
  );
}