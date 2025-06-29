import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  Switch
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { 
  Save, 
  ArrowLeft, 
  Plus, 
  X, 
  ChevronDown, 
  ChevronUp,
  Calendar
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import Button from '@/components/Button';
import useAppStore from '@/store/app-store';

export default function CreateMatchScreen() {
  const router = useRouter();
  const { addMatch, teams = [] } = useAppStore();
  
  // Match details
  const [matchNumber, setMatchNumber] = useState('');
  const [matchType, setMatchType] = useState('Qualification');
  const [showMatchTypeDropdown, setShowMatchTypeDropdown] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [redScore, setRedScore] = useState('');
  const [blueScore, setBlueScore] = useState('');
  
  // Alliance teams
  const [redAlliance, setRedAlliance] = useState<number[]>([]);
  const [blueAlliance, setBlueAlliance] = useState<number[]>([]);
  
  // Team selection
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);
  const [teamSearchQuery, setTeamSearchQuery] = useState('');
  const [selectingFor, setSelectingFor] = useState<'red' | 'blue'>('red');
  
  // Filter teams based on search query
  const filteredTeams = teams ? teams.filter(team => {
    if (!team) return false;
    
    const query = teamSearchQuery.toLowerCase();
    const teamNumber = team.number ? team.number.toString() : '';
    const teamName = team.name ? team.name.toLowerCase() : '';
    
    return (
      teamNumber.includes(query) ||
      teamName.includes(query)
    );
  }).sort((a, b) => {
    if (!a || !a.number) return 1;
    if (!b || !b.number) return -1;
    return a.number - b.number;
  }) : [];
  
  const handleAddTeam = (teamNumber: number, alliance: 'red' | 'blue') => {
    if (alliance === 'red') {
      if (redAlliance.includes(teamNumber)) return;
      setRedAlliance([...redAlliance, teamNumber]);
    } else {
      if (blueAlliance.includes(teamNumber)) return;
      setBlueAlliance([...blueAlliance, teamNumber]);
    }
    setShowTeamDropdown(false);
  };
  
  const handleRemoveTeam = (teamNumber: number, alliance: 'red' | 'blue') => {
    if (alliance === 'red') {
      setRedAlliance(redAlliance.filter(t => t !== teamNumber));
    } else {
      setBlueAlliance(blueAlliance.filter(t => t !== teamNumber));
    }
  };
  
  const handleOpenTeamDropdown = (alliance: 'red' | 'blue') => {
    setSelectingFor(alliance);
    setShowTeamDropdown(true);
    setShowMatchTypeDropdown(false);
  };
  
  const handleSave = () => {
    // Validate match number
    if (!matchNumber.trim()) {
      Alert.alert('Missing Information', 'Please enter a match number.');
      return;
    }
    
    // Validate alliances
    if (redAlliance.length === 0 || blueAlliance.length === 0) {
      Alert.alert('Missing Information', 'Please add at least one team to each alliance.');
      return;
    }
    
    // Validate scores if match is completed
    if (completed) {
      if (!redScore.trim() || !blueScore.trim()) {
        Alert.alert('Missing Information', 'Please enter scores for both alliances.');
        return;
      }
    }
    
    // Create match object
    const match = {
      id: Date.now(),
      matchNumber: parseInt(matchNumber),
      matchType,
      completed,
      redAlliance,
      blueAlliance,
      redScore: completed ? parseInt(redScore) : undefined,
      blueScore: completed ? parseInt(blueScore) : undefined,
      winner: completed ? (
        parseInt(redScore) > parseInt(blueScore) ? 'red' : 
        parseInt(redScore) < parseInt(blueScore) ? 'blue' : 'tie'
      ) : undefined,
      time: Date.now(),
    };
    
    // Add match to store
    addMatch(match);
    
    // Show success message and navigate back
    Alert.alert('Success', 'Match created successfully.');
    router.back();
  };
  
  const handleCancel = () => {
    router.back();
  };
  
  const getTeamName = (teamNumber: number) => {
    const team = teams ? teams.find(t => t && t.number === teamNumber) : null;
    return team && team.name ? team.name : 'Unknown Team';
  };
  
  const matchTypes = ['Qualification', 'Practice', 'Playoff'];
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Create Match',
          headerLeft: () => (
            <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
              <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
              <Save size={24} color={colors.primary} />
            </TouchableOpacity>
          )
        }} 
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Match Details</Text>
          
          {/* Match Number */}
          <View style={styles.inputRow}>
            <View style={styles.inputIcon}>
              <Calendar size={20} color={colors.primary} />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Match Number</Text>
              <TextInput
                style={styles.input}
                value={matchNumber}
                onChangeText={setMatchNumber}
                placeholder="Enter match number"
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
              />
            </View>
          </View>
          
          {/* Match Type */}
          <View style={styles.dropdownContainer}>
            <Text style={styles.label}>Match Type</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => {
                setShowMatchTypeDropdown(!showMatchTypeDropdown);
                setShowTeamDropdown(false);
              }}
            >
              <Text style={styles.dropdownButtonText}>{matchType}</Text>
              {showMatchTypeDropdown ? (
                <ChevronUp size={20} color={colors.textSecondary} />
              ) : (
                <ChevronDown size={20} color={colors.textSecondary} />
              )}
            </TouchableOpacity>
            
            {showMatchTypeDropdown && (
              <View style={styles.dropdownMenu}>
                {matchTypes.map(type => (
                  <TouchableOpacity
                    key={type}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setMatchType(type);
                      setShowMatchTypeDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          
          {/* Completed Switch */}
          <View style={styles.switchRow}>
            <Text style={styles.label}>Match Completed</Text>
            <Switch
              value={completed}
              onValueChange={setCompleted}
              trackColor={{ false: colors.gray[600], true: colors.success }}
              thumbColor={colors.text}
            />
          </View>
          
          {/* Scores (only if completed) */}
          {completed && (
            <View style={styles.scoresContainer}>
              <View style={styles.scoreInputContainer}>
                <Text style={[styles.label, styles.redText]}>Red Score</Text>
                <TextInput
                  style={[styles.input, styles.redBorder]}
                  value={redScore}
                  onChangeText={setRedScore}
                  placeholder="0"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="number-pad"
                />
              </View>
              
              <View style={styles.scoreInputContainer}>
                <Text style={[styles.label, styles.blueText]}>Blue Score</Text>
                <TextInput
                  style={[styles.input, styles.blueBorder]}
                  value={blueScore}
                  onChangeText={setBlueScore}
                  placeholder="0"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="number-pad"
                />
              </View>
            </View>
          )}
        </View>
        
        <View style={[styles.section, styles.redSection]}>
          <Text style={[styles.sectionTitle, styles.redText]}>Red Alliance</Text>
          
          {/* Red Alliance Teams */}
          <View style={styles.teamsContainer}>
            {redAlliance.length > 0 ? (
              redAlliance.map(teamNumber => (
                <View key={teamNumber} style={styles.teamChip}>
                  <Text style={styles.teamChipText}>
                    {teamNumber} - {getTeamName(teamNumber)}
                  </Text>
                  <TouchableOpacity
                    style={styles.removeTeamButton}
                    onPress={() => handleRemoveTeam(teamNumber, 'red')}
                  >
                    <X size={16} color={colors.text} />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.noTeamsText}>No teams added</Text>
            )}
          </View>
          
          <Button
            title="Add Team"
            onPress={() => handleOpenTeamDropdown('red')}
            icon={<Plus size={16} color={colors.white} />}
            style={styles.addTeamButton}
          />
        </View>
        
        <View style={[styles.section, styles.blueSection]}>
          <Text style={[styles.sectionTitle, styles.blueText]}>Blue Alliance</Text>
          
          {/* Blue Alliance Teams */}
          <View style={styles.teamsContainer}>
            {blueAlliance.length > 0 ? (
              blueAlliance.map(teamNumber => (
                <View key={teamNumber} style={styles.teamChip}>
                  <Text style={styles.teamChipText}>
                    {teamNumber} - {getTeamName(teamNumber)}
                  </Text>
                  <TouchableOpacity
                    style={styles.removeTeamButton}
                    onPress={() => handleRemoveTeam(teamNumber, 'blue')}
                  >
                    <X size={16} color={colors.text} />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.noTeamsText}>No teams added</Text>
            )}
          </View>
          
          <Button
            title="Add Team"
            onPress={() => handleOpenTeamDropdown('blue')}
            icon={<Plus size={16} color={colors.white} />}
            style={styles.addTeamButton}
          />
        </View>
        
        {/* Team Selection Dropdown */}
        {showTeamDropdown && (
          <View style={styles.teamDropdownOverlay}>
            <View style={styles.teamDropdownContainer}>
              <View style={styles.teamDropdownHeader}>
                <Text style={styles.teamDropdownTitle}>
                  Select Team for {selectingFor === 'red' ? 'Red' : 'Blue'} Alliance
                </Text>
                <TouchableOpacity
                  style={styles.closeDropdownButton}
                  onPress={() => setShowTeamDropdown(false)}
                >
                  <X size={20} color={colors.text} />
                </TouchableOpacity>
              </View>
              
              <TextInput
                style={styles.teamSearchInput}
                placeholder="Search teams..."
                placeholderTextColor={colors.textSecondary}
                value={teamSearchQuery}
                onChangeText={setTeamSearchQuery}
              />
              
              <ScrollView style={styles.teamDropdownList}>
                {filteredTeams.map(team => {
                  if (!team || !team.number) return null;
                  return (
                    <TouchableOpacity
                      key={team.id?.toString() || team.number.toString()}
                      style={styles.teamDropdownItem}
                      onPress={() => handleAddTeam(team.number, selectingFor)}
                    >
                      <Text style={styles.teamDropdownItemText}>
                        {team.number} - {team.name || 'Unknown Team'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        )}
        
        <View style={styles.buttonContainer}>
          <Button
            title="Save Match"
            onPress={handleSave}
            icon={<Save size={16} color={colors.white} />}
            style={styles.saveButton}
            fullWidth
          />
          
          <Button
            title="Cancel"
            onPress={handleCancel}
            variant="outline"
            style={styles.cancelButton}
            fullWidth
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  redSection: {
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
  },
  blueSection: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  redText: {
    color: colors.danger,
  },
  blueText: {
    color: colors.primary,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  inputIcon: {
    width: 40,
    alignItems: 'center',
  },
  inputContainer: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    color: colors.text,
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
  },
  redBorder: {
    borderColor: colors.danger,
  },
  blueBorder: {
    borderColor: colors.primary,
  },
  dropdownContainer: {
    marginBottom: 16,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: colors.text,
  },
  dropdownMenu: {
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 4,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownItemText: {
    fontSize: 16,
    color: colors.text,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  scoreInputContainer: {
    flex: 1,
  },
  teamsContainer: {
    marginBottom: 16,
  },
  teamChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 8,
  },
  teamChipText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  removeTeamButton: {
    padding: 4,
  },
  noTeamsText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: 16,
  },
  addTeamButton: {
    marginBottom: 8,
  },
  teamDropdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  teamDropdownContainer: {
    backgroundColor: colors.background,
    borderRadius: 12,
    width: '100%',
    maxHeight: '80%',
    padding: 16,
  },
  teamDropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  teamDropdownTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeDropdownButton: {
    padding: 4,
  },
  teamSearchInput: {
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  },
  teamDropdownList: {
    maxHeight: 300,
  },
  teamDropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  teamDropdownItemText: {
    fontSize: 16,
    color: colors.text,
  },
  buttonContainer: {
    padding: 16,
    gap: 12,
  },
  saveButton: {
    marginBottom: 8,
  },
  cancelButton: {
    marginBottom: 16,
  },
});