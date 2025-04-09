import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';

interface RatingBarProps {
  label: string;
  value: number;
  maxValue?: number;
}

export default function RatingBar({ label, value, maxValue = 5 }: RatingBarProps) {
  const percentage = (value / maxValue) * 100;
  
  const getBarColor = (percent: number) => {
    if (percent >= 80) return colors.success;
    if (percent >= 60) return colors.primary;
    if (percent >= 40) return colors.warning;
    return colors.danger;
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value.toFixed(1)}</Text>
      </View>
      <View style={styles.barBackground}>
        <View 
          style={[
            styles.barFill, 
            { 
              width: `${percentage}%`,
              backgroundColor: getBarColor(percentage)
            }
          ]} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    color: colors.text,
  },
  value: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  barBackground: {
    height: 8,
    backgroundColor: colors.gray[700],
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
});