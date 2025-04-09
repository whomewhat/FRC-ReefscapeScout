import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { colors } from '@/constants/colors';
import { Team } from '@/types';
import { getTeamAvatarUrl } from '@/utils/helpers';

interface TeamCardProps {
  team: Team;
  onPress?: (team: Team) => void;
  compact?: boolean;
}

export default function TeamCard({ team, onPress, compact }: TeamCardProps) {
  if (!team) return null;

  const handlePress = () => {
    if (onPress) {
      onPress(team);
    }
  };

  // Get team number from either number or team_number property
  const teamNumber = team.number || team.team_number || 0;
  
  // Get team name from either name or nickname property
  const teamName = team.name || team.nickname || `Team ${teamNumber}`;

  // Get avatar URL safely
  const avatarUrl = team.avatar || (teamNumber ? getTeamAvatarUrl(teamNumber) : 'https://via.placeholder.com/60');

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Image 
          source={{ uri: avatarUrl }}
          style={styles.compactAvatar}
        />
        <View style={styles.compactContent}>
          <Text style={styles.compactTeamNumber}>#{teamNumber || 'N/A'}</Text>
          <Text style={styles.compactName} numberOfLines={1}>{teamName}</Text>
        </View>
      </View>
    );
  }

  return (
    <Pressable 
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed
      ]}
      onPress={handlePress}
    >
      <Image 
        source={{ uri: avatarUrl }}
        style={styles.avatar}
      />
      <View style={styles.content}>
        <Text style={styles.teamNumber}>#{teamNumber || 'N/A'}</Text>
        <Text style={styles.name}>{teamName}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.8,
    backgroundColor: colors.gray[800],
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.gray[700],
  },
  content: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  teamNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 8,
    flex: 1,
  },
  compactAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray[700],
  },
  compactContent: {
    marginLeft: 8,
    flex: 1,
  },
  compactTeamNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },
  compactName: {
    fontSize: 14,
    color: colors.text,
  },
});