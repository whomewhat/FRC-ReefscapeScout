import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus, Calendar, CalendarClock, CheckCircle } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import Button from '@/components/Button';
import MatchCard from '@/components/MatchCard';
import EmptyState from '@/components/EmptyState';
import useAppStore from '@/store/app-store';

export default function MatchesScreen() {
  const router = useRouter();
  const { matches = [], myTeamNumber } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCompleted, setFilterCompleted] = useState<boolean | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  
  // Filter matches based on search query and filters
  const filteredMatches = matches ? matches.filter(match => {
    if (!match) return false;
    
    // Search filter
    const matchNumberStr = match.matchNumber ? match.matchNumber.toString() : '';
    const redTeams = Array.isArray(match.redAlliance) 
      ? match.redAlliance.map(t => t ? t.toString() : '').join(' ') 
      : '';
    const blueTeams = Array.isArray(match.blueAlliance) 
      ? match.blueAlliance.map(t => t ? t.toString() : '').join(' ') 
      : '';
    const matchType = match.matchType || '';
    const searchString = `${matchNumberStr} ${redTeams} ${blueTeams} ${matchType}`;
    
    const matchesSearch = searchQuery === '' || 
      searchString.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Completed filter
    const matchesCompleted = filterCompleted === null || 
      match.completed === filterCompleted;
    
    // Match type filter
    const matchesType = filterType === null || 
      (match.matchType || 'Qualification') === filterType;
    
    return matchesSearch && matchesCompleted && matchesType;
  }).sort((a, b) => {
    if (!a || !a.matchNumber) return 1;
    if (!b || !b.matchNumber) return -1;
    return a.matchNumber - b.matchNumber;
  }) : [];
  
  const handleAddMatch = () => {
    router.push('/match/create');
  };
  
  const handleMatchPress = (matchId: number) => {
    router.push(`/match/${matchId}`);
  };
  
  const toggleCompletedFilter = (value: boolean | null) => {
    setFilterCompleted(filterCompleted === value ? null : value);
  };
  
  const toggleTypeFilter = (value: string | null) => {
    setFilterType(filterType === value ? null : value);
  };
  
  // Render filter chips in a horizontal FlatList
  const renderFilterChips = () => {
    const filters = [
      {
        id: 'completed',
        label: 'Completed',
        icon: <CheckCircle size={16} color={filterCompleted === true ? colors.white : colors.textSecondary} />,
        isActive: filterCompleted === true,
        onPress: () => toggleCompletedFilter(true)
      },
      {
        id: 'upcoming',
        label: 'Upcoming',
        icon: <CalendarClock size={16} color={filterCompleted === false ? colors.white : colors.textSecondary} />,
        isActive: filterCompleted === false,
        onPress: () => toggleCompletedFilter(false)
      },
      {
        id: 'qualification',
        label: 'Qualification',
        icon: <Calendar size={16} color={filterType === 'Qualification' ? colors.white : colors.textSecondary} />,
        isActive: filterType === 'Qualification',
        onPress: () => toggleTypeFilter('Qualification')
      },
      {
        id: 'practice',
        label: 'Practice',
        icon: <Calendar size={16} color={filterType === 'Practice' ? colors.white : colors.textSecondary} />,
        isActive: filterType === 'Practice',
        onPress: () => toggleTypeFilter('Practice')
      },
      {
        id: 'playoff',
        label: 'Playoff',
        icon: <Calendar size={16} color={filterType === 'Playoff' ? colors.white : colors.textSecondary} />,
        isActive: filterType === 'Playoff',
        onPress: () => toggleTypeFilter('Playoff')
      }
    ];
    
    return (
      <FlatList
        horizontal
        data={filters}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[
              styles.filterChip,
              item.isActive && styles.filterChipActive
            ]}
            onPress={item.onPress}
          >
            {item.icon}
            <Text style={[
              styles.filterChipText,
              item.isActive && styles.filterChipTextActive
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
      />
    );
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.searchContainer}>
        <Search size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search matches..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddMatch}>
          <Plus size={20} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      {renderFilterChips()}
      
      {!matches || matches.length === 0 ? (
        <EmptyState
          icon={<Calendar size={64} color={colors.primary} />}
          title="No Matches Yet"
          message="Add matches to track your team's performance during the competition."
          action={
            <Button 
              title="Add Match" 
              onPress={handleAddMatch} 
              icon={<Plus size={16} color={colors.white} />}
            />
          }
        />
      ) : filteredMatches.length === 0 ? (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>No matches match your search criteria</Text>
          <Button 
            title="Clear Filters" 
            onPress={() => {
              setSearchQuery('');
              setFilterCompleted(null);
              setFilterType(null);
            }}
            variant="outline"
            size="small"
          />
        </View>
      ) : (
        <FlatList
          data={filteredMatches}
          keyExtractor={(item) => (item && item.id ? item.id.toString() : Math.random().toString())}
          renderItem={({ item }) => {
            if (!item) return null;
            return (
              <MatchCard
                match={item}
                myTeamNumber={myTeamNumber}
                onPress={() => handleMatchPress(item.id)}
              />
            );
          }}
          contentContainerStyle={styles.listContent}
        />
      )}
      
      <TouchableOpacity 
        style={styles.fab} 
        onPress={handleAddMatch}
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
  filtersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
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
    marginLeft: 4,
  },
  filterChipTextActive: {
    color: colors.white,
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
});