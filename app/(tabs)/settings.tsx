import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Switch, 
  TouchableOpacity, 
  ScrollView,
  TextInput,
  Alert,
  Linking,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Key, 
  Trash2, 
  Download, 
  Upload, 
  ExternalLink,
  RefreshCw,
  Database,
  ClipboardList,
  Users
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import useAppStore from '@/store/app-store';
import useScoutingStore from '@/store/scouting-store';
import useThemeStore from '@/store/theme-store';
import { useRouter } from 'expo-router';
import Button from '@/components/Button';
import { getTeamEventsAndMatches, getTeamsEventsAndMatches } from '@/utils/tba-api';
import { convertMatchesToScoutingRecords } from '@/utils/scouting-converter';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const router = useRouter();
  const { 
    myTeamNumber, 
    setMyTeamNumber, 
    tbaApiKey, 
    setTbaApiKey,
    resetStore,
    clearAllData,
    setEventsMatchesTeams,
    events,
    matches,
    teams
  } = useAppStore();
  
  const { records, clearRecords } = useScoutingStore();
  const { setDarkMode } = useThemeStore();
  
  const [teamNumber, setTeamNumber] = useState(myTeamNumber ? myTeamNumber.toString() : '5268');
  const [apiKey, setApiKey] = useState(tbaApiKey || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingScoutingRecords, setIsGeneratingScoutingRecords] = useState(false);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [showApiKeySaveConfirmation, setShowApiKeySaveConfirmation] = useState(false);
  const [isClearingData, setIsClearingData] = useState(false);
  const [isImportingAllTeamsData, setIsImportingAllTeamsData] = useState(false);

  useEffect(() => {
    // Update team number input if store value changes
    if (myTeamNumber) {
      setTeamNumber(myTeamNumber.toString());
    }
  }, [myTeamNumber]);

  // Clear save confirmation after 3 seconds
  useEffect(() => {
    if (showSaveConfirmation) {
      const timer = setTimeout(() => {
        setShowSaveConfirmation(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSaveConfirmation]);

  // Clear API key save confirmation after 3 seconds
  useEffect(() => {
    if (showApiKeySaveConfirmation) {
      const timer = setTimeout(() => {
        setShowApiKeySaveConfirmation(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showApiKeySaveConfirmation]);

  const handleSaveTeamNumber = () => {
    const parsedNumber = parseInt(teamNumber);
    if (isNaN(parsedNumber)) {
      Alert.alert('Invalid Team Number', 'Please enter a valid number.');
      return;
    }
    setMyTeamNumber(parsedNumber);
    setShowSaveConfirmation(true);
  };

  const handleSaveApiKey = () => {
    setTbaApiKey(apiKey);
    setShowApiKeySaveConfirmation(true);
  };

  const handleClearData = async () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to clear all app data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear Data', 
          style: 'destructive',
          onPress: async () => {
            try {
              setIsClearingData(true);
              console.log("Starting data clear process...");
              
              // First clear all AsyncStorage keys
              await AsyncStorage.clear();
              console.log("AsyncStorage cleared successfully");
              
              // Then clear scouting records directly
              clearRecords();
              console.log("Scouting records cleared");
              
              // Reset the app store to initial state
              clearAllData();
              console.log("App store reset");
              
              // Reset theme store
              setDarkMode(true);
              console.log("Theme store reset");
              
              // Show success message
              Alert.alert(
                'Success', 
                'All data has been cleared successfully.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Force reload the app by navigating to onboarding
                      router.replace('/onboarding');
                    }
                  }
                ]
              );
            } catch (error) {
              console.error("Error clearing data:", error);
              Alert.alert(
                'Error', 
                `Failed to clear data: ${error instanceof Error ? error.message : 'Unknown error'}. Please restart the app and try again.`
              );
            } finally {
              setIsClearingData(false);
            }
          }
        }
      ]
    );
  };

  const handleExportData = () => {
    router.push('/json-export');
  };

  const handleImportData = () => {
    router.push('/json-import');
  };

  const openTbaWebsite = () => {
    Linking.openURL('https://www.thebluealliance.com/');
  };

  const openTbaAccountPage = () => {
    Linking.openURL('https://www.thebluealliance.com/account');
  };

  const importTbaData = async () => {
    if (!tbaApiKey) {
      Alert.alert('Missing API Key', 'Please enter and save your TBA API key first.');
      return;
    }

    // Use current team number or default to 5268 if not set
    const teamNumberToUse = myTeamNumber || 5268;
    
    setIsLoading(true);
    try {
      console.log(`Importing data for team ${teamNumberToUse}`);
      const { events, matches, teams } = await getTeamEventsAndMatches(teamNumberToUse, tbaApiKey);
      console.log(`Import successful: ${events.length} events, ${matches.length} matches, ${teams.length} teams`);
      
      setEventsMatchesTeams(events, matches, teams);
      Alert.alert(
        'Import Successful', 
        `Imported ${events.length} events, ${matches.length} matches, and ${teams.length} teams.`
      );
    } catch (error) {
      console.error('Import error:', error);
      Alert.alert(
        'Import Failed', 
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const importAllTeamsData = async () => {
    if (!tbaApiKey) {
      Alert.alert('Missing API Key', 'Please enter and save your TBA API key first.');
      return;
    }

    setIsImportingAllTeamsData(true);
    try {
      // Get all unique team numbers from existing teams
      if (!teams || teams.length === 0) {
        Alert.alert('No Teams Found', 'Please import your team data first to get the list of teams to fetch data for.');
        setIsImportingAllTeamsData(false);
        return;
      }
      
      // Extract team numbers from the teams array
      const teamNumbersArray = teams
        .filter(team => team && (team.number || team.team_number))
        .map(team => team.number || team.team_number)
        .filter(Boolean);
      
      if (teamNumbersArray.length === 0) {
        Alert.alert('No Valid Teams Found', 'Please import your team data first to get the list of teams to fetch data for.');
        return;
      }
      
      console.log(`Importing data for ${teamNumbersArray.length} teams`);
      Alert.alert(
        'Importing Team Data', 
        `Starting to import data for ${teamNumbersArray.length} teams. This may take a while.`
      );
      
      const { events, matches, teams: updatedTeams } = await getTeamsEventsAndMatches(teamNumbersArray, tbaApiKey);
      console.log(`Import successful: ${events.length} events, ${matches.length} matches, ${updatedTeams.length} teams`);
      
      setEventsMatchesTeams(events, matches, updatedTeams);
      Alert.alert(
        'Import Successful', 
        `Imported data for ${teamNumbersArray.length} teams:
${events.length} events
${matches.length} matches
${updatedTeams.length} teams`
      );
    } catch (error) {
      console.error('Import all teams data error:', error);
      Alert.alert(
        'Import Failed', 
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsImportingAllTeamsData(false);
    }
  };

  const generateScoutingRecords = () => {
    if (!matches || matches.length === 0) {
      Alert.alert('No Match Data', 'Please import match data from TBA first.');
      return;
    }

    setIsGeneratingScoutingRecords(true);
    try {
      console.log(`Generating scouting records from ${matches.length} matches`);
      
      // Only use completed matches for generating scouting records
      const completedMatches = matches.filter(match => match.completed);
      console.log(`Found ${completedMatches.length} completed matches`);
      
      // Convert matches to scouting records
      const newRecords = convertMatchesToScoutingRecords(completedMatches, teams, myTeamNumber);
      console.log(`Generated ${newRecords.length} scouting records`);
      
      // Import the new records
      if (newRecords.length > 0) {
        useScoutingStore.getState().importRecords(newRecords);
        
        Alert.alert(
          'Success', 
          `Generated ${newRecords.length} scouting records from match data.`
        );
      } else {
        Alert.alert(
          'No Records Generated', 
          'No scouting records could be generated from the match data. This might be because there are no completed matches or the teams in the matches are not in your team list.'
        );
      }
    } catch (error) {
      console.error('Error generating scouting records:', error);
      Alert.alert(
        'Error', 
        `Failed to generate scouting records: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsGeneratingScoutingRecords(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Team Settings</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Your Team Number</Text>
            <TextInput
              style={styles.input}
              value={teamNumber}
              onChangeText={setTeamNumber}
              placeholder="e.g. 5268"
              placeholderTextColor={colors.gray[500]}
              keyboardType="number-pad"
            />
            <Button 
              title={showSaveConfirmation ? "Saved!" : "Save"} 
              onPress={handleSaveTeamNumber}
              style={styles.saveButton}
              variant={showSaveConfirmation ? "success" : "primary"}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API Integration</Text>
          <View style={styles.inputContainer}>
            <View style={styles.apiKeyHeader}>
              <Text style={styles.inputLabel}>The Blue Alliance API Key</Text>
              <TouchableOpacity onPress={openTbaWebsite}>
                <ExternalLink size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.apiKeyInputRow}>
              <Key size={20} color={colors.textSecondary} style={styles.apiKeyIcon} />
              <TextInput
                style={styles.apiKeyInput}
                value={apiKey}
                onChangeText={setApiKey}
                placeholder="Enter your TBA API key"
                placeholderTextColor={colors.gray[500]}
                secureTextEntry={true}
              />
            </View>
            <Button 
              title={showApiKeySaveConfirmation ? "Saved!" : "Save API Key"} 
              onPress={handleSaveApiKey}
              style={styles.saveButton}
              variant={showApiKeySaveConfirmation ? "success" : "primary"}
            />
            <TouchableOpacity 
              style={styles.getApiKeyLink}
              onPress={openTbaAccountPage}
            >
              <Text style={styles.getApiKeyText}>
                Don't have an API key? Get one here
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.tbaImportContainer}>
            <Text style={styles.tbaImportTitle}>Import Data from The Blue Alliance</Text>
            <Text style={styles.tbaImportDescription}>
              Import all events, matches, and teams for your team from The Blue Alliance.
              This will fetch data for the current season.
            </Text>
            
            <Button 
              title="Import TBA Data" 
              onPress={importTbaData}
              icon={<RefreshCw size={16} color={colors.white} />}
              style={styles.importButton}
              disabled={isLoading}
            />
            
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>Importing data...</Text>
              </View>
            )}
            
            <Button 
              title="Import All Teams' Previous Events" 
              onPress={importAllTeamsData}
              icon={<Users size={16} color={colors.white} />}
              style={[styles.importButton, { marginTop: 12 }]}
              disabled={isImportingAllTeamsData || !teams || teams.length === 0}
            />
            
            {isImportingAllTeamsData && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>Importing all teams data...</Text>
              </View>
            )}
            
            {events.length > 0 && (
              <View style={styles.dataStatsContainer}>
                <View style={styles.dataStatItem}>
                  <Database size={16} color={colors.primary} />
                  <Text style={styles.dataStatText}>
                    {events.length} Events
                  </Text>
                </View>
                <View style={styles.dataStatItem}>
                  <Database size={16} color={colors.primary} />
                  <Text style={styles.dataStatText}>
                    {matches.length} Matches
                  </Text>
                </View>
                <View style={styles.dataStatItem}>
                  <Database size={16} color={colors.primary} />
                  <Text style={styles.dataStatText}>
                    {teams.length} Teams
                  </Text>
                </View>
              </View>
            )}
          </View>
          
          <View style={styles.tbaImportContainer}>
            <Text style={styles.tbaImportTitle}>Generate Scouting Records from Match Data</Text>
            <Text style={styles.tbaImportDescription}>
              Automatically create scouting records from imported match data.
              This is useful for analyzing past matches.
            </Text>
            
            <Button 
              title="Generate Scouting Records" 
              onPress={generateScoutingRecords}
              icon={<ClipboardList size={16} color={colors.white} />}
              style={styles.importButton}
              disabled={isGeneratingScoutingRecords || matches.length === 0}
            />
            
            {isGeneratingScoutingRecords && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>Generating records...</Text>
              </View>
            )}
            
            {records.length > 0 && (
              <View style={styles.dataStatsContainer}>
                <View style={styles.dataStatItem}>
                  <ClipboardList size={16} color={colors.primary} />
                  <Text style={styles.dataStatText}>
                    {records.length} Scouting Records
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          <TouchableOpacity 
            style={styles.dataButton}
            onPress={handleExportData}
          >
            <Download size={20} color={colors.text} />
            <Text style={styles.dataButtonText}>Export Data as JSON</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.dataButton}
            onPress={handleImportData}
          >
            <Upload size={20} color={colors.text} />
            <Text style={styles.dataButtonText}>Import Data from JSON</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.dataButton, styles.dangerButton]}
            onPress={handleClearData}
            disabled={isClearingData}
          >
            <Trash2 size={20} color={colors.danger} />
            <Text style={[styles.dataButtonText, styles.dangerText]}>
              {isClearingData ? "Clearing Data..." : "Clear All Data"}
            </Text>
            {isClearingData && (
              <ActivityIndicator 
                size="small" 
                color={colors.danger} 
                style={styles.clearingIndicator}
              />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutText}>FRC Scout App v1.0.0</Text>
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
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  inputContainer: {
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
  },
  saveButton: {
    marginBottom: 8,
  },
  apiKeyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  apiKeyInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginBottom: 12,
  },
  apiKeyIcon: {
    marginLeft: 12,
    marginRight: 8,
  },
  apiKeyInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
  getApiKeyLink: {
    marginTop: 4,
    marginBottom: 12,
  },
  getApiKeyText: {
    color: colors.primary,
    fontSize: 14,
  },
  tbaImportContainer: {
    marginTop: 16,
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tbaImportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  tbaImportDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  importButton: {
    marginBottom: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  loadingText: {
    marginLeft: 8,
    color: colors.textSecondary,
    fontSize: 14,
  },
  dataStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  dataStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[800],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  dataStatText: {
    color: colors.text,
    fontSize: 14,
    marginLeft: 6,
  },
  dataButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  dataButtonText: {
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
  clearingIndicator: {
    marginLeft: 8,
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  aboutText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
});