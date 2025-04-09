import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '@/constants/colors';
import ErrorBoundary from './error-boundary';

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="note/[id]" options={{ title: "Note Details" }} />
        <Stack.Screen name="note/create" options={{ title: "Create Note" }} />
        <Stack.Screen name="match/[id]" options={{ title: "Match Details" }} />
        <Stack.Screen name="match/create" options={{ title: "Add Match" }} />
        <Stack.Screen name="team/[id]" options={{ title: "Team Details" }} />
        <Stack.Screen name="scouting/create" options={{ title: "Add Scouting Record" }} />
        <Stack.Screen name="scouting/[id]" options={{ title: "Scouting Record" }} />
        <Stack.Screen name="json-export" options={{ title: "Export Data" }} />
        <Stack.Screen name="json-import" options={{ title: "Import Data" }} />
      </Stack>
    </ErrorBoundary>
  );
}