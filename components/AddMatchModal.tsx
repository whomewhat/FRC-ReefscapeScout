import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
  Alert,
  ScrollView,
  FlatList
} from 'react-native';
import { X, Plus, Minus } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import Button from '@/components/Button';
import { Match, Team } from '@/types';

interface AddMatchModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (match: Omit<Match, 'id'>) => void;
  teams: Team[];
}

export default function AddMatchModal({ visible, onClose, onSubmit, teams }: AddMatchModalProps) {
  const [matchNumber, setMatchNumber] = useState('');
  const [matchTime, setMatchTime] = useState('');
  const [redAlliance, setRedAlliance] = useState<number[]>([]);
  const [blueAlliance, setBlueAlliance] = useState<number[]>([]);
  const [teamSearchQuery, setTeamSearchQuery] = useState('');
  const [selectingFor, setSelectingFor] = useState<'red' | 'blue' | null>(null);
  
  const filteredTeams = teams.filter(team => {
    const query = teamSearchQuery.toLowerCase();
    return (
      team.number.toString().includes(query) ||
      team.name.toLowerCase().includes(query) ||
      (team.location && team.location.toLowerCase().includes(query))
    );
  });
  
  const handleSubmit = () => {
    // Validate inputs
    if (!matchNumber.trim()) {
      Alert.alert('Error', 'Match number is required');
      return;
    }
    
    const number = parseInt(matchNumber);
    if (isNaN(number)) {
      Alert.alert('Error', 'Match number must be a valid number');
      return;
    }
    
    if (redAlliance.length !== 3) {
      Alert.alert('Error', 'Red alliance must have exactly 3 teams');
      return;
    }
    
    if (blueAlliance.length !== 3) {
      Alert.alert('Error', 'Blue alliance must have exactly 3 teams');
      return;
    }
    
    // Create new match object
    const newMatch: Omit<Match, 'id'> = {
      matchNumber: number,
      redAlliance,
      blueAlliance,
      time: matchTime.trim() || undefined,
      completed: false,
      matchType: 'Qualification'
    };
    
    // Submit the new match
    onSubmit(newMatch);
    
    // Reset form
    resetForm();
  };
  
  const resetForm = () => {
    setMatchNumber('');
    setMatchTime('');
    setRedAlliance([]);
    setBlueAlliance([]);
    setTeamSearchQuery('');
    setSelectingFor(null);
  };
  
  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  const handleAddTeam = (teamNumber: number) => {
    if (selectingFor === 'red') {
      if (redAlliance.length >= 3) {
        Alert.alert('Error', 'Red alliance already has 3 teams');
        return;
      }
      
      if (redAlliance.includes(teamNumber) || blueAlliance.includes(teamNumber)) {
        Alert.alert('Error', 'This team is already in an alliance');
        return;
      }
      
      setRedAlliance([...redAlliance, teamNumber]);
    } else if (selectingFor === 'blue') {
      if (blueAlliance.length >= 3) {
        Alert.alert('Error', 'Blue alliance already has 3 teams');
        return;
      }
      
      if (redAlliance.includes(teamNumber) || blueAlliance.includes(teamNumber)) {
        Alert.alert('Error', 'This team is already in an alliance');
        return;
      }
      
      setBlueAlliance([...blueAlliance, teamNumber]);
    }
    
    setTeamSearchQuery('');
  };
  
  const handleRemoveTeam = (alliance: 'red' | 'blue', teamNumber: number) => {
    if (alliance === 'red') {
      setRedAlliance(redAlliance.filter(t => t !== teamNumber));
    } else {
      setBlueAlliance(blueAlliance.filter(t => t !== teamNumber));
    }
  };
  
  const renderTeamItem = ({ item }: { item: Team }) => (
    <TouchableOpacity
      style={styles.teamItem}
      onPress={() => handleAddTeam(item.number)}
    >
      <Text style={styles.teamNumber}>#{item.number}</Text>
      <Text style={styles.teamName}>{item.name}</Text>
    </TouchableOpacity>
  );
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Match</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Match Number *</Text>
              <TextInput
                style={styles.input}
                value={matchNumber}
                onChangeText={setMatchNumber}
                placeholder="Enter match number"
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Match Time (Optional)</Text>
              <TextInput
                style={styles.input}
                value={matchTime}
                onChangeText={setMatchTime}
                placeholder="e.g. 10:30 AM"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            
            <View style={styles.allianceSection}>
              <View style={styles.allianceHeader}>
                <View style={[styles.allianceIndicator, styles.redIndicator]} />
                <Text style={styles.allianceTitle}>Red Alliance</Text>
                <TouchableOpacity 
                  style={[
                    styles.addTeamButton,
                    redAlliance.length >= 3 && styles.disabledButton
                  ]}
                  onPress={() => setSelectingFor(selectingFor === 'red' ? null : 'red')}
                  disabled={redAlliance.length >= 3}
                >
                  <Plus size={16} color={redAlliance.length >= 3 ? colors.gray[500] : colors.text} />
                  <Text style={[
                    styles.addTeamText,
                    redAlliance.length >= 3 && styles.disabledText
                  ]}>
                    Add Team
                  </Text>
                </TouchableOpacity>
              </View>
              
              {redAlliance.map(teamNumber => {
                const team = teams.find(t => t.number === teamNumber);
                return (
                  <View key={teamNumber} style={styles.selectedTeam}>
                    <Text style={styles.selectedTeamNumber}>#{teamNumber}</Text>
                    <Text style={styles.selectedTeamName}>{team?.name || 'Unknown Team'}</Text>
                    <TouchableOpacity 
                      style={styles.removeTeamButton}
                      onPress={() => handleRemoveTeam('red', teamNumber)}
                    >
                      <Minus size={16} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                );
              })}
              
              {redAlliance.length === 0 && (
                <Text style={styles.emptyAlliance}>No teams selected</Text>
              )}
            </View>
            
            <View style={styles.allianceSection}>
              <View style={styles.allianceHeader}>
                <View style={[styles.allianceIndicator, styles.blueIndicator]} />
                <Text style={styles.allianceTitle}>Blue Alliance</Text>
                <TouchableOpacity 
                  style={[
                    styles.addTeamButton,
                    blueAlliance.length >= 3 && styles.disabledButton
                  ]}
                  onPress={() => setSelectingFor(selectingFor === 'blue' ? null : 'blue')}
                  disabled={blueAlliance.length >= 3}
                >
                  <Plus size={16} color={blueAlliance.length >= 3 ? colors.gray[500] : colors.text} />
                  <Text style={[
                    styles.addTeamText,
                    blueAlliance.length >= 3 && styles.disabledText
                  ]}>
                    Add Team
                  </Text>
                </TouchableOpacity>
              </View>
              
              {blueAlliance.map(teamNumber => {
                const team = teams.find(t => t.number === teamNumber);
                return (
                  <View key={teamNumber} style={styles.selectedTeam}>
                    <Text style={styles.selectedTeamNumber}>#{teamNumber}</Text>
                    <Text style={styles.selectedTeamName}>{team?.name || 'Unknown Team'}</Text>
                    <TouchableOpacity 
                      style={styles.removeTeamButton}
                      onPress={() => handleRemoveTeam('blue', teamNumber)}
                    >
                      <Minus size={16} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                );
              })}
              
              {blueAlliance.length === 0 && (
                <Text style={styles.emptyAlliance}>No teams selected</Text>
              )}
            </View>
            
            {selectingFor && (
              <View style={styles.teamSelector}>
                <View style={styles.teamSelectorHeader}>
                  <Text style={styles.teamSelectorTitle}>
                    Select Team for {selectingFor === 'red' ? 'Red' : 'Blue'} Alliance
                  </Text>
                  <TouchableOpacity onPress={() => setSelectingFor(null)}>
                    <X size={20} color={colors.text} />
                  </TouchableOpacity>
                </View>
                
                <TextInput
                  style={styles.teamSearchInput}
                  value={teamSearchQuery}
                  onChangeText={setTeamSearchQuery}
                  placeholder="Search teams..."
                  placeholderTextColor={colors.textSecondary}
                />
                
                <FlatList
                  data={filteredTeams}
                  renderItem={renderTeamItem}
                  keyExtractor={item => item.id.toString()}
                  style={styles.teamList}
                  nestedScrollEnabled
                />
              </View>
            )}
          </ScrollView>
          
          <View style={styles.buttonContainer}>
            <Button
              title="Cancel"
              onPress={handleClose}
              variant="outline"
              style={styles.button}
            />
            <Button
              title="Add Match"
              onPress={handleSubmit}
              style={styles.button}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  formGroup: {
    marginBottom: 16,
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
  allianceSection: {
    marginBottom: 24,
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
  },
  allianceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  allianceIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  redIndicator: {
    backgroundColor: colors.danger,
  },
  blueIndicator: {
    backgroundColor: colors.primary,
  },
  allianceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  addTeamButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[800],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  disabledButton: {
    backgroundColor: colors.gray[700],
  },
  addTeamText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 4,
  },
  disabledText: {
    color: colors.gray[500],
  },
  selectedTeam: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[800],
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  selectedTeamNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginRight: 8,
  },
  selectedTeamName: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  removeTeamButton: {
    padding: 4,
  },
  emptyAlliance: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 12,
  },
  teamSelector: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  teamSelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  teamSelectorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  teamSearchInput: {
    backgroundColor: colors.gray[800],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
  },
  teamList: {
    maxHeight: 200,
  },
  teamItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[800],
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  teamNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginRight: 8,
  },
  teamName: {
    fontSize: 14,
    color: colors.text,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
});