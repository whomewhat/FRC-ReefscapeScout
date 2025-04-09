import React from 'react';
import { Stack } from 'expo-router';
import { colors } from '@/constants/colors';

export default function ScoutingLayout() {
  return (
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
      <Stack.Screen 
        name="index"
        options={{
          title: "Scouting"
        }}
      />
    </Stack>
  );
}