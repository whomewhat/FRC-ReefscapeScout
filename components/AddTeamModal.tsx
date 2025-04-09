import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
  Alert
} from 'react-native';
import { X } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import Button from '@/components/Button';
import { Team } from '@/types';

interface AddTeamModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (team: Omit<Team, 'id'>) => void;
}

export default function AddTeamModal({ visible, onClose, onSubmit }: AddTeamModalProps) {
  const [teamNumber, setTeamNumber] = useState('');
  const [teamName, setTeamName] = useState('');
  const [teamLocation, setTeamLocation] = useState('');
  
  const handleSubmit = () => {
    // Validate inputs
    if (!teamNumber.trim()) {
      Alert.alert('Error', 'Team number is required');
      return;
    }
    
    if (!teamName.trim()) {
      Alert.alert('Error', 'Team name is required');
      return;
    }
    
    const number = parseInt(teamNumber);
    if (isNaN(number)) {
      Alert.alert('Error', 'Team number must be a valid number');
      return;
    }
    
    // Create new team object
    const newTeam: Omit<Team, 'id'> = {
      number,
      name: teamName.trim(),
      location: teamLocation.trim() || undefined
    };
    
    // Submit the new team
    onSubmit(newTeam);
    
    // Reset form
    setTeamNumber('');
    setTeamName('');
    setTeamLocation('');
  };
  
  const handleClose = () => {
    // Reset form
    setTeamNumber('');
    setTeamName('');
    setTeamLocation('');
    onClose();
  };
  
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
            <Text style={styles.modalTitle}>Add New Team</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Team Number *</Text>
            <TextInput
              style={styles.input}
              value={teamNumber}
              onChangeText={setTeamNumber}
              placeholder="Enter team number"
              placeholderTextColor={colors.textSecondary}
              keyboardType="number-pad"
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Team Name *</Text>
            <TextInput
              style={styles.input}
              value={teamName}
              onChangeText={setTeamName}
              placeholder="Enter team name"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Location (Optional)</Text>
            <TextInput
              style={styles.input}
              value={teamLocation}
              onChangeText={setTeamLocation}
              placeholder="Enter team location"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          
          <View style={styles.buttonContainer}>
            <Button
              title="Cancel"
              onPress={handleClose}
              variant="outline"
              style={styles.button}
            />
            <Button
              title="Add Team"
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
    maxWidth: 400,
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