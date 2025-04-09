import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { 
  ArrowLeft, 
  ClipboardList, 
  CalendarDays, 
  Award, 
  BarChart,
  Star,
  Clock,
  MapPin,
  Plus,
  RefreshCw
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import Button from '@/components/Button';
import MatchCard from '@/components/MatchCard';
import NoteCard from '@/components/NoteCard';
import ScoutingRecordCard from '@/components/ScoutingRecordCard';
import useAppStore from '@/store/app-store';
import useScoutingStore from '@/store/scouting-store';
import { getTeamAwards } from '@/utils/tba-api';

export default function TeamDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { teams = [], matches = [], notes = [], tbaApiKey } = useAppStore();
  const { records = [] } = useScoutingStore();
  
  const [activeTab, setActiveTab] = useState<'matches' | 'notes' | 'scouting'>('matches');
  const [teamAwards, setTeamAwards] = useState<any[]>([]);
  const [isLoadingAwards, setIsLoadingAwards] = useState(false);
  
  const teamId = parseInt(id as string);
  const team = teams.find(t => t.id === teamId);
  
  // Get team matches
  const teamMatches = team ? matches.filter(match => {
    return match.redAlliance.includes(team.number) || match.blueAlliance.includes(team.number);
  }).sort((a, b) => a.matchNumber - b.matchNumber) : [];
  
  // Get team notes
  const teamNotes = notes.filter(note => note.teamId === teamId)
    .sort((a, b) => b.createdAt - a.createdAt);
  
  // Get team scouting records
  const teamScoutingRecords = records.filter(record => record.teamId === teamId)
    .sort((a, b) => b.timestamp - a.timestamp);
  
  // Calculate team stats
  const calculateTeamStats = () => {
    if (!teamScoutingRecords || teamScoutingRecords.length === 0) {
      return {
        averageScore: 0,
        averageAuto: 0,
        averageTeleop: 0,
        averageEndgame: 0,
        defenseRating: 0,
        matchesPlayed: teamMatches ? teamMatches.length : 0,
        matchesWon: 0,
        winRate: 0
      };
    }
    
    let totalScore = 0;
    let totalAuto = 0;
    let totalTeleop = 0;
    let totalEndgame = 0;
    let totalDefense = 0;
    
    teamScoutingRecords.forEach(record => {
      // Auto points
      const autoPoints = 
        (record.autoCoralL1 || 0) * 3 + 
        (record.autoCoralL2 || 0) * 4 + 
        (record.autoCoralL3 || 0) * 6 + 
        (record.autoCoralL4 || 0) * 7 +
        (record.autoAlgaeProcessor || 0) * 6 + 
        (record.autoAlgaeNet || 0) * 4;
      
      // Teleop points
      const teleopPoints = 
        (record.teleopCoralL1 || 0) * 2 + 
        (record.teleopCoralL2 || 0) * 3 + 
        (record.teleopCoralL3 || 0) * 4 + 
        (record.teleopCoralL4 || 0) * 5 +
        (record.teleopAlgaeProcessor || 0) * 6 + 
        (record.teleopAlgaeNet || 0) * 4;
      
      // Endgame points
      let endgamePoints = 0;
      if (record.endgameStatus) {
        switch (record.endgameStatus) {
          case 'parked': endgamePoints = 2; break;
          case 'shallowCage': endgamePoints = 6; break;
          case 'deepCage': endgamePoints = 12; break;
        }
      } else if (record.bargeLevel !== undefined) {
        switch (record.bargeLevel) {
          case 1: endgamePoints = 2; break;
          case 2: endgamePoints = 6; break;
          case 3: endgamePoints = 12; break;
        }
      }
      
      totalAuto += autoPoints;
      totalTeleop += teleopPoints;
      totalEndgame += endgamePoints;
      totalScore += autoPoints + teleopPoints + endgamePoints;
      totalDefense += record.defenseRating || 0;
    });
    
    // Calculate matches won
    let matchesWon = 0;
    if (team && teamMatches) {
      matchesWon = teamMatches.filter(match => {
        if (!match.completed || match.redScore === undefined || match.blueScore === undefined) {
          return false;
        }
        
        const isRed = match.redAlliance.includes(team.number);
        return isRed ? match.redScore > match.blueScore : match.blueScore > match.redScore;
      }).length;
    }
    
    return {
      averageScore: Math.round(totalScore / teamScoutingRecords.length),
      averageAuto: Math.round(totalAuto / teamScoutingRecords.length),
      averageTeleop: Math.round(totalTeleop / teamScoutingRecords.length),
      averageEndgame: Math.round(totalEndgame / teamScoutingRecords.length),
      defenseRating: parseFloat((totalDefense / teamScoutingRecords.length).toFixed(1)),
      matchesPlayed: teamMatches ? teamMatches.length : 0,
      matchesWon,
      winRate: teamMatches && teamMatches.length > 0 ? Math.round((matchesWon / teamMatches.length) * 100) : 0
    };
  };
  
  const teamStats = calculateTeamStats();
  
  // Get team experience (years competing)
  const getTeamExperience = () => {
    if (!team || !team.rookie_year) return 'Unknown';
    const currentYear = new Date().getFullYear();
    const yearsCompeting = currentYear - team.rookie_year;
    return `${yearsCompeting} years`;
  };
  
  // Fetch team awards from TBA
  const fetchTeamAwards = async () => {
    if (!team) return;
    if (!tbaApiKey) {
      Alert.alert('API Key Required', 'Please set your TBA API key in Settings first.');
      return;
    }
    
    setIsLoadingAwards(true);
    try {
      const awards = await getTeamAwards(team.number, tbaApiKey);
      setTeamAwards(awards);
    } catch (error) {
      console.error('Error fetching team awards:', error);
      Alert.alert('Error', 'Failed to fetch team awards. Please try again later.');
    } finally {
      setIsLoadingAwards(false);
    }
  };
  
  useEffect(() => {
    if (team && tbaApiKey) {
      fetchTeamAwards();
    }
  }, [team, tbaApiKey]);
  
  if (!team) {
    return (
      <View style={styles.container}>
        <Stack.Screen 
          options={{ 
            title: 'Team Details',
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                <ArrowLeft size={24} color={colors.text} />
              </TouchableOpacity>
            )
          }} 
        />
        <Text style={styles.errorText}>Team not found</Text>
      </View>
    );
  }

  const handleAddNote = () => {
    router.push({
      pathname: '/note/create',
      params: { teamId: team.id.toString() }
    });
  };

  const handleAddScoutingRecord = () => {
    router.push({
      pathname: '/(tabs)/scouting/create',
      params: { teamId: team.id.toString() }
    });
  };

  const handleNotePress = (noteId: string) => {
    router.push(`/note/${noteId}`);
  };

  const handleMatchPress = (matchId: string) => {
    router.push(`/match/${matchId}`);
  };
  
  const handleScoutingRecordPress = (recordId: string) => {
    router.push(`/scouting/${recordId}`);
  };

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'matches':
        return (
          <>
            {!teamMatches || teamMatches.length === 0 ? (
              <View style={styles.emptyState}>
                <CalendarDays size={48} color={colors.gray[500]} />
                <Text style={styles.emptyStateTitle}>No Matches</Text>
                <Text style={styles.emptyStateMessage}>
                  This team doesn't have any scheduled matches yet.
                </Text>
              </View>
            ) : (
              <FlatList
                data={teamMatches}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <MatchCard 
                    match={item} 
                    teams={teams}
                    onPress={() => handleMatchPress(item.id.toString())}
                    highlightTeam={team.number}
                  />
                )}
                contentContainerStyle={styles.listContent}
              />
            )}
          </>
        );
      
      case 'notes':
        return (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Team Notes</Text>
              <TouchableOpacity onPress={handleAddNote}>
                <Plus size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
            
            {!teamNotes || teamNotes.length === 0 ? (
              <View style={styles.emptyState}>
                <ClipboardList size={48} color={colors.gray[500]} />
                <Text style={styles.emptyStateTitle}>No Notes</Text>
                <Text style={styles.emptyStateMessage}>
                  Add notes about this team's performance, strategy, or robot.
                </Text>
                <Button 
                  title="Add Note" 
                  onPress={handleAddNote}
                  variant="outline"
                  size="small"
                  icon={<Plus size={14} color={colors.primary} />}
                  style={styles.emptyStateButton}
                />
              </View>
            ) : (
              <FlatList
                data={teamNotes}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <NoteCard 
                    note={item} 
                    onPress={() => handleNotePress(item.id)}
                    showTeam={false}
                  />
                )}
                contentContainerStyle={styles.listContent}
              />
            )}
          </>
        );
      
      case 'scouting':
        return (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Scouting Records</Text>
              <TouchableOpacity onPress={handleAddScoutingRecord}>
                <Plus size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
            
            {!teamScoutingRecords || teamScoutingRecords.length === 0 ? (
              <View style={styles.emptyState}>
                <BarChart size={48} color={colors.gray[500]} />
                <Text style={styles.emptyStateTitle}>No Scouting Records</Text>
                <Text style={styles.emptyStateMessage}>
                  Add scouting records to track this team's performance during matches.
                </Text>
                <Button 
                  title="Add Scouting Record" 
                  onPress={handleAddScoutingRecord}
                  variant="outline"
                  size="small"
                  icon={<Plus size={14} color={colors.primary} />}
                  style={styles.emptyStateButton}
                />
              </View>
            ) : (
              <FlatList
                data={teamScoutingRecords}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <ScoutingRecordCard 
                    record={item} 
                    teamNumber={team.number}
                    teamName={team.name}
                    onPress={() => handleScoutingRecordPress(item.id)}
                  />
                )}
                contentContainerStyle={styles.listContent}
              />
            )}
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: `Team ${team.number}`,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>
          )
        }} 
      />
      
      <View style={styles.header}>
        <Text style={styles.teamNumber}>#{team.number}</Text>
        <Text style={styles.teamName}>{team.name}</Text>
        
        {team.location && (
          <View style={styles.locationContainer}>
            <MapPin size={16} color={colors.textSecondary} />
            <Text style={styles.location}>{team.location}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{teamStats.averageScore}</Text>
            <Text style={styles.statLabel}>Avg. Score</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{teamStats.defenseRating}/5</Text>
            <Text style={styles.statLabel}>Defense</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{teamStats.winRate}%</Text>
            <Text style={styles.statLabel}>Win Rate</Text>
          </View>
        </View>
        
        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{teamStats.averageAuto}</Text>
            <Text style={styles.statLabel}>Avg. Auto</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{teamStats.averageTeleop}</Text>
            <Text style={styles.statLabel}>Avg. Teleop</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{teamStats.averageEndgame}</Text>
            <Text style={styles.statLabel}>Avg. Endgame</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <Clock size={16} color={colors.primary} />
          <Text style={styles.infoLabel}>Experience:</Text>
          <Text style={styles.infoValue}>{getTeamExperience()}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <CalendarDays size={16} color={colors.primary} />
          <Text style={styles.infoLabel}>Matches:</Text>
          <Text style={styles.infoValue}>{teamStats.matchesPlayed} ({teamStats.matchesWon} wins)</Text>
        </View>
        
        <View style={styles.infoItem}>
          <ClipboardList size={16} color={colors.primary} />
          <Text style={styles.infoLabel}>Notes:</Text>
          <Text style={styles.infoValue}>{teamNotes ? teamNotes.length : 0}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <BarChart size={16} color={colors.primary} />
          <Text style={styles.infoLabel}>Scouting Records:</Text>
          <Text style={styles.infoValue}>{teamScoutingRecords ? teamScoutingRecords.length : 0}</Text>
        </View>
      </View>
      
      {teamAwards && teamAwards.length > 0 && (
        <View style={styles.awardsContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Award size={20} color={colors.warning} />
              <Text style={styles.sectionTitle}>Recent Awards</Text>
            </View>
            <TouchableOpacity onPress={fetchTeamAwards}>
              <RefreshCw size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={teamAwards.slice(0, 5)}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.awardItem}>
                <Text style={styles.awardName}>{item.name}</Text>
                <Text style={styles.awardEvent}>{item.year}</Text>
              </View>
            )}
          />
        </View>
      )}
      
      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'matches' && styles.activeTab]}
          onPress={() => setActiveTab('matches')}
        >
          <CalendarDays size={20} color={activeTab === 'matches' ? colors.primary : colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'matches' && styles.activeTabText]}>
            Matches
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'notes' && styles.activeTab]}
          onPress={() => setActiveTab('notes')}
        >
          <ClipboardList size={20} color={activeTab === 'notes' ? colors.primary : colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'notes' && styles.activeTabText]}>
            Notes
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'scouting' && styles.activeTab]}
          onPress={() => setActiveTab('scouting')}
        >
          <BarChart size={20} color={activeTab === 'scouting' ? colors.primary : colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'scouting' && styles.activeTabText]}>
            Scouting
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.tabContent}>
        {renderTabContent()}
      </View>
      
      <View style={styles.fabContainer}>
        {activeTab === 'notes' && (
          <TouchableOpacity 
            style={styles.fab}
            onPress={handleAddNote}
          >
            <Plus size={24} color={colors.text} />
          </TouchableOpacity>
        )}
        
        {activeTab === 'scouting' && (
          <TouchableOpacity 
            style={styles.fab}
            onPress={handleAddScoutingRecord}
          >
            <Plus size={24} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerButton: {
    padding: 8,
  },
  errorText: {
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
    marginTop: 24,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  teamNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  teamName: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  statsContainer: {
    backgroundColor: colors.card,
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  statRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  infoContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
    width: 120,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  awardsContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  awardItem: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 200,
  },
  awardName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  awardEvent: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginTop: 16,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  tabContent: {
    flex: 1,
    padding: 16,
    paddingBottom: 80, // Extra space for FAB
  },
  listContent: {
    paddingBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.gray[500],
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateMessage: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyStateButton: {
    marginTop: 8,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  fab: {
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