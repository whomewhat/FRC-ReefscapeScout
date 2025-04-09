import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { 
  Clock, 
  Tag, 
  Edit, 
  Trash2,
  Hash
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import Button from '@/components/Button';
import useAppStore from '@/store/app-store';
import { formatDate } from '@/utils/helpers';

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { notes, teams, removeNote } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  
  const note = notes.find(n => n.id === id);
  const team = note ? teams.find(t => t.id === note.teamId) : null;
  
  if (!note || !team) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Note not found</Text>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            removeNote(note.id);
            router.back();
          }
        },
      ]
    );
  };

  const handleEdit = () => {
    // In a real app, you'd navigate to an edit screen
    // For now, just toggle the edit state
    setIsEditing(!isEditing);
  };

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Note Details',
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                onPress={handleEdit}
                style={styles.headerButton}
              >
                <Edit size={24} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleDelete}
                style={styles.headerButton}
              >
                <Trash2 size={24} color={colors.danger} />
              </TouchableOpacity>
            </View>
          )
        }} 
      />
      
      <View style={styles.header}>
        <Text style={styles.teamName}>
          #{team.number} - {team.name}
        </Text>
        <View style={styles.timeContainer}>
          <Clock size={16} color={colors.textSecondary} />
          <Text style={styles.time}>{formatDate(note.timestamp)}</Text>
        </View>
      </View>
      
      {note.matchNumber && (
        <View style={styles.matchContainer}>
          <Hash size={16} color={colors.text} />
          <Text style={styles.matchNumber}>Match {note.matchNumber}</Text>
        </View>
      )}
      
      <View style={styles.contentContainer}>
        <Text style={styles.content}>{note.content}</Text>
      </View>
      
      {note.tags.length > 0 && (
        <View style={styles.tagsSection}>
          <View style={styles.sectionHeader}>
            <Tag size={16} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Tags</Text>
          </View>
          <View style={styles.tagsContainer}>
            {note.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
      
      <View style={styles.actionsContainer}>
        <Button 
          title="Delete Note" 
          onPress={handleDelete}
          variant="danger"
          icon={<Trash2 size={16} color={colors.text} />}
          style={styles.deleteButton}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  errorText: {
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
    marginTop: 24,
  },
  headerButtons: {
    flexDirection: 'row',
    marginRight: 16,
  },
  headerButton: {
    marginLeft: 16,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  teamName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  matchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  matchNumber: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 8,
  },
  contentContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  content: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  tagsSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: colors.gray[700],
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: colors.text,
  },
  actionsContainer: {
    padding: 16,
  },
  deleteButton: {
    marginTop: 16,
  },
});