import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Switch, 
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Settings, 
  User, 
  Trash2, 
  Download, 
  Upload, 
  Info, 
  Heart,
  ExternalLink,
  Bluetooth,
  QrCode,
  FileJson,
  ArrowRight
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import Button from '@/components/Button';
import useAppStore from '@/store/app-store';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const router = useRouter();
  const { 
    myTeamNumber, 
    setMyTeamNumber, 
    clearAllData 
  } = useAppStore();
  
  const [teamNumberInput, setTeamNumberInput] = useState(
    myTeamNumber ? myTeamNumber.toString() : '5268'
  );
  const [darkMode, setDarkMode] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleSaveTeamNumber = () => {
    const number = parseInt(teamNumberInput);
    if (isNaN(number)) {
      Alert.alert('Invalid Team Number', 'Please enter a valid team number.');
      return;
    }
    setMyTeamNumber(number);
    Alert.alert('Success', 'Your team number has been saved.');
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to clear all app data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear Data', 
          style: 'destructive',
          onPress: () => {
            clearAllData();
            Alert.alert('Data Cleared', 'All app data has been cleared.');
          }
        },
      ]
    );
  };

  const navigateToDataTransfer = () => {
    router.push('/data-transfer');
  };

  const handleAbout = () => {
    Alert.alert(
      'About FRC Scout',
      'FRC Scout is a tool for FIRST Robotics Competition teams to scout other teams and form strategic alliances.\n\nCustomized for Team 5268 The BioMech Falcons\n\nVersion 1.0.0'
    );
  };

  const openTeamPage = () => {
    Linking.openURL('https://www.thebluealliance.com/team/5268/2025');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Team Information</Text>
          <View style={styles.teamCard}>
            <Text style={styles.teamName}>Team 5268 - The BioMech Falcons</Text>
            <Text style={styles.teamLocation}>Olathe, Kansas, USA</Text>
            <Text style={styles.teamSubtitle}>Rookie Year: 2014</Text>
            <Text style={styles.teamSubtitle}>
              Garmin/MERCK/Black & Veatch/Hy-Vee/Olathe Public Schools Foundation/US Foods/The Olathe Chamber of Commerce & Olathe South High School
            </Text>
            <TouchableOpacity 
              style={styles.teamLink} 
              onPress={openTeamPage}
            >
              <Text style={styles.teamLinkText}>View on The Blue Alliance</Text>
              <ExternalLink size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Your Team Number</Text>
            <TextInput
              style={styles.input}
              value={teamNumberInput}
              onChangeText={setTeamNumberInput}
              placeholder="Enter team number"
              placeholderTextColor={colors.textSecondary}
              keyboardType="number-pad"
            />
            <Button 
              title="Save" 
              onPress={handleSaveTeamNumber} 
              style={styles.saveButton}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Dark Mode</Text>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: colors.gray[600], true: colors.primary }}
              thumbColor={Platform.OS === 'ios' ? undefined : colors.text}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Enable Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.gray[600], true: colors.primary }}
              thumbColor={Platform.OS === 'ios' ? undefined : colors.text}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => router.push('/json-export')}
            activeOpacity={0.7}
          >
            <FileJson size={20} color={colors.text} />
            <Text style={styles.actionButtonText}>Export Data as JSON</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => router.push('/json-import')}
            activeOpacity={0.7}
          >
            <Upload size={20} color={colors.text} />
            <Text style={styles.actionButtonText}>Import Data from JSON</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.dangerButton]} 
            onPress={handleClearData}
            activeOpacity={0.7}
          >
            <Trash2 size={20} color={colors.danger} />
            <Text style={[styles.actionButtonText, styles.dangerText]}>Clear All Data</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleAbout}
            activeOpacity={0.7}
          >
            <Info size={20} color={colors.text} />
            <Text style={styles.actionButtonText}>About FRC Scout</Text>
          </TouchableOpacity>
          
          <View style={styles.credits}>
            <Heart size={16} color={colors.primary} />
            <Text style={styles.creditsText}>
              Made with love for Team 5268 and the FIRST Robotics community
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  teamCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  teamLocation: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  teamSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  teamLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  teamLinkText: {
    fontSize: 14,
    color: colors.primary,
    marginRight: 6,
  },
  inputContainer: {
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
  },
  saveButton: {
    alignSelf: 'flex-start',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: colors.text,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionButtonText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
  dangerButton: {
    borderColor: colors.danger,
  },
  dangerText: {
    color: colors.danger,
  },
  credits: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  creditsText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
    textAlign: 'center',
  },
});