import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, Users, Shield } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { GlobalStyles } from '@/constants/Styles';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

export default function WelcomeScreen() {
  const { isAuthenticated, user } = useAuth();

  React.useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'patient') {
        router.replace('/(patient-tabs)');
      } else {
        router.replace('/(healthcare-tabs)');
      }
    }
  }, [isAuthenticated, user]);

  const handleRoleSelection = (role: 'patient' | 'healthcare') => {
    router.push(`/auth/role-selection?role=${role}`);
  };

  return (
    <SafeAreaView style={[GlobalStyles.container, styles.container]}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Heart size={40} color={Colors.primary} />
          <Text style={styles.appName}>K Healthcare</Text>
        </View>
        <Text>
          Your comprehensive healthcare companion
        </Text>
      </View>

      <View style={styles.content}>
        {/* <Text style={styles.welcomeTitle}>Welcome</Text> */}
        <Text style={styles.welcomeSubtitle}>
          Choose your role to get started with K Healthcare
        </Text>

        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => handleRoleSelection('patient')}
            activeOpacity={0.8}
          >
            <View style={styles.roleIconContainer}>
              <Heart size={32} color={Colors.primary} />
            </View>
            <Text style={styles.roleTitle}>I'm a Patient</Text>
            <Text style={styles.roleDescription}>
              Access your medical records, book appointments, and manage your health
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => handleRoleSelection('healthcare')}
            activeOpacity={0.8}
          >
            <View style={styles.roleIconContainer}>
              <Users size={32} color={Colors.primary} />
            </View>
            <Text style={styles.roleTitle}>I'm a Healthcare Worker</Text>
            <Text style={styles.roleDescription}>
              Manage patient records, lab results, and provide medical care
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
  },
  
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  appName: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: Colors.text,
    marginLeft: 12,
  },
  
  tagline: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  
  welcomeTitle: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  
  welcomeSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
    fontFamily: 'Inter-Regular',
  },
  
  roleContainer: {
    gap: 20,
  },
  
  roleCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  
  roleIconContainer: {
    width: 64,
    height: 64,
    backgroundColor: Colors.medical.lightBlue,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  
  roleTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    marginBottom: 8,
  },
  
  roleDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
  },
  
  footer: {
    alignItems: 'center',
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  
  securityText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 6,
    fontFamily: 'Inter-Medium',
  },
});