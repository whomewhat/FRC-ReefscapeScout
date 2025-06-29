import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus, ClipboardList, Filter, RefreshCw } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import Button from '@/components/Button';
import EmptyState from '@/components/EmptyState';
import useScoutingStore from '@/store/scouting-store';
import useAppStore from '@/store/app-store';
import ScoutingRecordCard from '@/components/ScoutingRecordCard';
import { convertMatchesToScoutingRecords } from '@/utils/scouting-converter';

export default function ScoutingScreen() {
  const router = useRouter();
  const { records = [] } = useScoutingStore();
  const { teams = [], matches = [], myTeamNumber, importRecords, updateTeamRatings } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSource, setFilterSource] = useState<'all' | 'manual' | 'tba'>('all');
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredRecords = records ? records.filter(record => {
    if (!record) return false;
    
    // Filter by search query
    const query = searchQuery.toLowerCase();
    const team = teams ? teams.find(t => t && t.id === record.teamId) : null;
    
    const matchesSearch = 
      (team && team.name && team.name.toLowerCase().includes(query)) ||
      (team && team.number && team.number.toString().includes(query)) ||
      (record.matchNumber && record.matchNumber.toString().includes(query)) ||
      (record.scoutName && record.scoutName.toLowerCase().includes(query));
    
    // Filter by source
    const matchesSource = 
      filterSource === 'all' || 
      (filterSource === 'tba' && record.source === 'tba') || 
      (filterSource === 'manual' && record.source !== 'tba');
    
    return matchesSearch && matchesSource;
  }).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)) : [];

  const handleAddRecord = () => {
    router.push('/scouting/create');
  };

  const handleRecordPress = (record) => {
    if (!record || !record.id) return;
    router.push(`/scouting/${record.id}`);
  };

  const getTeamName = (teamId) => {
    if (!teamId || !teams) return 'Unknown Team';
    const team = teams.find(t => t && (t.id === teamId || t.number === teamId));
    return team && team.name ? team.name : 'Unknown Team';
  };

  const getTeamNumber = (teamId) => {
    if (!teamId || !teams) return 0;
    const team = teams.find(t => t && (t.id === teamId || t.number === teamId));
    return team && team.number ? team.number : 0;
  };
  
  const handleGenerateFromMatches = () => {
    if (!matches || matches.length === 0) {
      Alert.alert('No Match Data', 'Please import match data from TBA first in the Settings tab.');
      return;
    }
    
    setIsGenerating(true);
    try {
      
      // Convert matches to scouting records
      const newRecords = convertMatchesToScoutingRecords(matches, teams, myTeamNumber);
      
      // Import the new records
      if (newRecords.length > 0) {
        importRecords(newRecords);
        
        // Update team ratings based on new records
        setTimeout(() => {
          updateTeamRatings();
        }, 500);
        
        Alert.alert(
          'Success', 
          `Generated ${newRecords.length} scouting records from match data.`
        );
      } else {
        Alert.alert(
          'No Records Generated', 
          'No scouting records could be generated from the match data. This might be because there are no completed matches or the teams in the matches are not in your team list.'
        );
      }
    } catch (error) {
      console.error('Error generating scouting records:', error);
      Alert.alert(
        'Error', 
        `Failed to generate scouting records: ${error.message}`
      );
    } finally {
      setIsGenerating(false);
    }
  };
  
  const renderFilterChips = () => {
    return (
      <View style={styles.filterChipsContainer}>
        <TouchableOpacity 
          style={[
            styles.filterChip,
            filterSource === 'all' && styles.filterChipActive
          ]}
          onPress={() => setFilterSource('all')}
        >
          <Text style={[
            styles.filterChipText,
            filterSource === 'all' && styles.filterChipTextActive
          ]}>
            All
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.filterChip,
            filterSource === 'tba' && styles.filterChipActive
          ]}
          onPress={() => setFilterSource('tba')}
        >
          <Text style={[
            styles.filterChipText,
            filterSource === 'tba' && styles.filterChipTextActive
          ]}>
            TBA Data
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.filterChip,
            filterSource === 'manual' && styles.filterChipActive
          ]}
          onPress={() => setFilterSource('manual')}
        >
          <Text style={[
            styles.filterChipText,
            filterSource === 'manual' && styles.filterChipTextActive
          ]}>
            Manual Entry
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.searchContainer}>
        <Search size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search scouting records..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddRecord}>
          <Plus size={20} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.actionsContainer}>
        {renderFilterChips()}
        
        <TouchableOpacity 
          style={styles.generateButton}
          onPress={handleGenerateFromMatches}
          disabled={isGenerating}
        >
          <RefreshCw size={16} color={colors.primary} />
          <Text style={styles.generateButtonText}>
            Generate from TBA
          </Text>
        </TouchableOpacity>
      </View>

      {!records || records.length === 0 ? (
        <EmptyState
          icon={<ClipboardList size={64} color={colors.primary} />}
          title="No Scouting Records Yet"
          message="Add match scouting records to track team performance during REEFSCAPE matches. You can manually enter data or import from The Blue Alliance."
          action={
            <View style={styles.emptyStateActions}>
              <Button 
                title="Add Manual Record" 
                onPress={handleAddRecord} 
                icon={<Plus size={16} color={colors.white} />}
                style={styles.emptyStateButton}
              />
              <Button 
                title="Generate from TBA" 
                onPress={handleGenerateFromMatches} 
                icon={<RefreshCw size={16} color={colors.white} />}
                variant="outline"
                style={styles.emptyStateButton}
              />
            </View>
          }
        />
      ) : filteredRecords.length === 0 ? (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>No records match your search criteria</Text>
          <Button 
            title="Clear Filters" 
            onPress={() => {
              setSearchQuery('');
              setFilterSource('all');
            }}
            variant="outline"
            size="small"
          />
        </View>
      ) : (
        <FlatList
          data={filteredRecords}
          keyExtractor={(item, index) => item.id || index.toString()}
          renderItem={({ item }) => (
            <ScoutingRecordCard 
              record={item} 
              teamNumber={getTeamNumber(item.teamId)}
              teamName={getTeamName(item.teamId)}
              onPress={() => handleRecordPress(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      <TouchableOpacity 
        style={styles.fab} 
        onPress={handleAddRecord}
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
    marginTop: 12,
    marginBottom: 8,
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
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filterChipsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: colors.text,
  },
  filterChipTextActive: {
    color: colors.white,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  generateButtonText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 4,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // Extra padding for FAB
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  noResultsText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
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
  emptyStateActions: {
    width: '100%',
    gap: 8,
  },
  emptyStateButton: {
    width: '100%',
  },
});