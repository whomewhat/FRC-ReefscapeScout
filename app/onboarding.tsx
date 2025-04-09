import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, Check, Users, Settings, Search } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import useAppStore from '@/store/app-store';

const OnboardingScreen = () => {
  const router = useRouter();
  const { setMyTeamNumber, updateSettings } = useAppStore();
  const [step, setStep] = useState(1);
  const [teamNumber, setTeamNumber] = useState('');
  const [teamNumberError, setTeamNumberError] = useState('');

  const handleNext = () => {
    if (step === 1) {
      // Validate team number
      if (!teamNumber.trim()) {
        setTeamNumberError('Please enter your team number');
        return;
      }
      
      const number = parseInt(teamNumber, 10);
      if (isNaN(number) || number <= 0) {
        setTeamNumberError('Please enter a valid team number');
        return;
      }
      
      setMyTeamNumber(number);
      setTeamNumberError('');
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else {
      // Complete onboarding
      updateSettings({ onboardingCompleted: true });
      router.replace('/(tabs)');
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Users size={48} color={colors.primary} />
      </View>
      <Text style={styles.title}>Welcome to FRC Scout</Text>
      <Text style={styles.description}>
        Let's get started by setting up your team information.
      </Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Your Team Number</Text>
        <TextInput
          style={[styles.input, teamNumberError ? styles.inputError : null]}
          placeholder="Enter your team number"
          placeholderTextColor={colors.textSecondary}
          keyboardType="number-pad"
          value={teamNumber}
          onChangeText={(text) => {
            setTeamNumber(text);
            if (teamNumberError) setTeamNumberError('');
          }}
        />
        {teamNumberError ? (
          <Text style={styles.errorText}>{teamNumberError}</Text>
        ) : null}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Search size={48} color={colors.primary} />
      </View>
      <Text style={styles.title}>Scout with Ease</Text>
      <Text style={styles.description}>
        Track team performance, record match data, and take notes to help your team make strategic decisions.
      </Text>
      
      <View style={styles.featureList}>
        <View style={styles.featureItem}>
          <Check size={20} color={colors.success} />
          <Text style={styles.featureText}>Record match data and team performance</Text>
        </View>
        <View style={styles.featureItem}>
          <Check size={20} color={colors.success} />
          <Text style={styles.featureText}>Track upcoming matches and schedules</Text>
        </View>
        <View style={styles.featureItem}>
          <Check size={20} color={colors.success} />
          <Text style={styles.featureText}>Take detailed notes about teams and strategies</Text>
        </View>
        <View style={styles.featureItem}>
          <Check size={20} color={colors.success} />
          <Text style={styles.featureText}>Export and share your scouting data</Text>
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Settings size={48} color={colors.primary} />
      </View>
      <Text style={styles.title}>Ready to Go!</Text>
      <Text style={styles.description}>
        Your app is now set up and ready to use. You can always change your settings later.
      </Text>
      
      <View style={styles.finalStepContainer}>
        <Text style={styles.finalStepText}>
          Tap the button below to start scouting!
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        
        <View style={styles.progressContainer}>
          <View style={styles.progressDots}>
            <View style={[styles.dot, step >= 1 && styles.activeDot]} />
            <View style={[styles.dot, step >= 2 && styles.activeDot]} />
            <View style={[styles.dot, step >= 3 && styles.activeDot]} />
          </View>
          
          <TouchableOpacity 
            style={styles.nextButton}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>
              {step === 3 ? 'Get Started' : 'Next'}
            </Text>
            <ChevronRight size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    marginTop: 8,
  },
  featureList: {
    width: '100%',
    marginTop: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  finalStepContainer: {
    width: '100%',
    marginTop: 24,
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  finalStepText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
  },
  progressDots: {
    flexDirection: 'row',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border,
    marginRight: 8,
  },
  activeDot: {
    backgroundColor: colors.primary,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
    marginRight: 8,
  },
});

export default OnboardingScreen;