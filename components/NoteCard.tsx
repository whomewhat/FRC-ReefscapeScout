import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Clock, Tag } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { Note } from '@/types';
import { formatDate } from '@/utils/helpers';

interface NoteCardProps {
  note: Note;
  teamNumber: number;
  teamName: string;
  onPress: (note: Note) => void;
}

export default function NoteCard({ note, teamNumber, teamName, onPress }: NoteCardProps) {
  return (
    <Pressable 
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed
      ]}
      onPress={() => onPress(note)}
    >
      <View style={styles.header}>
        <Text style={styles.teamInfo}>
          #{teamNumber} - {teamName}
        </Text>
        <View style={styles.timeContainer}>
          <Clock size={12} color={colors.textSecondary} />
          <Text style={styles.time}>{formatDate(note.timestamp)}</Text>
        </View>
      </View>
      
      {note.matchNumber && (
        <View style={styles.matchBadge}>
          <Text style={styles.matchText}>Match {note.matchNumber}</Text>
        </View>
      )}
      
      <Text style={styles.content} numberOfLines={3}>
        {note.content}
      </Text>
      
      {note.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          <Tag size={14} color={colors.textSecondary} />
          <View style={styles.tags}>
            {note.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.8,
    backgroundColor: colors.gray[800],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  teamInfo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  matchBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.gray[700],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginBottom: 8,
  },
  matchText: {
    fontSize: 12,
    color: colors.text,
  },
  content: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: 8,
  },
  tag: {
    backgroundColor: colors.gray[700],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: colors.text,
  },
});