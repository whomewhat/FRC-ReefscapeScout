import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  Alert,
  TextInput,
  Modal
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { 
  Clock, 
  ClipboardList, 
  Plus,
  CheckCircle,
  XCircle,
  FileSpreadsheet,
  ArrowLeft,
  BarChart,
  Edit
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import Button from '@/components/Button';
import useAppStore from '@/store/app-store';
import useScoutingStore from '@/store/scouting-store';

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { matches, teams, updateMatch } = useAppStore();
  const { records } = useScoutingStore();
  
  const matchId = id;
  const match = matches.find(m => m.id.toString() === matchId);
  
  const [scoreModalVisible, setScoreModalVisible] = useState(false);
  const [redScore, setRedScore] = useState('');
  const [blueScore, setBlueScore] = useState('');
  const [editMode, setEditMode] = useState(false);
  
  if (!match) {
    return (
      <View style={styles.container}>
        <Stack.Screen 
          options={{ 
            title: 'Match Details',
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                <ArrowLeft size={24} color={colors.text} />
              </TouchableOpacity>
            )
          }} 
        />
        <Text style={styles.errorText}>Match not found</Text>
      </View>
    );
  }

  const getTeamName = (teamNumber: number) => {
    const team = teams.find(t => t.number === teamNumber);
    return team ? team.name : `Team ${teamNumber}`;
  };

  const getTeamId = (teamNumber: number) => {
    const team = teams.find(t => t.number === teamNumber);
    return team ? team.id : null;
  };

  const handleAddNote = (teamNumber: number) => {
    const teamId = getTeamId(teamNumber);
    if (teamId) {
      router.push({
        pathname: '/note/create',
        params: { 
          teamId: teamId.toString(),
          matchNumber: match.matchNumber.toString()
        }
      });
    } else {
      Alert.alert('Error', 'Team not found in database');
    }
  };

  const handleAddScoutingRecord = (teamNumber?: number) => {
    const params: Record<string, string> = { 
      matchNumber: match.matchNumber.toString() 
    };
    
    if (teamNumber) {
      const teamId = getTeamId(teamNumber);
      if (teamId) {
        params.teamId = teamId.toString();
        
        // Determine alliance
        if (match.redAlliance.includes(teamNumber)) {
          params.alliance = 'red';
        } else if (match.blueAlliance.includes(teamNumber)) {
          params.alliance = 'blue';
        }
        
        // If match is completed, auto-fill data
        if (match.completed) {
          params.autoFill = 'true';
        }
      }
    }
    
    router.push({
      pathname: '/(tabs)/scouting/create',
      params
    });
  };

  const handleMarkCompleted = () => {
    if (match.completed) {
      // If already completed, allow editing
      setRedScore(match.redScore !== undefined ? match.redScore.toString() : '');
      setBlueScore(match.blueScore !== undefined ? match.blueScore.toString() : '');
      setEditMode(true);
    }
    
    // Show modal to enter scores
    setScoreModalVisible(true);
  };
  
  const handleSubmitScores = () => {
    const parsedRedScore = parseInt(redScore);
    const parsedBlueScore = parseInt(blueScore);
    
    if (isNaN(parsedRedScore) || isNaN(parsedBlueScore)) {
      Alert.alert('Invalid Scores', 'Please enter valid numbers for both scores');
      return;
    }
    
    // Determine winner based on scores
    let winner = null;
    if (parsedRedScore > parsedBlueScore) {
      winner = 'red';
    } else if (parsedBlueScore > parsedRedScore) {
      winner = 'blue';
    } else if (parsedRedScore === parsedBlueScore) {
      winner = 'tie';
    }
    
    const updatedMatch = {
      ...match,
      completed: true,
      redScore: parsedRedScore,
      blueScore: parsedBlueScore,
      winner
    };
    
    updateMatch(updatedMatch);
    setScoreModalVisible(false);
    
    if (editMode) {
      Alert.alert('Match Updated', `Red: ${parsedRedScore} - Blue: ${parsedBlueScore}`);
      setEditMode(false);
    } else {
      Alert.alert('Match Completed', `Red: ${parsedRedScore} - Blue: ${parsedBlueScore}`);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  // Format the match time
  const formatMatchTime = (time: number | string | undefined) => {
    if (!time) return 'TBD';
    
    if (typeof time === 'number') {
      const date = new Date(time);
      return date.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric', 
        minute: '2-digit'
      });
    }
    
    return time;
  };
  
  // Get scouting records for this match
  const matchScoutingRecords = records.filter(record => record.matchNumber === match.matchNumber);
  
  // Check if we have scouting records for each team
  const getTeamScoutingStatus = (teamNumber: number) => {
    const teamId = getTeamId(teamNumber);
    if (!teamId) return false;
    
    return matchScoutingRecords.some(record => record.teamId === teamId);
  };

  // Render a team item
  const renderTeamItem = (teamNumber: number, isRed: boolean) => {
    return (
      <View key={teamNumber} style={styles.teamItem}>
        <View style={styles.teamInfo}>
          <Text style={styles.teamNumber}>#{teamNumber}</Text>
          <Text style={styles.teamName}>{getTeamName(teamNumber)}</Text>
        </View>
        <View style={styles.teamActions}>
          {getTeamScoutingStatus(teamNumber) ? (
            <View style={styles.scoutedBadge}>
              <CheckCircle size={12} color={colors.success} />
              <Text style={styles.scoutedText}>Scouted</Text>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleAddScoutingRecord(teamNumber)}
            >
              <BarChart size={16} color={colors.primary} />
              <Text style={styles.actionButtonText}>Scout</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleAddNote(teamNumber)}
          >
            <ClipboardList size={16} color={colors.primary} />
            <Text style={styles.actionButtonText}>Note</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Render scouting record
  const renderScoutingRecord = ({ item }) => {
    const team = teams.find(t => t.id === item.teamId);
    if (!team) return null;
    
    return (
      <TouchableOpacity 
        key={item.id}
        style={styles.scoutingRecordItem}
        onPress={() => router.push(`/scouting/${item.id}`)}
      >
        <View style={styles.scoutingRecordHeader}>
          <Text style={styles.scoutingRecordTeam}>
            #{team.number} - {team.name}
          </Text>
          <View style={[
            styles.allianceTag,
            item.alliance === 'red' ? styles.redTag : styles.blueTag
          ]}>
            <Text style={styles.allianceTagText}>
              {item.alliance === 'red' ? 'Red' : 'Blue'}
            </Text>
          </View>
        </View>
        
        <View style={styles.scoutingRecordDetails}>
          <View style={styles.scoutingRecordDetail}>
            <Text style={styles.scoutingRecordLabel}>Auto:</Text>
            <Text style={styles.scoutingRecordValue}>
              {(item.autoCoralL1 || 0) * 3 + 
               (item.autoCoralL2 || 0) * 4 + 
               (item.autoCoralL3 || 0) * 6 + 
               (item.autoCoralL4 || 0) * 7 + 
               (item.autoAlgaeProcessor || 0) * 6 + 
               (item.autoAlgaeNet || 0) * 4} pts
            </Text>
          </View>
          
          <View style={styles.scoutingRecordDetail}>
            <Text style={styles.scoutingRecordLabel}>Teleop:</Text>
            <Text style={styles.scoutingRecordValue}>
              {(item.teleopCoralL1 || 0) * 2 + 
               (item.teleopCoralL2 || 0) * 3 + 
               (item.teleopCoralL3 || 0) * 4 + 
               (item.teleopCoralL4 || 0) * 5 + 
               (item.teleopAlgaeProcessor || 0) * 6 + 
               (item.teleopAlgaeNet || 0) * 4} pts
            </Text>
          </View>
          
          <View style={styles.scoutingRecordDetail}>
            <Text style={styles.scoutingRecordLabel}>Endgame:</Text>
            <Text style={styles.scoutingRecordValue}>
              {item.endgameStatus === 'parked' ? '2 pts' : 
               item.endgameStatus === 'shallowCage' ? '6 pts' : 
               item.endgameStatus === 'deepCage' ? '12 pts' : '0 pts'}
            </Text>
          </View>
        </View>
        
        <View style={styles.scoutingRecordFooter}>
          <Text style={styles.scoutingRecordScout}>
            Scouted by {item.scoutName}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: `Match ${match.matchNumber}`,
          headerLeft: () => (
            <TouchableOpacity onPress={handleGoBack} style={styles.headerButton}>
              <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            match.completed ? (
              <CheckCircle size={24} color={colors.success} style={styles.headerIcon} />
            ) : (
              <XCircle size={24} color={colors.warning} style={styles.headerIcon} />
            )
          )
        }} 
      />
      
      <View style={styles.header}>
        <Text style={styles.matchTitle}>Match {match.matchNumber}</Text>
        {match.time && (
          <View style={styles.timeContainer}>
            <Clock size={16} color={colors.textSecondary} />
            <Text style={styles.time}>{formatMatchTime(match.time)}</Text>
          </View>
        )}
        
        <View style={styles.statusContainer}>
          {match.completed ? (
            <View style={styles.statusCompleted}>
              <Text style={styles.statusText}>Completed</Text>
            </View>
          ) : (
            <View style={styles.statusUpcoming}>
              <Text style={styles.statusText}>Upcoming</Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.scoreContainer}>
        {match.completed && match.redScore !== undefined && match.blueScore !== undefined ? (
          <View style={styles.scoreBoard}>
            <View style={styles.scoreTeam}>
              <View style={[styles.allianceIndicator, styles.redIndicator]} />
              <Text style={styles.scoreValue}>{match.redScore}</Text>
            </View>
            <Text style={styles.scoreVs}>vs</Text>
            <View style={styles.scoreTeam}>
              <Text style={styles.scoreValue}>{match.blueScore}</Text>
              <View style={[styles.allianceIndicator, styles.blueIndicator]} />
            </View>
            <TouchableOpacity 
              style={styles.editScoreButton}
              onPress={handleMarkCompleted}
            >
              <Edit size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
        ) : (
          <Button 
            title="Mark as Completed" 
            onPress={handleMarkCompleted}
            disabled={match.completed}
          />
        )}
      </View>
      
      <FlatList
        data={[1]} // Just a dummy item to use FlatList
        keyExtractor={() => "main"}
        renderItem={() => (
          <>
            <View style={styles.alliances}>
              <View style={styles.alliance}>
                <View style={styles.allianceHeader}>
                  <View style={[styles.allianceIndicator, styles.redIndicator]} />
                  <Text style={styles.allianceTitle}>Red Alliance</Text>
                </View>
                
                {match.redAlliance.map((teamNumber) => renderTeamItem(teamNumber, true))}
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.alliance}>
                <View style={styles.allianceHeader}>
                  <View style={[styles.allianceIndicator, styles.blueIndicator]} />
                  <Text style={styles.allianceTitle}>Blue Alliance</Text>
                </View>
                
                {match.blueAlliance.map((teamNumber) => renderTeamItem(teamNumber, false))}
              </View>
            </View>
            
            <View style={styles.notesSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Match Scouting</Text>
                <TouchableOpacity onPress={() => handleAddScoutingRecord()}>
                  <Plus size={18} color={colors.primary} />
                </TouchableOpacity>
              </View>
              
              {matchScoutingRecords.length > 0 ? (
                <View style={styles.scoutingRecordsList}>
                  {matchScoutingRecords.map(record => renderScoutingRecord({ item: record }))}
                </View>
              ) : (
                <View style={styles.emptyNotes}>
                  <FileSpreadsheet size={32} color={colors.gray[500]} />
                  <Text style={styles.emptyText}>No match scouting records yet</Text>
                  <Text style={styles.emptySubtext}>
                    Add scouting records about team performance during this match
                  </Text>
                  <Button 
                    title="Add Scouting Record" 
                    onPress={() => handleAddScoutingRecord()}
                    variant="outline"
                    size="small"
                    icon={<Plus size={14} color={colors.primary} />}
                    style={styles.emptyButton}
                  />
                </View>
              )}
            </View>
          </>
        )}
        contentContainerStyle={styles.contentContainer}
      />
      
      {/* Score Entry Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={scoreModalVisible}
        onRequestClose={() => setScoreModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editMode ? 'Edit Match Scores' : 'Enter Match Scores'}
            </Text>
            
            <View style={styles.scoreInputContainer}>
              <View style={styles.scoreInputGroup}>
                <View style={[styles.scoreInputLabel, styles.redScoreLabel]}>
                  <View style={[styles.allianceIndicator, styles.redIndicator]} />
                  <Text style={styles.scoreInputLabelText}>Red Score</Text>
                </View>
                <TextInput
                  style={styles.scoreInput}
                  value={redScore}
                  onChangeText={setRedScore}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
              
              <View style={styles.scoreInputGroup}>
                <View style={[styles.scoreInputLabel, styles.blueScoreLabel]}>
                  <View style={[styles.allianceIndicator, styles.blueIndicator]} />
                  <Text style={styles.scoreInputLabelText}>Blue Score</Text>
                </View>
                <TextInput
                  style={styles.scoreInput}
                  value={blueScore}
                  onChangeText={setBlueScore}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>
            
            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => setScoreModalVisible(false)}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title={editMode ? "Update Scores" : "Save Scores"}
                onPress={handleSubmitScores}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingBottom: 24,
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
  headerIcon: {
    marginRight: 16,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  matchTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  time: {
    fontSize: 16,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  statusContainer: {
    flexDirection: 'row',
  },
  statusCompleted: {
    backgroundColor: colors.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusUpcoming: {
    backgroundColor: colors.warning,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.background,
  },
  scoreContainer: {
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  scoreBoard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    position: 'relative',
  },
  scoreTeam: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginHorizontal: 8,
  },
  scoreVs: {
    fontSize: 18,
    color: colors.textSecondary,
    marginHorizontal: 16,
  },
  editScoreButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
  alliances: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  alliance: {
    marginBottom: 16,
  },
  allianceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  allianceIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  redIndicator: {
    backgroundColor: colors.danger,
  },
  blueIndicator: {
    backgroundColor: colors.primary,
  },
  allianceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  teamItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  teamInfo: {
    flex: 1,
  },
  teamNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  teamName: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  teamActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[800],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  actionButtonText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 4,
  },
  scoutedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[800],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  scoutedText: {
    fontSize: 14,
    color: colors.success,
    marginLeft: 4,
  },
  notesSection: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  emptyNotes: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    backgroundColor: colors.card,
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.gray[500],
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.gray[500],
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 32,
    marginBottom: 16,
  },
  emptyButton: {
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  scoreInputContainer: {
    marginBottom: 24,
  },
  scoreInputGroup: {
    marginBottom: 16,
  },
  scoreInputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  redScoreLabel: {
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
    paddingLeft: 8,
  },
  blueScoreLabel: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    paddingLeft: 8,
  },
  scoreInputLabelText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 8,
  },
  scoreInput: {
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    fontSize: 24,
    color: colors.text,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  scoutingRecordsList: {
    gap: 12,
  },
  scoutingRecordItem: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  scoutingRecordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoutingRecordTeam: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  allianceTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  redTag: {
    backgroundColor: colors.danger,
  },
  blueTag: {
    backgroundColor: colors.primary,
  },
  allianceTagText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.background,
  },
  scoutingRecordDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.gray[800],
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  scoutingRecordDetail: {
    alignItems: 'center',
  },
  scoutingRecordLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  scoutingRecordValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  scoutingRecordFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  scoutingRecordScout: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});