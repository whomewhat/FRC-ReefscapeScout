import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Calendar, 
  Users, 
  Clock,
  ChevronRight,
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import useAppStore from '@/store/app-store';
import UpcomingMatchCard from '@/components/UpcomingMatchCard';

export default function HomeScreen() {
  const router = useRouter();
  const { 
    myTeamNumber, 
    teams = [], 
    upcomingMatches = [], 
    matches = [],
    onboardingCompleted
  } = useAppStore();
  
  const [refreshing, setRefreshing] = React.useState(false);
  
  useEffect(() => {
    // Check if onboarding is completed
    if (!onboardingCompleted) {
      router.replace('/onboarding');
    }
  }, [onboardingCompleted]);
  
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate a refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);
  
  // Get upcoming matches for my team
  const myTeamUpcomingMatches = (upcomingMatches || [])
    .filter(match => {
      if (!match) return false;
      const redAlliance = match.redAlliance || [];
      const blueAlliance = match.blueAlliance || [];
      return (
        (redAlliance.includes(myTeamNumber)) || 
        (blueAlliance.includes(myTeamNumber))
      );
    })
    .sort((a, b) => {
      if (!a || !b) return 0;
      const timeA = a.scheduledTime || a.time || a.predicted_time || 0;
      const timeB = b.scheduledTime || b.time || b.predicted_time || 0;
      return timeA - timeB;
    })
    .slice(0, 3);
  
  // Get next few upcoming matches
  const nextUpcomingMatches = (upcomingMatches || [])
    .filter(match => match !== undefined)
    .sort((a, b) => {
      if (!a || !b) return 0;
      const timeA = a.scheduledTime || a.time || a.predicted_time || 0;
      const timeB = b.scheduledTime || b.time || b.predicted_time || 0;
      return timeA - timeB;
    })
    .slice(0, 3);
  
  // Get my team info
  const myTeam = teams.find(team => team && team.number === myTeamNumber);
  
  // Get match stats
  const matchesPlayed = matches.length;
  const matchesWon = matches.filter(match => {
    if (!match) return false;
    const redAlliance = match.redAlliance || [];
    const blueAlliance = match.blueAlliance || [];
    const isInRedAlliance = redAlliance.includes(myTeamNumber);
    const isInBlueAlliance = blueAlliance.includes(myTeamNumber);
    
    return (isInRedAlliance && match.winner === 'red') || 
           (isInBlueAlliance && match.winner === 'blue');
  }).length;
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Team Info Card */}
        <View style={styles.teamCard}>
          <View style={styles.teamHeader}>
            <Text style={styles.teamNumber}>Team {myTeamNumber}</Text>
            <Text style={styles.teamName}>{myTeam?.name || 'My Team'}</Text>
          </View>
          
          <View style={styles.teamStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{matchesPlayed}</Text>
              <Text style={styles.statLabel}>Matches</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{matchesWon}</Text>
              <Text style={styles.statLabel}>Wins</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {matchesPlayed > 0 ? Math.round((matchesWon / matchesPlayed) * 100) : 0}%
              </Text>
              <Text style={styles.statLabel}>Win Rate</Text>
            </View>
          </View>
        </View>
        
        {/* My Upcoming Matches */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Calendar size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>My Upcoming Matches</Text>
          </View>
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={() => router.push('/(tabs)/matches')}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <ChevronRight size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        {myTeamUpcomingMatches.length > 0 ? (
          myTeamUpcomingMatches.map(match => {
            if (!match || !match.id) return null;
            return (
              <UpcomingMatchCard 
                key={match.id.toString()} 
                match={match} 
                showMyTeam={false}
              />
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No upcoming matches for your team</Text>
          </View>
        )}
        
        {/* Next Matches */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Clock size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Next Matches</Text>
          </View>
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={() => router.push('/(tabs)/matches')}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <ChevronRight size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        {nextUpcomingMatches.length > 0 ? (
          nextUpcomingMatches.map(match => {
            if (!match || !match.id) return null;
            return (
              <UpcomingMatchCard 
                key={match.id.toString()} 
                match={match} 
              />
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No upcoming matches scheduled</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  teamCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  teamHeader: {
    marginBottom: 16,
  },
  teamNumber: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  teamName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  teamStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 8,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: colors.primary,
  },
  emptyState: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});