import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '@/constants/colors';
import { Match } from '@/types';

interface MatchCardProps {
  match: Match;
  myTeamNumber?: number | null;
  onPress: () => void;
  compact?: boolean;
}

const MatchCard: React.FC<MatchCardProps> = ({
  match,
  myTeamNumber,
  onPress,
  compact = false
}) => {
  if (!match) return null;
  
  // Check if this match involves the user's team
  const redAlliance = match.redAlliance || [];
  const blueAlliance = match.blueAlliance || [];
  
  const isMyTeamRed = myTeamNumber ? redAlliance.includes(myTeamNumber) : false;
  const isMyTeamBlue = myTeamNumber ? blueAlliance.includes(myTeamNumber) : false;
  
  const redWon = match.redScore !== undefined && match.blueScore !== undefined && match.redScore > match.blueScore;
  const blueWon = match.redScore !== undefined && match.blueScore !== undefined && match.blueScore > match.redScore;
  const tie = match.redScore !== undefined && match.blueScore !== undefined && match.redScore === match.blueScore;
  
  const myTeamWon = (isMyTeamRed && redWon) || (isMyTeamBlue && blueWon);
  const myTeamLost = (isMyTeamRed && blueWon) || (isMyTeamBlue && redWon);
  
  // Format match type for display
  const formatMatchType = (type: string = 'qualification') => {
    switch (type.toLowerCase()) {
      case 'qualification':
        return 'Qualification';
      case 'practice':
        return 'Practice';
      case 'playoff':
        return 'Playoff';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };
  
  return (
    <TouchableOpacity 
      style={[
        styles.container,
        compact && styles.compactContainer,
        isMyTeamRed && styles.myTeamRedContainer,
        isMyTeamBlue && styles.myTeamBlueContainer
      ]}
      onPress={onPress}
    >
      <View style={styles.matchInfo}>
        <Text style={styles.matchNumber}>Match {match.matchNumber || 'N/A'}</Text>
        {!compact && (
          <Text style={styles.matchType}>{formatMatchType(match.matchType)}</Text>
        )}
      </View>
      
      <View style={styles.alliances}>
        <View style={[
          styles.alliance, 
          styles.redAlliance,
          redWon && styles.winningAlliance
        ]}>
          <View style={styles.allianceHeader}>
            <View style={styles.redDot} />
            <Text style={styles.allianceLabel}>Red Alliance</Text>
            <Text style={[
              styles.score, 
              redWon && styles.winningScore
            ]}>
              {match.redScore !== undefined ? match.redScore : '-'}
            </Text>
          </View>
          
          {!compact && (
            <View style={styles.teams}>
              {(redAlliance || []).map((team: number) => (
                <Text 
                  key={team} 
                  style={[
                    styles.team,
                    myTeamNumber && team === myTeamNumber && styles.myTeam
                  ]}
                >
                  {team}
                </Text>
              ))}
            </View>
          )}
        </View>
        
        <View style={[
          styles.alliance, 
          styles.blueAlliance,
          blueWon && styles.winningAlliance
        ]}>
          <View style={styles.allianceHeader}>
            <View style={styles.blueDot} />
            <Text style={styles.allianceLabel}>Blue Alliance</Text>
            <Text style={[
              styles.score, 
              blueWon && styles.winningScore
            ]}>
              {match.blueScore !== undefined ? match.blueScore : '-'}
            </Text>
          </View>
          
          {!compact && (
            <View style={styles.teams}>
              {(blueAlliance || []).map((team: number) => (
                <Text 
                  key={team} 
                  style={[
                    styles.team,
                    myTeamNumber && team === myTeamNumber && styles.myTeam
                  ]}
                >
                  {team}
                </Text>
              ))}
            </View>
          )}
        </View>
      </View>
      
      {myTeamNumber && !compact && (match.redScore !== undefined || match.blueScore !== undefined) && (
        <View style={styles.resultBadge}>
          {myTeamWon && (
            <Text style={[styles.resultText, styles.winText]}>Win</Text>
          )}
          {myTeamLost && (
            <Text style={[styles.resultText, styles.lossText]}>Loss</Text>
          )}
          {tie && (
            <Text style={[styles.resultText, styles.tieText]}>Tie</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  compactContainer: {
    padding: 12,
    marginBottom: 8,
  },
  myTeamRedContainer: {
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
  },
  myTeamBlueContainer: {
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  matchInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  matchNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  matchType: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  alliances: {
    gap: 12,
  },
  alliance: {
    backgroundColor: colors.gray[800],
    borderRadius: 8,
    padding: 12,
  },
  redAlliance: {
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
  },
  blueAlliance: {
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  winningAlliance: {
    borderWidth: 1,
    borderColor: colors.success,
  },
  allianceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
    marginRight: 8,
  },
  blueDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.info,
    marginRight: 8,
  },
  allianceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  score: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  winningScore: {
    color: colors.success,
  },
  teams: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  team: {
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  myTeam: {
    fontWeight: 'bold',
    backgroundColor: colors.primary,
    color: colors.white,
  },
  resultBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  resultText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  winText: {
    color: colors.success,
  },
  lossText: {
    color: colors.danger,
  },
  tieText: {
    color: colors.warning,
  },
});

export default MatchCard;