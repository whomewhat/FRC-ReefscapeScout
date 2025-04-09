import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Clock, ChevronRight } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { UpcomingMatch } from '@/types';
import useAppStore from '@/store/app-store';

interface UpcomingMatchCardProps {
  match: UpcomingMatch;
  showMyTeam?: boolean;
}

export default function UpcomingMatchCard({ match, showMyTeam = true }: UpcomingMatchCardProps) {
  const router = useRouter();
  const { myTeamNumber, teams } = useAppStore();
  
  if (!match) return null;
  
  // Safely access alliance arrays
  const redAlliance = match.redAlliance || [];
  const blueAlliance = match.blueAlliance || [];
  
  // Check if my team is in this match
  const isMyTeamInMatch = showMyTeam && (
    (redAlliance.includes(myTeamNumber)) || 
    (blueAlliance.includes(myTeamNumber))
  );
  
  // Format match time
  const formatMatchTime = () => {
    if (match.scheduledTime) {
      const date = new Date(match.scheduledTime);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    if (!match.time && !match.predicted_time) return 'Time TBD';
    
    const timestamp = match.time || match.predicted_time || 0;
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Get team name by number
  const getTeamName = (teamNumber) => {
    if (!teamNumber) return 'Unknown Team';
    const team = teams.find(t => t && t.number === teamNumber);
    return team ? team.name : `Team ${teamNumber}`;
  };
  
  // Handle card press
  const handlePress = () => {
    if (match && match.id) {
      router.push(`/match/${match.id}`);
    }
  };
  
  // Get match number safely
  const matchNumber = match.matchNumber || match.match_number || 0;
  const matchType = match.matchType || match.comp_level || 'qualification';
  
  return (
    <TouchableOpacity 
      style={[
        styles.card,
        isMyTeamInMatch && styles.myTeamCard
      ]}
      onPress={handlePress}
    >
      <View style={styles.header}>
        <View style={styles.matchInfo}>
          <Text style={styles.matchNumber}>
            {matchType ? `${matchType.toUpperCase()} ` : ''}
            Match {matchNumber}
          </Text>
          <View style={styles.timeContainer}>
            <Clock size={14} color={colors.textSecondary} />
            <Text style={styles.time}>{formatMatchTime()}</Text>
          </View>
        </View>
        {isMyTeamInMatch && (
          <View style={styles.myTeamBadge}>
            <Text style={styles.myTeamText}>My Team</Text>
          </View>
        )}
      </View>
      
      <View style={styles.alliances}>
        <View style={[styles.alliance, styles.redAlliance]}>
          <Text style={styles.allianceLabel}>Red Alliance</Text>
          {redAlliance && redAlliance.length > 0 ? (
            redAlliance.map((teamNumber, index) => {
              if (!teamNumber) return null;
              return (
                <Text 
                  key={`red-${index}-${teamNumber}`} 
                  style={[
                    styles.teamNumber,
                    teamNumber === myTeamNumber && styles.myTeamNumber
                  ]}
                >
                  {teamNumber}
                  {teamNumber === myTeamNumber && ' (My Team)'}
                </Text>
              );
            })
          ) : (
            <Text style={styles.noTeams}>No teams assigned</Text>
          )}
        </View>
        
        <View style={[styles.alliance, styles.blueAlliance]}>
          <Text style={styles.allianceLabel}>Blue Alliance</Text>
          {blueAlliance && blueAlliance.length > 0 ? (
            blueAlliance.map((teamNumber, index) => {
              if (!teamNumber) return null;
              return (
                <Text 
                  key={`blue-${index}-${teamNumber}`} 
                  style={[
                    styles.teamNumber,
                    teamNumber === myTeamNumber && styles.myTeamNumber
                  ]}
                >
                  {teamNumber}
                  {teamNumber === myTeamNumber && ' (My Team)'}
                </Text>
              );
            })
          ) : (
            <Text style={styles.noTeams}>No teams assigned</Text>
          )}
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.viewDetails}>View Details</Text>
        <ChevronRight size={16} color={colors.primary} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  myTeamCard: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  matchInfo: {
    flex: 1,
  },
  matchNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  myTeamBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  myTeamText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primary,
  },
  alliances: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  alliance: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
  },
  redAlliance: {
    backgroundColor: colors.danger + '10',
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.danger + '30',
  },
  blueAlliance: {
    backgroundColor: colors.info + '10',
    borderWidth: 1,
    borderColor: colors.info + '30',
  },
  allianceLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.text,
  },
  teamNumber: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  myTeamNumber: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  noTeams: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  viewDetails: {
    fontSize: 14,
    color: colors.primary,
    marginRight: 4,
  },
});