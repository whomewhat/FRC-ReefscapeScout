import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity,
  Alert,
  Switch,
  Platform
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { 
  Save, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Target, 
  Shield, 
  Truck, 
  Climb, 
  Zap, 
  Wrench,
  ArrowLeft,
  User,
  Info
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import Button from '@/components/Button';
import useAppStore from '@/store/app-store';
import useScoutingStore from '@/store/scouting-store';
import { generateId } from '@/utils/helpers';
import { ScoutingRecord } from '@/types/scouting';

export default function CreateScoutingRecordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ 
    teamId?: string, 
    matchNumber?: string,
    autoFill?: string,
    alliance?: string
  }>();
  
  const { teams = [], matches = [] } = useAppStore();
  const { addRecord } = useScoutingStore();
  
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(
    params.teamId ? parseInt(params.teamId) : null
  );
  const [selectedMatchNumber, setSelectedMatchNumber] = useState<number | null>(
    params.matchNumber ? parseInt(params.matchNumber) : null
  );
  
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);
  const [showMatchDropdown, setShowMatchDropdown] = useState(false);
  const [teamSearchQuery, setTeamSearchQuery] = useState('');
  const [matchSearchQuery, setMatchSearchQuery] = useState('');
  
  // Scouting data
  const [alliance, setAlliance] = useState<'red' | 'blue'>(
    params.alliance === 'blue' ? 'blue' : 'red'
  );
  const [scoutName, setScoutName] = useState('');
  
  // Auto
  const [autoLeavesBarge, setAutoLeavesBarge] = useState(false);
  const [autoCoralL1, setAutoCoralL1] = useState('0');
  const [autoCoralL2, setAutoCoralL2] = useState('0');
  const [autoCoralL3, setAutoCoralL3] = useState('0');
  const [autoCoralL4, setAutoCoralL4] = useState('0');
  const [autoAlgaeProcessor, setAutoAlgaeProcessor] = useState('0');
  const [autoAlgaeNet, setAutoAlgaeNet] = useState('0');
  
  // Teleop
  const [teleopCoralL1, setTeleopCoralL1] = useState('0');
  const [teleopCoralL2, setTeleopCoralL2] = useState('0');
  const [teleopCoralL3, setTeleopCoralL3] = useState('0');
  const [teleopCoralL4, setTeleopCoralL4] = useState('0');
  const [teleopAlgaeProcessor, setTeleopAlgaeProcessor] = useState('0');
  const [teleopAlgaeNet, setTeleopAlgaeNet] = useState('0');
  
  // Endgame
  const [endgameStatus, setEndgameStatus] = useState<'none' | 'parked' | 'shallowCage' | 'deepCage'>('none');
  
  // Performance
  const [defenseRating, setDefenseRating] = useState(0);
  const [minorFaults, setMinorFaults] = useState('0');
  const [majorFaults, setMajorFaults] = useState('0');
  
  // Penalties
  const [yellowCard, setYellowCard] = useState(false);
  const [redCard, setRedCard] = useState(false);
  
  // Comments
  const [comments, setComments] = useState('');
  
  // Filter teams based on search query
  const filteredTeams = teams ? teams.filter(team => {
    if (!team) return false;
    
    const query = teamSearchQuery.toLowerCase();
    const teamNumber = team.number ? team.number.toString() : '';
    const teamName = team.name ? team.name.toLowerCase() : '';
    
    return (
      teamNumber.includes(query) ||
      teamName.includes(query)
    );
  }).sort((a, b) => {
    if (!a || !a.number) return 1;
    if (!b || !b.number) return -1;
    return a.number - b.number;
  }) : [];
  
  // Filter matches based on search query
  const filteredMatches = matches ? matches.filter(match => {
    if (!match) return false;
    
    const query = matchSearchQuery.toLowerCase();
    const matchNumber = match.matchNumber ? match.matchNumber.toString() : '';
    
    return matchNumber.includes(query);
  }).sort((a, b) => {
    if (!a || !a.matchNumber) return 1;
    if (!b || !b.matchNumber) return -1;
    return a.matchNumber - b.matchNumber;
  }) : [];
  
  // Get selected team and match
  const selectedTeam = teams ? teams.find(team => team && team.id === selectedTeamId) : null;
  const selectedMatch = matches ? matches.find(match => match && match.matchNumber === selectedMatchNumber) : null;
  
  // Determine if the selected team is in the selected match
  useEffect(() => {
    if (selectedTeam && selectedMatch) {
      const teamNumber = selectedTeam.number;
      if (!teamNumber) return;
      
      const redAlliance = selectedMatch.redAlliance || [];
      const blueAlliance = selectedMatch.blueAlliance || [];
      
      const isInRedAlliance = redAlliance.includes(teamNumber);
      const isInBlueAlliance = blueAlliance.includes(teamNumber);
      
      if (isInRedAlliance) {
        setAlliance('red');
      } else if (isInBlueAlliance) {
        setAlliance('blue');
      }
    }
  }, [selectedTeam, selectedMatch]);
  
  // Auto-fill data if requested
  useEffect(() => {
    if (params.autoFill === 'true' && selectedTeam && selectedMatch) {
      // This would be where we'd pre-fill data from match results
      // For now, we'll just set some default values
      setAutoLeavesBarge(true);
      
      // If we have actual match data, we could use it to pre-fill
      if (selectedMatch.completed && selectedMatch.redScore !== undefined && selectedMatch.blueScore !== undefined) {
        // Example of how we might pre-fill based on alliance and match results
        if (alliance === 'red') {
          // Pre-fill with some estimated distribution of points
          const totalPoints = selectedMatch.redScore || 0;
          const estimatedAuto = Math.floor(totalPoints * 0.3);
          const estimatedTeleop = Math.floor(totalPoints * 0.5);
          const estimatedEndgame = totalPoints - estimatedAuto - estimatedTeleop;
          
          // Set some reasonable defaults based on total score
          setAutoCoralL1(Math.floor(estimatedAuto * 0.2).toString());
          setAutoCoralL2(Math.floor(estimatedAuto * 0.3).toString());
          setAutoCoralL3(Math.floor(estimatedAuto * 0.3).toString());
          setAutoCoralL4(Math.floor(estimatedAuto * 0.2).toString());
          
          setTeleopCoralL1(Math.floor(estimatedTeleop * 0.2).toString());
          setTeleopCoralL2(Math.floor(estimatedTeleop * 0.3).toString());
          setTeleopCoralL3(Math.floor(estimatedTeleop * 0.3).toString());
          setTeleopCoralL4(Math.floor(estimatedTeleop * 0.2).toString());
          
          // Guess at endgame status based on points
          if (estimatedEndgame >= 12) {
            setEndgameStatus('deepCage');
          } else if (estimatedEndgame >= 6) {
            setEndgameStatus('shallowCage');
          } else if (estimatedEndgame >= 2) {
            setEndgameStatus('parked');
          }
        } else {
          // Similar logic for blue alliance
          const totalPoints = selectedMatch.blueScore || 0;
          const estimatedAuto = Math.floor(totalPoints * 0.3);
          const estimatedTeleop = Math.floor(totalPoints * 0.5);
          const estimatedEndgame = totalPoints - estimatedAuto - estimatedTeleop;
          
          setAutoCoralL1(Math.floor(estimatedAuto * 0.2).toString());
          setAutoCoralL2(Math.floor(estimatedAuto * 0.3).toString());
          setAutoCoralL3(Math.floor(estimatedAuto * 0.3).toString());
          setAutoCoralL4(Math.floor(estimatedAuto * 0.2).toString());
          
          setTeleopCoralL1(Math.floor(estimatedTeleop * 0.2).toString());
          setTeleopCoralL2(Math.floor(estimatedTeleop * 0.3).toString());
          setTeleopCoralL3(Math.floor(estimatedTeleop * 0.3).toString());
          setTeleopCoralL4(Math.floor(estimatedTeleop * 0.2).toString());
          
          if (estimatedEndgame >= 12) {
            setEndgameStatus('deepCage');
          } else if (estimatedEndgame >= 6) {
            setEndgameStatus('shallowCage');
          } else if (estimatedEndgame >= 2) {
            setEndgameStatus('parked');
          }
        }
      }
    }
  }, [params.autoFill, selectedTeam, selectedMatch, alliance]);
  
  const handleSave = () => {
    if (!selectedTeamId) {
      Alert.alert('Missing Information', 'Please select a team to scout.');
      return;
    }
    
    if (!selectedMatchNumber) {
      Alert.alert('Missing Information', 'Please select a match number.');
      return;
    }
    
    if (!scoutName.trim()) {
      Alert.alert('Missing Information', 'Please enter your name as the scout.');
      return;
    }
    
    // Calculate total points
    const autoCoralPoints = 
      parseInt(autoCoralL1 || '0') * 3 + 
      parseInt(autoCoralL2 || '0') * 4 + 
      parseInt(autoCoralL3 || '0') * 6 + 
      parseInt(autoCoralL4 || '0') * 7;
    
    const autoAlgaePoints = 
      parseInt(autoAlgaeProcessor || '0') * 6 + 
      parseInt(autoAlgaeNet || '0') * 4;
    
    const teleopCoralPoints = 
      parseInt(teleopCoralL1 || '0') * 2 + 
      parseInt(teleopCoralL2 || '0') * 3 + 
      parseInt(teleopCoralL3 || '0') * 4 + 
      parseInt(teleopCoralL4 || '0') * 5;
    
    const teleopAlgaePoints = 
      parseInt(teleopAlgaeProcessor || '0') * 6 + 
      parseInt(teleopAlgaeNet || '0') * 4;
    
    let endgamePoints = 0;
    switch (endgameStatus) {
      case 'parked': endgamePoints = 2; break;
      case 'shallowCage': endgamePoints = 6; break;
      case 'deepCage': endgamePoints = 12; break;
    }
    
    const penaltyPoints = 
      parseInt(minorFaults || '0') * 2 + 
      parseInt(majorFaults || '0') * 6;
    
    const totalPoints = 
      autoCoralPoints + 
      autoAlgaePoints + 
      teleopCoralPoints + 
      teleopAlgaePoints + 
      endgamePoints - 
      penaltyPoints;
    
    const record: ScoutingRecord = {
      id: generateId(),
      teamId: selectedTeamId,
      matchNumber: selectedMatchNumber,
      scoutName: scoutName.trim(),
      timestamp: Date.now(),
      
      // Auto
      autoLeavesBarge,
      autoCoralL1: parseInt(autoCoralL1 || '0'),
      autoCoralL2: parseInt(autoCoralL2 || '0'),
      autoCoralL3: parseInt(autoCoralL3 || '0'),
      autoCoralL4: parseInt(autoCoralL4 || '0'),
      autoAlgaeProcessor: parseInt(autoAlgaeProcessor || '0'),
      autoAlgaeNet: parseInt(autoAlgaeNet || '0'),
      
      // Teleop
      teleopCoralL1: parseInt(teleopCoralL1 || '0'),
      teleopCoralL2: parseInt(teleopCoralL2 || '0'),
      teleopCoralL3: parseInt(teleopCoralL3 || '0'),
      teleopCoralL4: parseInt(teleopCoralL4 || '0'),
      teleopAlgaeProcessor: parseInt(teleopAlgaeProcessor || '0'),
      teleopAlgaeNet: parseInt(teleopAlgaeNet || '0'),
      
      // Endgame
      endgameStatus,
      
      // Performance
      defenseRating,
      minorFaults: parseInt(minorFaults || '0'),
      majorFaults: parseInt(majorFaults || '0'),
      
      // Penalties
      yellowCard,
      redCard,
      
      // Comments
      comments,
      
      // Legacy support
      autoCoralScored: parseInt(autoCoralL1 || '0') + parseInt(autoCoralL2 || '0') + parseInt(autoCoralL3 || '0') + parseInt(autoCoralL4 || '0'),
      autoAlgaeScored: parseInt(autoAlgaeProcessor || '0') + parseInt(autoAlgaeNet || '0'),
      teleopCoralScored: parseInt(teleopCoralL1 || '0') + parseInt(teleopCoralL2 || '0') + parseInt(teleopCoralL3 || '0') + parseInt(teleopCoralL4 || '0'),
      teleopAlgaeScored: parseInt(teleopAlgaeProcessor || '0') + parseInt(teleopAlgaeNet || '0'),
      bargeLevel: endgameStatus === 'none' ? 0 : endgameStatus === 'parked' ? 1 : endgameStatus === 'shallowCage' ? 2 : 3,
      
      // Source and alliance
      source: 'manual',
      alliance
    };
    
    addRecord(record);
    Alert.alert('Success', 'Scouting record saved successfully');
    router.back();
  };
  
  const handleCancel = () => {
    router.back();
  };
  
  const renderRatingStars = (rating: number, setRating: (rating: number) => void) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map(star => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            style={styles.starButton}
          >
            <View style={[
              styles.star,
              star <= rating ? styles.starFilled : styles.starEmpty
            ]} />
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Create Scouting Record',
          headerLeft: () => (
            <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
              <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
              <Save size={24} color={colors.primary} />
            </TouchableOpacity>
          )
        }} 
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.infoBox}>
          <Info size={20} color={colors.primary} style={styles.infoIcon} />
          <Text style={styles.infoText}>
            Use this form to manually enter scouting data when TBA data is unavailable.
            For completed matches, you can also generate scouting records automatically from TBA data.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          {/* Scout Name */}
          <View style={styles.inputRow}>
            <View style={styles.inputIcon}>
              <User size={20} color={colors.primary} />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Scout Name</Text>
              <TextInput
                style={styles.input}
                value={scoutName}
                onChangeText={setScoutName}
                placeholder="Enter your name"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>
          
          {/* Team Selection */}
          <View style={styles.dropdownContainer}>
            <Text style={styles.label}>Team</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => {
                setShowTeamDropdown(!showTeamDropdown);
                setShowMatchDropdown(false);
              }}
            >
              <Text style={styles.dropdownButtonText}>
                {selectedTeam 
                  ? `#${selectedTeam.number || 'N/A'} - ${selectedTeam.name || 'Unknown Team'}` 
                  : 'Select a team'}
              </Text>
              {showTeamDropdown ? (
                <ChevronUp size={20} color={colors.textSecondary} />
              ) : (
                <ChevronDown size={20} color={colors.textSecondary} />
              )}
            </TouchableOpacity>
            
            {showTeamDropdown && (
              <View style={styles.dropdownMenu}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search teams..."
                  placeholderTextColor={colors.textSecondary}
                  value={teamSearchQuery}
                  onChangeText={setTeamSearchQuery}
                />
                <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                  {filteredTeams.map(team => {
                    if (!team || !team.id) return null;
                    return (
                      <TouchableOpacity
                        key={team.id.toString()}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setSelectedTeamId(team.id);
                          setShowTeamDropdown(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>
                          #{team.number || 'N/A'} - {team.name || 'Unknown Team'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}
          </View>
          
          {/* Match Selection */}
          <View style={styles.dropdownContainer}>
            <Text style={styles.label}>Match</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => {
                setShowMatchDropdown(!showMatchDropdown);
                setShowTeamDropdown(false);
              }}
            >
              <Text style={styles.dropdownButtonText}>
                {selectedMatchNumber 
                  ? `Match ${selectedMatchNumber}` 
                  : 'Select a match'}
              </Text>
              {showMatchDropdown ? (
                <ChevronUp size={20} color={colors.textSecondary} />
              ) : (
                <ChevronDown size={20} color={colors.textSecondary} />
              )}
            </TouchableOpacity>
            
            {showMatchDropdown && (
              <View style={styles.dropdownMenu}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search matches..."
                  placeholderTextColor={colors.textSecondary}
                  value={matchSearchQuery}
                  onChangeText={setMatchSearchQuery}
                  keyboardType="number-pad"
                />
                <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                  {filteredMatches.map(match => {
                    if (!match || !match.id) return null;
                    return (
                      <TouchableOpacity
                        key={match.id.toString()}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setSelectedMatchNumber(match.matchNumber);
                          setShowMatchDropdown(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>
                          Match {match.matchNumber} - {match.matchType || 'Unknown Type'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}
          </View>
          
          {/* Alliance Selection */}
          <View style={styles.allianceContainer}>
            <Text style={styles.label}>Alliance</Text>
            <View style={styles.allianceButtons}>
              <TouchableOpacity
                style={[
                  styles.allianceButton,
                  styles.redButton,
                  alliance === 'red' && styles.allianceButtonActive
                ]}
                onPress={() => setAlliance('red')}
              >
                <Text style={[
                  styles.allianceButtonText,
                  alliance === 'red' && styles.allianceButtonTextActive
                ]}>
                  Red
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.allianceButton,
                  styles.blueButton,
                  alliance === 'blue' && styles.allianceButtonActive
                ]}
                onPress={() => setAlliance('blue')}
              >
                <Text style={[
                  styles.allianceButtonText,
                  alliance === 'blue' && styles.allianceButtonTextActive
                ]}>
                  Blue
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        <View style={[styles.section, styles.autoSection]}>
          <Text style={[styles.sectionTitle, styles.autoColor]}>Autonomous</Text>
          
          {/* Auto Leaves BARGE */}
          <View style={styles.switchRow}>
            <Text style={styles.label}>Leaves BARGE</Text>
            <Switch
              value={autoLeavesBarge}
              onValueChange={setAutoLeavesBarge}
              trackColor={{ false: colors.gray[600], true: colors.success }}
              thumbColor={Platform.OS === 'ios' ? undefined : colors.text}
            />
          </View>
          
          <Text style={styles.subsectionTitle}>CORAL Scoring</Text>
          
          {/* Auto CORAL L1 */}
          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>L1 (Trough) - 3pts each</Text>
              <TextInput
                style={styles.input}
                value={autoCoralL1}
                onChangeText={setAutoCoralL1}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>
          
          {/* Auto CORAL L2 */}
          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>L2 (Low Branch) - 4pts each</Text>
              <TextInput
                style={styles.input}
                value={autoCoralL2}
                onChangeText={setAutoCoralL2}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>
          
          {/* Auto CORAL L3 */}
          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>L3 (Mid Branch) - 6pts each</Text>
              <TextInput
                style={styles.input}
                value={autoCoralL3}
                onChangeText={setAutoCoralL3}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>
          
          {/* Auto CORAL L4 */}
          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>L4 (High Branch) - 7pts each</Text>
              <TextInput
                style={styles.input}
                value={autoCoralL4}
                onChangeText={setAutoCoralL4}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>
          
          <Text style={styles.subsectionTitle}>ALGAE Scoring</Text>
          
          {/* Auto ALGAE Processor */}
          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Processor - 6pts each</Text>
              <TextInput
                style={styles.input}
                value={autoAlgaeProcessor}
                onChangeText={setAutoAlgaeProcessor}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>
          
          {/* Auto ALGAE Net */}
          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Net - 4pts each</Text>
              <TextInput
                style={styles.input}
                value={autoAlgaeNet}
                onChangeText={setAutoAlgaeNet}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>
        </View>
        
        <View style={[styles.section, styles.teleopSection]}>
          <Text style={[styles.sectionTitle, styles.teleopColor]}>Teleop</Text>
          
          <Text style={styles.subsectionTitle}>CORAL Scoring</Text>
          
          {/* Teleop CORAL L1 */}
          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>L1 (Trough) - 2pts each</Text>
              <TextInput
                style={styles.input}
                value={teleopCoralL1}
                onChangeText={setTeleopCoralL1}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>
          
          {/* Teleop CORAL L2 */}
          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>L2 (Low Branch) - 3pts each</Text>
              <TextInput
                style={styles.input}
                value={teleopCoralL2}
                onChangeText={setTeleopCoralL2}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>
          
          {/* Teleop CORAL L3 */}
          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>L3 (Mid Branch) - 4pts each</Text>
              <TextInput
                style={styles.input}
                value={teleopCoralL3}
                onChangeText={setTeleopCoralL3}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>
          
          {/* Teleop CORAL L4 */}
          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>L4 (High Branch) - 5pts each</Text>
              <TextInput
                style={styles.input}
                value={teleopCoralL4}
                onChangeText={setTeleopCoralL4}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>
          
          <Text style={styles.subsectionTitle}>ALGAE Scoring</Text>
          
          {/* Teleop ALGAE Processor */}
          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Processor - 6pts each</Text>
              <TextInput
                style={styles.input}
                value={teleopAlgaeProcessor}
                onChangeText={setTeleopAlgaeProcessor}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>
          
          {/* Teleop ALGAE Net */}
          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Net - 4pts each</Text>
              <TextInput
                style={styles.input}
                value={teleopAlgaeNet}
                onChangeText={setTeleopAlgaeNet}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>
        </View>
        
        <View style={[styles.section, styles.endgameSection]}>
          <Text style={[styles.sectionTitle, styles.endgameColor]}>Endgame</Text>
          
          {/* Endgame Status */}
          <Text style={styles.label}>BARGE/CAGE Status</Text>
          <View style={styles.endgameOptions}>
            <TouchableOpacity
              style={[
                styles.endgameOption,
                endgameStatus === 'none' && styles.endgameOptionSelected
              ]}
              onPress={() => setEndgameStatus('none')}
            >
              <Text style={[
                styles.endgameOptionText,
                endgameStatus === 'none' && styles.endgameOptionTextSelected
              ]}>
                None
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.endgameOption,
                endgameStatus === 'parked' && styles.endgameOptionSelected
              ]}
              onPress={() => setEndgameStatus('parked')}
            >
              <Text style={[
                styles.endgameOptionText,
                endgameStatus === 'parked' && styles.endgameOptionTextSelected
              ]}>
                Parked (2pts)
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.endgameOption,
                endgameStatus === 'shallowCage' && styles.endgameOptionSelected
              ]}
              onPress={() => setEndgameStatus('shallowCage')}
            >
              <Text style={[
                styles.endgameOptionText,
                endgameStatus === 'shallowCage' && styles.endgameOptionTextSelected
              ]}>
                Shallow CAGE (6pts)
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.endgameOption,
                endgameStatus === 'deepCage' && styles.endgameOptionSelected
              ]}
              onPress={() => setEndgameStatus('deepCage')}
            >
              <Text style={[
                styles.endgameOptionText,
                endgameStatus === 'deepCage' && styles.endgameOptionTextSelected
              ]}>
                Deep CAGE (12pts)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance</Text>
          
          {/* Defense Rating */}
          <View style={styles.ratingContainer}>
            <View style={styles.ratingHeader}>
              <Shield size={20} color={colors.primary} />
              <Text style={styles.ratingLabel}>Defense Capability</Text>
            </View>
            {renderRatingStars(defenseRating, setDefenseRating)}
          </View>
          
          {/* Minor Faults */}
          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Minor Faults (2pts each to opponent)</Text>
              <TextInput
                style={styles.input}
                value={minorFaults}
                onChangeText={setMinorFaults}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>
          
          {/* Major Faults */}
          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Major Faults (6pts each to opponent)</Text>
              <TextInput
                style={styles.input}
                value={majorFaults}
                onChangeText={setMajorFaults}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>
          
          {/* Penalties */}
          <View style={styles.penaltiesContainer}>
            <Text style={styles.label}>Penalties</Text>
            <View style={styles.penaltyRow}>
              <View style={styles.penaltyItem}>
                <Text style={styles.penaltyLabel}>Yellow Card</Text>
                <Switch
                  value={yellowCard}
                  onValueChange={setYellowCard}
                  trackColor={{ false: colors.gray[600], true: colors.warning }}
                  thumbColor={Platform.OS === 'ios' ? undefined : colors.text}
                />
              </View>
              
              <View style={styles.penaltyItem}>
                <Text style={styles.penaltyLabel}>Red Card</Text>
                <Switch
                  value={redCard}
                  onValueChange={setRedCard}
                  trackColor={{ false: colors.gray[600], true: colors.danger }}
                  thumbColor={Platform.OS === 'ios' ? undefined : colors.text}
                />
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          
          {/* Comments */}
          <View style={styles.textAreaContainer}>
            <Text style={styles.label}>Comments</Text>
            <TextInput
              style={styles.textArea}
              value={comments}
              onChangeText={setComments}
              placeholder="Enter any observations about the team's performance..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          <Button
            title="Save Record"
            onPress={handleSave}
            icon={<Save size={16} color={colors.white} />}
            style={styles.saveButton}
            fullWidth
          />
          
          <Button
            title="Cancel"
            onPress={handleCancel}
            variant="outline"
            style={styles.cancelButton}
            fullWidth
          />
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.gray[800],
    borderRadius: 8,
    padding: 12,
    margin: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  infoIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  autoSection: {
    borderLeftWidth: 4,
    borderLeftColor: '#4ade80', // Light green
  },
  teleopSection: {
    borderLeftWidth: 4,
    borderLeftColor: '#facc15', // Yellow
  },
  endgameSection: {
    borderLeftWidth: 4,
    borderLeftColor: '#f472b6', // Pink
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  autoColor: {
    color: '#4ade80', // Light green
  },
  teleopColor: {
    color: '#facc15', // Yellow
  },
  endgameColor: {
    color: '#f472b6', // Pink
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textSecondary,
    marginTop: 12,
    marginBottom: 8,
  },
  dropdownContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: colors.text,
  },
  dropdownMenu: {
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 4,
    maxHeight: 200,
  },
  searchInput: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    color: colors.text,
  },
  dropdownList: {
    maxHeight: 150,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownItemText: {
    fontSize: 16,
    color: colors.text,
  },
  allianceContainer: {
    marginBottom: 16,
  },
  allianceButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  allianceButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  redButton: {
    borderColor: colors.danger,
  },
  blueButton: {
    borderColor: colors.primary,
  },
  allianceButtonActive: {
    backgroundColor: colors.card,
  },
  allianceButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  allianceButtonTextActive: {
    color: colors.text,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  inputIcon: {
    width: 40,
    alignItems: 'center',
  },
  inputContainer: {
    flex: 1,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  endgameOptions: {
    marginBottom: 16,
  },
  endgameOption: {
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 8,
  },
  endgameOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.gray[800],
  },
  endgameOptionText: {
    fontSize: 16,
    color: colors.text,
  },
  endgameOptionTextSelected: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  ratingContainer: {
    marginBottom: 16,
  },
  ratingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingLabel: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  starButton: {
    padding: 8,
  },
  star: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  starEmpty: {
    borderWidth: 2,
    borderColor: colors.warning,
  },
  starFilled: {
    backgroundColor: colors.warning,
  },
  penaltiesContainer: {
    marginBottom: 16,
  },
  penaltyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  penaltyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    flex: 1,
    marginHorizontal: 4,
  },
  penaltyLabel: {
    fontSize: 14,
    color: colors.text,
    marginRight: 8,
  },
  textAreaContainer: {
    marginBottom: 16,
  },
  textArea: {
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    minHeight: 100,
  },
  buttonContainer: {
    padding: 16,
    gap: 12,
  },
  saveButton: {
    marginBottom: 8,
  },
  cancelButton: {
    marginBottom: 16,
  },
});