import React, { useEffect } from 'react';
import { Redirect } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import useAppStore from '@/store/app-store';

// Keep the splash screen visible while we check if the user has completed onboarding
SplashScreen.preventAutoHideAsync();

export default function Index() {
  const { onboardingCompleted } = useAppStore();

  // Just hide splash screen, don't load mock data
  useEffect(() => {
    const hideSplash = async () => {
      await SplashScreen.hideAsync();
    };

    hideSplash();
  }, []);

  // Redirect to onboarding if not completed, otherwise go to main app
  return onboardingCompleted ? <Redirect href="/(tabs)" /> : <Redirect href="/onboarding" />;
}