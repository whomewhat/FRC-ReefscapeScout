import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Users, 
  Plus, 
  Minus, 
  AlertTriangle,
  Award,
  Star,
  TrendingUp,
  Calendar
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import useAppStore from '@/store/app-store';
import useScoutingStore from '@/store/scouting-store';
import TeamCard from '@/components/TeamCard';
import { calculateTeamRating, findBestAlliances } from '@/utils/alliance-helper';

export default function AllianceScreen() {
  const { teams = [], myTeamNumber, events = [], matches = [] } = useAppStore();
  const { records = [] } = useScoutingStore();
  const [allianceTeams, setAllianceTeams] = useState<number[]>([]);
  const [availableTeams, setAvailableTeams] = useState<any[]>([]);
  const [teamRatings, setTeamRatings] = useState<{[key: number]: number}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEventKey, setSelectedEventKey] = useState<string | null>(null);
  const [showEventSelector, setShowEventSelector] = useState(false);
  
  // Find my team's events
  useEffect(() => {
    if (myTeamNumber && events.length > 0 && matches.length > 0) {
      
      // Find events that my team is participating in by checking matches
      const myTeamEvents = events.filter(event => {
        // Check if this event has matches with my team
        const eventMatches = matches.filter(match => match.eventKey === event.key);
        
        // Check if any of these matches include my team
        const hasMyTeam = eventMatches.some(match => 
          (match.redAlliance && match.redAlliance.includes(myTeamNumber)) || 
          (match.blueAlliance && match.blueAlliance.includes(myTeamNumber))
        );
        
        return hasMyTeam;
      });
      
      
      // If no events found through matches, try to find events that have my team in their teams list
      if (myTeamEvents.length === 0) {
        const eventsWithMyTeam = events.filter(event => {
          return event.teams && Array.isArray(event.teams) && event.teams.includes(myTeamNumber);
        });
        
        
        // Add these events to myTeamEvents
        myTeamEvents.push(...eventsWithMyTeam);
      }
      
      // If still no events found, show all events as a fallback
      if (myTeamEvents.length === 0 && events.length > 0) {
        
        // Sort events by start date (most recent first)
        const sortedEvents = [...events].sort((a, b) => {
          const dateA = a.start_date ? new Date(a.start_date) : new Date(0);
          const dateB = b.start_date ? new Date(b.start_date) : new Date(0);
          return dateB.getTime() - dateA.getTime();
        });
        
        // Select the most recent event by default
        if (sortedEvents.length > 0 && !selectedEventKey) {
          setSelectedEventKey(sortedEvents[0].key);
        }
      } else {
        // Sort events by start date (most recent first)
        myTeamEvents.sort((a, b) => {
          const dateA = a.start_date ? new Date(a.start_date) : new Date(0);
          const dateB = b.start_date ? new Date(b.start_date) : new Date(0);
          return dateB.getTime() - dateA.getTime();
        });
        
        // Select the most recent event by default
        if (myTeamEvents.length > 0 && !selectedEventKey) {
          setSelectedEventKey(myTeamEvents[0].key);
        }
      }
    }
  }, [myTeamNumber, events, matches]);

  useEffect(() => {
    // Initialize with my team if it exists
    if (myTeamNumber && !allianceTeams.includes(myTeamNumber)) {
      setAllianceTeams([myTeamNumber]);
    }
    
    // Calculate team ratings
    calculateTeamRatings();
    
    // Filter available teams
    updateAvailableTeams();
  }, [teams, myTeamNumber, records, selectedEventKey]);

  const calculateTeamRatings = () => {
    const ratings: {[key: number]: number} = {};
    
    if (teams && Array.isArray(teams)) {
      teams.forEach(team => {
        if (team && team.number) {
          ratings[team.number] = calculateTeamRating(team.number, records);
        }
      });
    }
    
    setTeamRatings(ratings);
  };

  const updateAvailableTeams = () => {
    // Make sure teams is an array before filtering
    if (!Array.isArray(teams)) {
      setAvailableTeams([]);
      return;
    }
    
    // Filter teams by selected event if one is selected
    let teamsInEvent = teams;
    if (selectedEventKey) {
      const event = events.find(e => e.key === selectedEventKey);
      if (event) {
        // First check if event has a teams property
        if (event.teams && Array.isArray(event.teams)) {
          // Filter teams that are in this event
          teamsInEvent = teams.filter(team => 
            team && team.number && event.teams.includes(team.number)
          );
        } else {
          // If event doesn't have teams property, check matches for this event
          const eventMatches = matches.filter(match => match.eventKey === event.key);
          
          // Get all team numbers from these matches
          const teamNumbersInMatches = new Set<number>();
          
          eventMatches.forEach(match => {
            if (match.redAlliance && Array.isArray(match.redAlliance)) {
              match.redAlliance.forEach(teamNum => teamNumbersInMatches.add(teamNum));
            }
            if (match.blueAlliance && Array.isArray(match.blueAlliance)) {
              match.blueAlliance.forEach(teamNum => teamNumbersInMatches.add(teamNum));
            }
          });
          
          // Filter teams that are in these matches
          teamsInEvent = teams.filter(team => 
            team && team.number && teamNumbersInMatches.has(team.number)
          );
        }
      }
    }
    
    // Filter out teams already in alliance
    let filtered = teamsInEvent.filter(team => 
      team && team.number && !allianceTeams.includes(team.number)
    );
    
    // Sort by rating (highest first)
    filtered = filtered.sort((a, b) => {
      const ratingA = teamRatings[a.number] || 0;
      const ratingB = teamRatings[b.number] || 0;
      return ratingB - ratingA;
    });
    
    setAvailableTeams(filtered);
  };

  const addToAlliance = (teamNumber: number) => {
    if (allianceTeams.length >= 3) {
      Alert.alert('Alliance Full', 'You can only have 3 teams in your alliance.');
      return;
    }
    
    setAllianceTeams([...allianceTeams, teamNumber]);
    
    // Update available teams
    setTimeout(updateAvailableTeams, 0);
  };

  const removeFromAlliance = (teamNumber: number) => {
    // Don't allow removing my team
    if (teamNumber === myTeamNumber) {
      Alert.alert('Cannot Remove', 'You cannot remove your own team from the alliance.');
      return;
    }
    
    setAllianceTeams(allianceTeams.filter(t => t !== teamNumber));
    
    // Update available teams
    setTimeout(updateAvailableTeams, 0);
  };

  const findBestPartners = () => {
    if (!myTeamNumber) {
      Alert.alert('Team Required', 'Please set your team number in settings first.');
      return;
    }
    
    if (!selectedEventKey) {
      Alert.alert('Event Required', 'Please select an event first.');
      return;
    }
    
    setIsLoading(true);
    
    // Find best alliance partners for the selected event
    try {
      // Get teams in the selected event
      const event = events.find(e => e.key === selectedEventKey);
      if (!event) {
        Alert.alert('Event Error', 'Could not find the selected event.');
        setIsLoading(false);
        return;
      }
      
      // Get teams for this event
      let teamsInEvent: any[] = [];
      
      // First check if event has a teams property
      if (event.teams && Array.isArray(event.teams)) {
        // Filter teams that are in this event
        teamsInEvent = teams.filter(team => 
          team && team.number && event.teams.includes(team.number)
        );
      } else {
        // If event doesn't have teams property, check matches for this event
        const eventMatches = matches.filter(match => match.eventKey === event.key);
        
        // Get all team numbers from these matches
        const teamNumbersInMatches = new Set<number>();
        
        eventMatches.forEach(match => {
          if (match.redAlliance && Array.isArray(match.redAlliance)) {
            match.redAlliance.forEach(teamNum => teamNumbersInMatches.add(teamNum));
          }
          if (match.blueAlliance && Array.isArray(match.blueAlliance)) {
            match.blueAlliance.forEach(teamNum => teamNumbersInMatches.add(teamNum));
          }
        });
        
        // Filter teams that are in these matches
        teamsInEvent = teams.filter(team => 
          team && team.number && teamNumbersInMatches.has(team.number)
        );
      }
      
      if (teamsInEvent.length === 0) {
        Alert.alert('No Teams Found', 'Could not find any teams for the selected event.');
        setIsLoading(false);
        return;
      }
      
      const bestAlliance = findBestAlliances(myTeamNumber, teamsInEvent, records);
      
      if (bestAlliance.length > 0) {
        // Add my team first, then the best partners
        const newAlliance = [myTeamNumber];
        
        // Add up to 2 more teams
        bestAlliance.forEach(teamNumber => {
          if (newAlliance.length < 3 && teamNumber !== myTeamNumber) {
            newAlliance.push(teamNumber);
          }
        });
        
        setAllianceTeams(newAlliance);
        
        // Update available teams
        setTimeout(updateAvailableTeams, 0);
      } else {
        Alert.alert('No Recommendations', 'Could not find recommended alliance partners. Try importing more match data.');
      }
    } catch (error) {
      console.error('Error finding best partners:', error);
      Alert.alert('Error', 'Failed to find best alliance partners.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderAllianceTeam = ({ item }) => {
    if (!item) return null;
    
    const team = teams.find(t => t && t.number === item);
    
    if (!team) return null;
    
    const rating = teamRatings[team.number] || 0;
    
    return (
      <View style={styles.allianceTeamContainer}>
        <TeamCard 
          team={team}
          compact
        />
        <View style={styles.teamRatingContainer}>
          <Star size={16} color={colors.warning} />
          <Text style={styles.teamRatingText}>{rating.toFixed(1)}</Text>
        </View>
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={() => removeFromAlliance(team.number)}
          disabled={team.number === myTeamNumber}
        >
          <Minus size={20} color={colors.white} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderAvailableTeam = ({ item }) => {
    if (!item || !item.number) return null;
    
    const rating = teamRatings[item.number] || 0;
    
    return (
      <View style={styles.availableTeamContainer}>
        <TeamCard 
          team={item}
          compact
        />
        <View style={styles.teamRatingContainer}>
          <Star size={16} color={colors.warning} />
          <Text style={styles.teamRatingText}>{rating.toFixed(1)}</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => addToAlliance(item.number)}
        >
          <Plus size={20} color={colors.white} />
        </TouchableOpacity>
      </View>
    );
  };

  // Get my team's events for the selector
  const myTeamEvents = events.filter(event => {
    // First check if event has a teams property
    if (event.teams && Array.isArray(event.teams) && event.teams.includes(myTeamNumber)) {
      return true;
    }
    
    // If not, check if there are matches for this event that include my team
    const eventMatches = matches.filter(match => match.eventKey === event.key);
    return eventMatches.some(match => 
      (match.redAlliance && match.redAlliance.includes(myTeamNumber)) || 
      (match.blueAlliance && match.blueAlliance.includes(myTeamNumber))
    );
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

        {/* Alliance Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Users size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Your Alliance</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.findBestButton}
              onPress={findBestPartners}
              disabled={isLoading || !selectedEventKey}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <>
                  <Award size={16} color={colors.primary} />
                  <Text style={styles.findBestText}>Find Best Partners</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
          
          {allianceTeams.length > 0 ? (
            <FlatList
              data={allianceTeams}
              renderItem={renderAllianceTeam}
              keyExtractor={(item, index) => item ? item.toString() : index.toString()}
              contentContainerStyle={styles.allianceList}
            />
          ) : (
            <View style={styles.emptyState}>
              <AlertTriangle size={24} color={colors.textSecondary} />
              <Text style={styles.emptyStateText}>
                No teams in your alliance yet. Add teams from below or use "Find Best Partners".
              </Text>
            </View>
          )}
          
          {allianceTeams.length > 0 && (
            <View style={styles.allianceRatingContainer}>
              <TrendingUp size={20} color={colors.success} />
              <Text style={styles.allianceRatingLabel}>Alliance Rating:</Text>
              <Text style={styles.allianceRatingValue}>
                {allianceTeams.reduce((sum, teamNumber) => sum + (teamRatings[teamNumber] || 0), 0).toFixed(1)}
              </Text>
            </View>
          )}
        </View>
        
        {/* Available Teams Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Users size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Available Teams</Text>
              <Text style={styles.sectionSubtitle}>(Sorted by Rating)</Text>
            </View>
          </View>
          
          {availableTeams.length > 0 ? (
            <FlatList
              data={availableTeams}
              renderItem={renderAvailableTeam}
              keyExtractor={(item, index) => item && (item.id || item.number) ?
                (item.id || item.number).toString() :
                index.toString()}
              contentContainerStyle={styles.availableList}
            />
          ) : (
            <View style={styles.emptyState}>
              <AlertTriangle size={24} color={colors.textSecondary} />
              <Text style={styles.emptyStateText}>
                {selectedEventKey 
                  ? "No more teams available to add from this event."
                  : "Please select an event to see available teams."}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Event Selector Modal */}
      <Modal
        visible={showEventSelector}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEventSelector(false)}
      >
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
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowEventSelector(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  section: {
    marginBottom: 24,
    flex: 1,
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
    flexWrap: 'wrap',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  findBestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 150,
    justifyContent: 'center',
  },
  findBestText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 4,
  },
  allianceList: {
    paddingBottom: 16,
  },
  availableList: {
    paddingBottom: 16,
  },
  allianceTeamContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  availableTeamContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  teamRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[800],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  teamRatingText: {
    fontSize: 14,
    color: colors.warning,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  addButton: {
    backgroundColor: colors.success,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  removeButton: {
    backgroundColor: colors.danger,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
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
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
    flex: 1,
  },
  allianceRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 8,
  },
  allianceRatingLabel: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 8,
  },
  allianceRatingValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.success,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
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
    padding: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});