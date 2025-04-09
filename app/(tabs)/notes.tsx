import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity,
  Text
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus, ClipboardList } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import Button from '@/components/Button';
import EmptyState from '@/components/EmptyState';
import useAppStore from '@/store/app-store';
import NoteCard from '@/components/NoteCard';

export default function NotesScreen() {
  const router = useRouter();
  const { notes = [], teams = [] } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotes = notes.filter(note => {
    if (!note) return false;
    const query = searchQuery.toLowerCase();
    const team = teams.find(t => t && t.id === note.teamId);
    
    return (
      note.content.toLowerCase().includes(query) ||
      (team && team.name && team.name.toLowerCase().includes(query)) ||
      (team && team.number && team.number.toString().includes(query)) ||
      (note.tags && note.tags.some(tag => tag.toLowerCase().includes(query)))
    );
  }).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  const handleNotePress = (note) => {
    if (!note || !note.id) return;
    router.push(`/note/${note.id}`);
  };

  const handleAddNote = () => {
    router.push('/note/create');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.searchContainer}>
        <Search size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search notes..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddNote}>
          <Plus size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {!notes || notes.length === 0 ? (
        <EmptyState
          icon={<ClipboardList size={64} color={colors.primary} />}
          title="No Notes Yet"
          message="Add notes about teams to track their performance and capabilities."
          action={
            <Button 
              title="Add Note" 
              onPress={handleAddNote} 
              icon={<Plus size={16} color={colors.white} />}
            />
          }
        />
      ) : (
        <FlatList
          data={filteredNotes}
          keyExtractor={(item) => item && item.id ? item.id.toString() : Math.random().toString()}
          renderItem={({ item }) => (
            <NoteCard 
              note={item} 
              onPress={() => handleNotePress(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      <TouchableOpacity 
        style={styles.fab} 
        onPress={handleAddNote}
        activeOpacity={0.8}
      >
        <Plus size={24} color={colors.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    color: colors.text,
    fontSize: 16,
  },
  addButton: {
    padding: 8,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // Extra padding for FAB
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});