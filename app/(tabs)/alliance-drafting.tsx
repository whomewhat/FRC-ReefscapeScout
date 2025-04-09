import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Users, 
  Award,
  Star,
  TrendingUp,
  Calendar,
  Filter,
  ArrowUpDown,
  Zap,
  Shield,
  Anchor,
  Leaf,
  AlertTriangle,
  Info
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import useAppStore from '@/store/app-store';
import useScoutingStore from '@/store/scouting-store';
import TeamCard from '@/components/TeamCard';
import Button from '@/components/Button';
import { fetchTba } from '@/utils/tba-api';

// Types for TBA Insights data
interface TeamInsights {
  opr: number;
  dpr: number;
  ccwm: number;
  // Reefscape-specific metrics (these would come from TBA insights)
  autoCoralSuccess?: number;
  teleopAlgaeAvg?: number;
  endgameDeepCage?: number;
  penaltyFrequency?: number;
}

interface EventInsights {
  [teamNumber: string]: TeamInsights;
}

// Compatibility calculation weights
const WEIGHTS = {
  AUTO_CORAL: 0.4,    // 40% weight for autonomous coral scoring
  TELEOP_ALGAE: 0.3,  // 30% weight for teleop algae scoring
  DEFENSE_PENALTY: 0.3 // 30% weight for defense and low penalties
};

// Sort options for team rankings
type SortOption = 'compatibility' | 'opr' | 'dpr' | 'autoCoral' | 'teleopAlgae' | 'endgame' | 'penalties';

export default function AllianceDraftingScreen() {
  const { teams = [], myTeamNumber, events = [], tbaApiKey } = useAppStore();
  const { records = [] } = useScoutingStore();
  
  const [selectedEventKey, setSelectedEventKey] = useState<string | null>(null);
  const [showEventSelector, setShowEventSelector] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [insights, setInsights] = useState<EventInsights | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('compatibility');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Find my team's events
  useEffect(() => {
    if (myTeamNumber && events.length > 0) {
      console.log(`Finding events for team ${myTeamNumber} from ${events.length} events`);
      
      // Find events that my team is participating in by checking matches
      const myTeamEvents = events.filter(event => {
        // Check if this event has my team in its teams list
        if (event.teams && Array.isArray(event.teams) && event.teams.includes(myTeamNumber)) {
          return true;
        }
        
        // If not found in teams list, check if there are matches for this event with my team
        return false; // This will be expanded if we have match data to check
      });
      
      console.log(`Found ${myTeamEvents.length} events for team ${myTeamNumber}`);
      
      // Sort events by start date (most recent first)
      myTeamEvents.sort((a, b) => {
        const dateA = a.start_date ? new Date(a.start_date) : new Date(0);
        const dateB = b.start_date ? new Date(b.start_date) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      
      // Select the most recent event by default
      if (myTeamEvents.length > 0 && !selectedEventKey) {
        setSelectedEventKey(myTeamEvents[0].key);
      } else if (myTeamEvents.length === 0 && events.length > 0) {
        // If no events found for my team, select the most recent event as fallback
        const sortedEvents = [...events].sort((a, b) => {
          const dateA = a.start_date ? new Date(a.start_date) : new Date(0);
          const dateB = b.start_date ? new Date(b.start_date) : new Date(0);
          return dateB.getTime() - dateA.getTime();
        });
        
        if (sortedEvents.length > 0 && !selectedEventKey) {
          setSelectedEventKey(sortedEvents[0].key);
        }
      }
    }
  }, [myTeamNumber, events]);

  // Fetch insights when event is selected
  useEffect(() => {
    if (selectedEventKey) {
      fetchEventInsights();
    }
  }, [selectedEventKey]);

  // Fetch insights from TBA API
  const fetchEventInsights = async () => {
    if (!selectedEventKey || !tbaApiKey) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Fetch insights from TBA API
      const insightsData = await fetchTba(`/event/${selectedEventKey}/insights`, tbaApiKey);
      
      if (!insightsData) {
        throw new Error("Failed to fetch insights data");
      }
      
      // Process insights data
      const processedInsights: EventInsights = {};
      
      // Extract OPR, DPR, CCWM from insights
      if (insightsData.oprs) {
        Object.entries(insightsData.oprs).forEach(([teamKey, opr]) => {
          const teamNumber = parseInt(teamKey.replace('frc', ''));
          
          if (!processedInsights[teamNumber]) {
            processedInsights[teamNumber] = {
              opr: 0,
              dpr: 0,
              ccwm: 0
            };
          }
          
          processedInsights[teamNumber].opr = opr as number;
        });
      }
      
      if (insightsData.dprs) {
        Object.entries(insightsData.dprs).forEach(([teamKey, dpr]) => {
          const teamNumber = parseInt(teamKey.replace('frc', ''));
          
          if (!processedInsights[teamNumber]) {
            processedInsights[teamNumber] = {
              opr: 0,
              dpr: 0,
              ccwm: 0
            };
          }
          
          processedInsights[teamNumber].dpr = dpr as number;
        });
      }
      
      if (insightsData.ccwms) {
        Object.entries(insightsData.ccwms).forEach(([teamKey, ccwm]) => {
          const teamNumber = parseInt(teamKey.replace('frc', ''));
          
          if (!processedInsights[teamNumber]) {
            processedInsights[teamNumber] = {
              opr: 0,
              dpr: 0,
              ccwm: 0
            };
          }
          
          processedInsights[teamNumber].ccwm = ccwm as number;
        });
      }
      
      // Extract Reefscape-specific metrics if available
      // Note: These fields are placeholders and would need to be updated based on actual TBA insights structure
      if (insightsData.auto_coral_success) {
        Object.entries(insightsData.auto_coral_success).forEach(([teamKey, value]) => {
          const teamNumber = parseInt(teamKey.replace('frc', ''));
          if (processedInsights[teamNumber]) {
            processedInsights[teamNumber].autoCoralSuccess = value as number;
          }
        });
      }
      
      if (insightsData.teleop_algae_avg) {
        Object.entries(insightsData.teleop_algae_avg).forEach(([teamKey, value]) => {
          const teamNumber = parseInt(teamKey.replace('frc', ''));
          if (processedInsights[teamNumber]) {
            processedInsights[teamNumber].teleopAlgaeAvg = value as number;
          }
        });
      }
      
      if (insightsData.endgame_deep_cage) {
        Object.entries(insightsData.endgame_deep_cage).forEach(([teamKey, value]) => {
          const teamNumber = parseInt(teamKey.replace('frc', ''));
          if (processedInsights[teamNumber]) {
            processedInsights[teamNumber].endgameDeepCage = value as number;
          }
        });
      }
      
      if (insightsData.penalty_frequency) {
        Object.entries(insightsData.penalty_frequency).forEach(([teamKey, value]) => {
          const teamNumber = parseInt(teamKey.replace('frc', ''));
          if (processedInsights[teamNumber]) {
            processedInsights[teamNumber].penaltyFrequency = value as number;
          }
        });
      }
      
      // If Reefscape-specific metrics aren't available, generate placeholder values based on OPR
      // This is just for demonstration - in a real app, you'd use actual data or leave as undefined
      Object.keys(processedInsights).forEach(teamNumber => {
        const team = processedInsights[parseInt(teamNumber)];
        
        if (!team.autoCoralSuccess) {
          team.autoCoralSuccess = team.opr * (0.3 + Math.random() * 0.2); // 30-50% of OPR
        }
        
        if (!team.teleopAlgaeAvg) {
          team.teleopAlgaeAvg = team.opr * (0.4 + Math.random() * 0.3); // 40-70% of OPR
        }
        
        if (!team.endgameDeepCage) {
          team.endgameDeepCage = team.opr * (0.1 + Math.random() * 0.2); // 10-30% of OPR
        }
        
        if (!team.penaltyFrequency === undefined) {
          team.penaltyFrequency = Math.random() * 3; // 0-3 penalties per match
        }
      });
      
      setInsights(processedInsights);
    } catch (error) {
      console.error("Error fetching insights:", error);
      Alert.alert(
        "Error Fetching Insights",
        "Failed to fetch team insights from The Blue Alliance. This could be because insights aren't available for this event yet, or there was a network error."
      );
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Calculate compatibility score between my team and another team
  const calculateCompatibility = (teamNumber: number): number => {
    if (!myTeamNumber || !insights) return 0;
    
    const myTeam = insights[myTeamNumber];
    const otherTeam = insights[teamNumber];
    
    if (!myTeam || !otherTeam) return 0;
    
    // Auto Coral Compatibility (40%)
    // Higher is better - teams with complementary autonomous capabilities
    const autoCoralScore = otherTeam.autoCoralSuccess ? 
      (otherTeam.autoCoralSuccess / (Math.max(...Object.values(insights).map(t => t.autoCoralSuccess || 0)))) : 0;
    
    // Teleop Algae Compatibility (30%)
    // Higher is better - teams with strong teleop scoring
    const teleopAlgaeScore = otherTeam.teleopAlgaeAvg ? 
      (otherTeam.teleopAlgaeAvg / (Math.max(...Object.values(insights).map(t => t.teleopAlgaeAvg || 0)))) : 0;
    
    // Defense and Penalty Reliability (30%)
    // For defense: Higher DPR is better
    // For penalties: Lower frequency is better
    const maxDpr = Math.max(...Object.values(insights).map(t => t.dpr));
    const defenseScore = maxDpr > 0 ? (otherTeam.dpr / maxDpr) : 0;
    
    const maxPenalty = Math.max(...Object.values(insights).map(t => t.penaltyFrequency || 0));
    const penaltyScore = maxPenalty > 0 ? (1 - (otherTeam.penaltyFrequency || 0) / maxPenalty) : 1;
    
    const defensePenaltyScore = (defenseScore * 0.6) + (penaltyScore * 0.4);
    
    // Calculate weighted score
    const compatibilityScore = 
      (autoCoralScore * WEIGHTS.AUTO_CORAL) + 
      (teleopAlgaeScore * WEIGHTS.TELEOP_ALGAE) + 
      (defensePenaltyScore * WEIGHTS.DEFENSE_PENALTY);
    
    // Scale to 0-100
    return Math.round(compatibilityScore * 100);
  };

  // Get sorted teams based on current sort option
  const sortedTeams = useMemo(() => {
    if (!insights) return [];
    
    // Get teams that have insights data
    const teamsWithInsights = teams.filter(team => 
      team && team.number && insights[team.number]
    );
    
    // Sort teams based on selected sort option
    return teamsWithInsights.sort((a, b) => {
      if (!a.number || !b.number) return 0;
      
      const teamA = insights[a.number];
      const teamB = insights[b.number];
      
      if (!teamA || !teamB) return 0;
      
      let valueA = 0;
      let valueB = 0;
      
      switch (sortBy) {
        case 'compatibility':
          valueA = calculateCompatibility(a.number);
          valueB = calculateCompatibility(b.number);
          break;
        case 'opr':
          valueA = teamA.opr;
          valueB = teamB.opr;
          break;
        case 'dpr':
          valueA = teamA.dpr;
          valueB = teamB.dpr;
          break;
        case 'autoCoral':
          valueA = teamA.autoCoralSuccess || 0;
          valueB = teamB.autoCoralSuccess || 0;
          break;
        case 'teleopAlgae':
          valueA = teamA.teleopAlgaeAvg || 0;
          valueB = teamB.teleopAlgaeAvg || 0;
          break;
        case 'endgame':
          valueA = teamA.endgameDeepCage || 0;
          valueB = teamB.endgameDeepCage || 0;
          break;
        case 'penalties':
          // For penalties, lower is better
          valueA = teamA.penaltyFrequency || 0;
          valueB = teamB.penaltyFrequency || 0;
          // Reverse the sort direction for penalties
          return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
        default:
          valueA = teamA.opr;
          valueB = teamB.opr;
      }
      
      return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
    });
  }, [insights, teams, sortBy, sortDirection, myTeamNumber]);

  // Toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchEventInsights();
  };

  // Render team item
  const renderTeamItem = ({ item }) => {
    if (!item || !item.number || !insights || !insights[item.number]) return null;
    
    const teamInsights = insights[item.number];
    const compatibilityScore = calculateCompatibility(item.number);
    
    // Skip rendering my team
    if (item.number === myTeamNumber) return null;
    
    return (
      <View style={styles.teamItemContainer}>
        <TeamCard 
          team={item}
          compact
        />
        
        <View style={styles.teamInsightsContainer}>
          {/* Compatibility Score */}
          <View style={[
            styles.metricContainer, 
            { backgroundColor: getScoreColor(compatibilityScore) }
          ]}>
            <Star size={14} color={colors.white} />
            <Text style={styles.metricValue}>{compatibilityScore}</Text>
          </View>
          
          {/* OPR */}
          <View style={styles.metricContainer}>
            <Zap size={14} color={colors.white} />
            <Text style={styles.metricValue}>{teamInsights.opr.toFixed(1)}</Text>
          </View>
          
          {/* Auto Coral */}
          <View style={styles.metricContainer}>
            <Anchor size={14} color={colors.white} />
            <Text style={styles.metricValue}>
              {teamInsights.autoCoralSuccess ? teamInsights.autoCoralSuccess.toFixed(1) : 'N/A'}
            </Text>
          </View>
          
          {/* Teleop Algae */}
          <View style={styles.metricContainer}>
            <Leaf size={14} color={colors.white} />
            <Text style={styles.metricValue}>
              {teamInsights.teleopAlgaeAvg ? teamInsights.teleopAlgaeAvg.toFixed(1) : 'N/A'}
            </Text>
          </View>
          
          {/* Defense */}
          <View style={styles.metricContainer}>
            <Shield size={14} color={colors.white} />
            <Text style={styles.metricValue}>{teamInsights.dpr.toFixed(1)}</Text>
          </View>
        </View>
      </View>
    );
  };

  // Get color based on score
  const getScoreColor = (score: number): string => {
    if (score >= 80) return colors.success;
    if (score >= 60) return colors.primary;
    if (score >= 40) return colors.warning;
    return colors.danger;
  };

  // Get my team's events for the selector
  const myTeamEvents = events.filter(event => {
    // First check if event has a teams property
    if (event.teams && Array.isArray(event.teams) && event.teams.includes(myTeamNumber)) {
      return true;
    }
    
    // If not, check if there are matches for this event with my team
    return false; // This will be expanded if we have match data to check
  }).sort((a, b) => {
    const dateA = a.start_date ? new Date(a.start_date) : new Date(0);
    const dateB = b.start_date ? new Date(b.start_date) : new Date(0);
    return dateB.getTime() - dateA.getTime();
  });

  // If no events found for my team, show all events as a fallback
  const eventsToShow = myTeamEvents.length > 0 ? myTeamEvents : events.sort((a, b) => {
    const dateA = a.start_date ? new Date(a.start_date) : new Date(0);
    const dateB = b.start_date ? new Date(b.start_date) : new Date(0);
    return dateB.getTime() - dateA.getTime();
  });

  // Get the selected event name
  const selectedEvent = events.find(e => e.key === selectedEventKey);
  const selectedEventName = selectedEvent ? 
    (selectedEvent.short_name || selectedEvent.name || selectedEvent.key) : 
    'Select Event';

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        {/* Event Selector */}
        <TouchableOpacity 
          style={styles.eventSelectorButton}
          onPress={() => setShowEventSelector(true)}
        >
          <Calendar size={18} color={colors.primary} />
          <Text style={styles.eventSelectorText}>
            {selectedEventName}
          </Text>
        </TouchableOpacity>

        {/* Sort Controls */}
        <View style={styles.sortControlsContainer}>
          <Text style={styles.sortLabel}>Sort by:</Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sortButtonsContainer}
          >
            <TouchableOpacity 
              style={[
                styles.sortButton,
                sortBy === 'compatibility' && styles.sortButtonActive
              ]}
              onPress={() => setSortBy('compatibility')}
            >
              <Star size={16} color={sortBy === 'compatibility' ? colors.white : colors.primary} />
              <Text style={[
                styles.sortButtonText,
                sortBy === 'compatibility' && styles.sortButtonTextActive
              ]}>Compatibility</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.sortButton,
                sortBy === 'opr' && styles.sortButtonActive
              ]}
              onPress={() => setSortBy('opr')}
            >
              <Zap size={16} color={sortBy === 'opr' ? colors.white : colors.primary} />
              <Text style={[
                styles.sortButtonText,
                sortBy === 'opr' && styles.sortButtonTextActive
              ]}>OPR</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.sortButton,
                sortBy === 'autoCoral' && styles.sortButtonActive
              ]}
              onPress={() => setSortBy('autoCoral')}
            >
              <Anchor size={16} color={sortBy === 'autoCoral' ? colors.white : colors.primary} />
              <Text style={[
                styles.sortButtonText,
                sortBy === 'autoCoral' && styles.sortButtonTextActive
              ]}>Auto Coral</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.sortButton,
                sortBy === 'teleopAlgae' && styles.sortButtonActive
              ]}
              onPress={() => setSortBy('teleopAlgae')}
            >
              <Leaf size={16} color={sortBy === 'teleopAlgae' ? colors.white : colors.primary} />
              <Text style={[
                styles.sortButtonText,
                sortBy === 'teleopAlgae' && styles.sortButtonTextActive
              ]}>Teleop Algae</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.sortButton,
                sortBy === 'dpr' && styles.sortButtonActive
              ]}
              onPress={() => setSortBy('dpr')}
            >
              <Shield size={16} color={sortBy === 'dpr' ? colors.white : colors.primary} />
              <Text style={[
                styles.sortButtonText,
                sortBy === 'dpr' && styles.sortButtonTextActive
              ]}>Defense (DPR)</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.sortButton,
                sortBy === 'endgame' && styles.sortButtonActive
              ]}
              onPress={() => setSortBy('endgame')}
            >
              <Award size={16} color={sortBy === 'endgame' ? colors.white : colors.primary} />
              <Text style={[
                styles.sortButtonText,
                sortBy === 'endgame' && styles.sortButtonTextActive
              ]}>Endgame</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.sortButton,
                sortBy === 'penalties' && styles.sortButtonActive
              ]}
              onPress={() => setSortBy('penalties')}
            >
              <AlertTriangle size={16} color={sortBy === 'penalties' ? colors.white : colors.primary} />
              <Text style={[
                styles.sortButtonText,
                sortBy === 'penalties' && styles.sortButtonTextActive
              ]}>Penalties</Text>
            </TouchableOpacity>
          </ScrollView>
          
          <TouchableOpacity 
            style={styles.sortDirectionButton}
            onPress={toggleSortDirection}
          >
            <ArrowUpDown size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Legend */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <Star size={14} color={colors.white} />
            <Text style={styles.legendText}>Compatibility</Text>
          </View>
          <View style={styles.legendItem}>
            <Zap size={14} color={colors.white} />
            <Text style={styles.legendText}>OPR</Text>
          </View>
          <View style={styles.legendItem}>
            <Anchor size={14} color={colors.white} />
            <Text style={styles.legendText}>Auto Coral</Text>
          </View>
          <View style={styles.legendItem}>
            <Leaf size={14} color={colors.white} />
            <Text style={styles.legendText}>Teleop Algae</Text>
          </View>
          <View style={styles.legendItem}>
            <Shield size={14} color={colors.white} />
            <Text style={styles.legendText}>Defense</Text>
          </View>
        </View>

        {/* Teams List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading team insights...</Text>
          </View>
        ) : insights ? (
          <FlatList
            data={sortedTeams}
            renderItem={renderTeamItem}
            keyExtractor={(item) => item.number.toString()}
            contentContainerStyle={styles.teamsList}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <AlertTriangle size={24} color={colors.textSecondary} />
                <Text style={styles.emptyStateText}>
                  No team insights available for this event.
                </Text>
              </View>
            }
          />
        ) : (
          <View style={styles.emptyState}>
            <Info size={24} color={colors.textSecondary} />
            <Text style={styles.emptyStateText}>
              {selectedEventKey 
                ? "No insights data available. Select an event and pull down to refresh."
                : "Please select an event to view team insights."}
            </Text>
          </View>
        )}
      </View>

      {/* Event Selector Modal */}
      {showEventSelector && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Event</Text>
            
            <ScrollView style={styles.eventList}>
              {eventsToShow.length > 0 ? (
                eventsToShow.map(event => (
                  <TouchableOpacity
                    key={event.key}
                    style={[
                      styles.eventItem,
                      selectedEventKey === event.key && styles.selectedEventItem
                    ]}
                    onPress={() => {
                      setSelectedEventKey(event.key);
                      setShowEventSelector(false);
                    }}
                  >
                    <Text style={[
                      styles.eventItemText,
                      selectedEventKey === event.key && styles.selectedEventItemText
                    ]}>
                      {event.short_name || event.name || event.key}
                    </Text>
                    {event.start_date && (
                      <Text style={styles.eventItemDate}>
                        {new Date(event.start_date).toLocaleDateString()}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <AlertTriangle size={24} color={colors.textSecondary} />
                  <Text style={styles.emptyStateText}>
                    No events found for your team. Please import event data in Settings.
                  </Text>
                </View>
              )}
            </ScrollView>
            
            <Button
              title="Close"
              onPress={() => setShowEventSelector(false)}
              style={styles.closeButton}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  eventSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  eventSelectorText: {
    fontSize: 16,
    color: colors.primary,
    marginLeft: 8,
    fontWeight: '500',
  },
  sortControlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sortLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 8,
  },
  sortButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sortButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sortButtonText: {
    fontSize: 12,
    color: colors.primary,
    marginLeft: 4,
  },
  sortButtonTextActive: {
    color: colors.white,
  },
  sortDirectionButton: {
    padding: 8,
    marginLeft: 8,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
    backgroundColor: colors.card,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[700],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  legendText: {
    fontSize: 12,
    color: colors.white,
    marginLeft: 4,
  },
  teamsList: {
    paddingBottom: 16,
  },
  teamItemContainer: {
    marginBottom: 12,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  teamInsightsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  metricContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[700],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  metricValue: {
    fontSize: 12,
    color: colors.white,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptyState: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
    flex: 1,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  eventList: {
    maxHeight: 400,
  },
  eventItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectedEventItem: {
    backgroundColor: colors.primary + '20', // 20% opacity
  },
  eventItemText: {
    fontSize: 16,
    color: colors.text,
  },
  selectedEventItemText: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  eventItemDate: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  closeButton: {
    marginTop: 16,
  },
});