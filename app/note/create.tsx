import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { 
  Tag, 
  X, 
  Plus,
  Hash,
  Star,
  Save,
  Check
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import Button from '@/components/Button';
import TagSelector from '@/components/TagSelector';
import useAppStore from '@/store/app-store';
import { Note } from '@/types';
import { generateId } from '@/utils/helpers';

export default function CreateNoteScreen() {
  const { teamId, matchNumber: matchNumberParam } = useLocalSearchParams<{ teamId?: string, matchNumber?: string }>();
  const router = useRouter();
  const { teams, addNote } = useAppStore();
  
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(
    teamId ? parseInt(teamId) : null
  );
  const [content, setContent] = useState('');
  const [matchNumber, setMatchNumber] = useState(matchNumberParam || '');
  const [tags, setTags] = useState<string[]>([]);
  const [teamDropdownOpen, setTeamDropdownOpen] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    if (!selectedTeamId) {
      Alert.alert('Error', 'Please select a team');
      return;
    }

    if (!content.trim()) {
      Alert.alert('Error', 'Please enter note content');
      return;
    }

    setIsSaving(true);

    const newNote: Note = {
      id: generateId(),
      teamId: selectedTeamId,
      content: content.trim(),
      timestamp: Date.now(),
      tags,
    };

    if (matchNumber) {
      const matchNum = parseInt(matchNumber);
      if (!isNaN(matchNum)) {
        newNote.matchNumber = matchNum;
      }
    }

    // Simulate a brief delay to show the saving indicator
    setTimeout(() => {
      addNote(newNote);
      
      // If rating was provided, we could add a rating here too
      if (rating > 0) {
        // This would be implemented in a real app
        console.log(`Rating for team ${selectedTeamId}: ${rating}`);
      }
      
      setIsSaving(false);
      setSaveSuccess(true);
      
      // Show success message and navigate back after a short delay
      setTimeout(() => {
        router.back();
      }, 1500);
    }, 500);
  };

  const getTeamName = (id: number) => {
    const team = teams.find(t => t.id === id);
    return team ? `#${team.number} - ${team.name}` : 'Select a team';
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <Stack.Screen 
        options={{ 
          title: 'New Note',
          headerRight: () => (
            <TouchableOpacity 
              onPress={handleSave} 
              style={styles.saveButton}
              disabled={isSaving || saveSuccess}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : saveSuccess ? (
                <Check size={24} color={colors.success} />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          )
        }} 
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.formSection}>
          <Text style={styles.label}>Team</Text>
          <TouchableOpacity 
            style={styles.teamSelector}
            onPress={() => setTeamDropdownOpen(!teamDropdownOpen)}
          >
            <Text style={styles.teamSelectorText}>
              {selectedTeamId ? getTeamName(selectedTeamId) : 'Select a team'}
            </Text>
          </TouchableOpacity>
          
          {teamDropdownOpen && (
            <View style={styles.teamDropdown}>
              <ScrollView style={styles.teamList} nestedScrollEnabled>
                {teams.map(team => (
                  <TouchableOpacity 
                    key={team.id}
                    style={styles.teamItem}
                    onPress={() => {
                      setSelectedTeamId(team.id);
                      setTeamDropdownOpen(false);
                    }}
                  >
                    <Text style={styles.teamItemText}>
                      #{team.number} - {team.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.label}>Match Number (Optional)</Text>
          <View style={styles.matchInputContainer}>
            <Hash size={20} color={colors.textSecondary} style={styles.matchIcon} />
            <TextInput
              style={styles.matchInput}
              value={matchNumber}
              onChangeText={setMatchNumber}
              placeholder="Enter match number"
              placeholderTextColor={colors.textSecondary}
              keyboardType="number-pad"
            />
          </View>
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.label}>Note</Text>
          <TextInput
            style={styles.contentInput}
            value={content}
            onChangeText={setContent}
            placeholder="Enter your observations about this team..."
            placeholderTextColor={colors.textSecondary}
            multiline
            textAlignVertical="top"
          />
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.label}>Tags</Text>
          <TagSelector 
            selectedTags={tags}
            onTagsChange={setTags}
          />
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.label}>Quick Rating (Optional)</Text>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                style={styles.starButton}
              >
                <Star 
                  size={32} 
                  color={colors.warning} 
                  fill={rating >= star ? colors.warning : 'transparent'} 
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {saveSuccess && (
          <View style={styles.successMessage}>
            <Check size={20} color={colors.success} />
            <Text style={styles.successText}>Note saved successfully!</Text>
          </View>
        )}
      </ScrollView>
      
      <View style={styles.buttonContainer}>
        <Button 
          title={isSaving ? "Saving..." : saveSuccess ? "Saved!" : "Save Note"}
          onPress={handleSave}
          fullWidth
          loading={isSaving}
          disabled={isSaving || saveSuccess}
          icon={isSaving ? undefined : saveSuccess ? <Check size={16} color={colors.text} /> : <Save size={16} color={colors.text} />}
          style={saveSuccess ? styles.successButton : undefined}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  saveButton: {
    marginRight: 16,
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: 'bold',
  },
  formSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  teamSelector: {
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
  },
  teamSelectorText: {
    fontSize: 16,
    color: colors.text,
  },
  teamDropdown: {
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 8,
    maxHeight: 200,
  },
  teamList: {
    padding: 8,
  },
  teamItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  teamItemText: {
    fontSize: 16,
    color: colors.text,
  },
  matchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
  },
  matchIcon: {
    marginRight: 8,
  },
  matchInput: {
    flex: 1,
    height: 48,
    color: colors.text,
    fontSize: 16,
  },
  contentInput: {
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    minHeight: 150,
    color: colors.text,
    fontSize: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  starButton: {
    padding: 8,
  },
  buttonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  successMessage: {
    margin: 16,
    padding: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  successText: {
    color: colors.success,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  successButton: {
    backgroundColor: colors.success,
  }
});