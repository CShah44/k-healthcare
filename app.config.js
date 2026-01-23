import 'dotenv/config';

export default {
  expo: {
    name: 'Svastheya',
    slug: 'svastheya',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'svastheya',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/images/Logo-Main.png',
      resizeMode: 'contain',
      backgroundColor: '#009485',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.svastheya.khealthcare',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/icon.png',
        backgroundColor: '#009485',
      },
      package: 'com.svastheya.khealthcare',
    },
    web: {
      favicon: './assets/images/favicon.png',
      bundler: 'metro',
    },
    plugins: ['expo-router', 'expo-font', 'expo-splash-screen'],
    extra: {
      // Firebase Configuration
      FIREBASE_API_KEY:
        process.env.FIREBASE_API_KEY ||
        'AIzaSyDfhtoR91CbZLwBab01HTUkTYg5bOLSyAE',
      FIREBASE_AUTH_DOMAIN:
        process.env.FIREBASE_AUTH_DOMAIN || 'svastheya.firebaseapp.com',
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || 'svastheya',
      FIREBASE_STORAGE_BUCKET:
        process.env.FIREBASE_STORAGE_BUCKET || 'svastheya.firebasestorage.app',
      FIREBASE_MESSAGING_SENDER_ID:
        process.env.FIREBASE_MESSAGING_SENDER_ID || '276216233184',
      FIREBASE_APP_ID:
        process.env.FIREBASE_APP_ID ||
        '1:276216233184:ios:0e6824eb4bc88ab426e485',
      IDFY_API_KEY: process.env.IDFY_API_KEY || 'your_idfy_api_key_here',

      // Supabase Configuration (replace with your actual Supabase credentials)
      SUPABASE_URL: process.env.SUPABASE_URL || 'your_supabase_url_here',
      SUPABASE_ANON_KEY:
        process.env.SUPABASE_ANON_KEY || 'your_supabase_anon_key_here',
    },
  },
};
