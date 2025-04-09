import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Edit, Trash2, Save, X } from 'lucide-react-native';
import useScoutingStore from '@/store/scouting-store';
import useAppStore from '@/store/app-store';
import { colors } from '@/constants/colors';
import Button from '@/components/Button';

export default function ScoutingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { records, updateRecord, removeRecord } = useScoutingStore();
  const { teams } = useAppStore();
  const [record, setRecord] = useState(null);
  const [team, setTeam] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedComments, setEditedComments] = useState('');

  useEffect(() => {
    if (id) {
      const foundRecord = records.find(r => r.id === id);
      if (foundRecord) {
        setRecord(foundRecord);
        setEditedComments(foundRecord.comments || '');
        
        // Find team info
        const teamInfo = teams.find(t => 
          t.id === foundRecord.teamId || 
          t.number === foundRecord.teamId ||
          t.number === Number(foundRecord.teamId) ||
          String(t.number) === String(foundRecord.teamId)
        );
        setTeam(teamInfo);
      }
    }
  }, [id, records, teams]);

  const handleDelete = () => {
    Alert.alert(
      'Delete Scouting Record',
      'Are you sure you want to delete this scouting record? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            if (id) {
              removeRecord(id);
              router.back();
            }
          }
        }
      ]
    );
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (record) {
      const updatedRecord = {
        ...record,
        comments: editedComments
      };
      updateRecord(updatedRecord);
      setRecord(updatedRecord);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedComments(record?.comments || '');
    setIsEditing(false);
  };

  if (!record) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scouting Record</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.notFoundText}>Record not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderScoreSection = (title, items) => (
    <View style={styles.scoreSection}>
      <Text style={styles.scoreSectionTitle}>{title}</Text>
      <View style={styles.scoreGrid}>
        {items.map((item, index) => (
          <View key={index} style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>{item.label}</Text>
            <Text style={styles.scoreValue}>{item.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const autoScores = [
    { label: 'Coral L1', value: record.autoCoralL1 || 0 },
    { label: 'Coral L2', value: record.autoCoralL2 || 0 },
    { label: 'Coral L3', value: record.autoCoralL3 || 0 },
    { label: 'Coral L4', value: record.autoCoralL4 || 0 },
    { label: 'Algae Processor', value: record.autoAlgaeProcessor || 0 },
    { label: 'Algae Net', value: record.autoAlgaeNet || 0 },
  ];

  const teleopScores = [
    { label: 'Coral L1', value: record.teleopCoralL1 || 0 },
    { label: 'Coral L2', value: record.teleopCoralL2 || 0 },
    { label: 'Coral L3', value: record.teleopCoralL3 || 0 },
    { label: 'Coral L4', value: record.teleopCoralL4 || 0 },
    { label: 'Algae Processor', value: record.teleopAlgaeProcessor || 0 },
    { label: 'Algae Net', value: record.teleopAlgaeNet || 0 },
  ];

  const endgameStatusText = () => {
    switch (record.endgameStatus) {
      case 'parked': return 'Parked';
      case 'shallowCage': return 'Shallow Cage';
      case 'deepCage': return 'Deep Cage';
      default: return 'None';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {team ? `Team ${team.number} - ${team.name}` : `Team ${record.teamId}`}
        </Text>
        <View style={styles.headerRight}>
          {!isEditing && (
            <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
              <Trash2 size={20} color={colors.danger} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Match Number:</Text>
            <Text style={styles.infoValue}>{record.matchNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Alliance:</Text>
            <View style={[
              styles.allianceIndicator, 
              { backgroundColor: record.alliance === 'red' ? colors.red : colors.blue }
            ]}>
              <Text style={styles.allianceText}>
                {record.alliance === 'red' ? 'Red' : 'Blue'}
              </Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Scout Name:</Text>
            <Text style={styles.infoValue}>{record.scoutName || 'Unknown'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Source:</Text>
            <Text style={styles.infoValue}>{record.source === 'tba' ? 'The Blue Alliance' : 'Manual'}</Text>
          </View>
        </View>
        
        <View style={styles.scoreCard}>
          <Text style={styles.cardTitle}>Performance Summary</Text>
          
          {renderScoreSection('Autonomous', autoScores)}
          
          <View style={styles.divider} />
          
          {renderScoreSection('Teleop', teleopScores)}
          
          <View style={styles.divider} />
          
          <View style={styles.endgameSection}>
            <Text style={styles.scoreSectionTitle}>Endgame</Text>
            <View style={styles.endgameRow}>
              <Text style={styles.endgameLabel}>Status:</Text>
              <Text style={styles.endgameValue}>{endgameStatusText()}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.performanceCard}>
          <Text style={styles.cardTitle}>Performance Metrics</Text>
          
          <View style={styles.performanceRow}>
            <Text style={styles.performanceLabel}>Defense Rating:</Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map(rating => (
                <View 
                  key={rating} 
                  style={[
                    styles.ratingDot, 
                    { backgroundColor: rating <= (record.defenseRating || 0) ? colors.primary : colors.gray[700] }
                  ]} 
                />
              ))}
            </View>
          </View>
          
          <View style={styles.performanceRow}>
            <Text style={styles.performanceLabel}>Minor Faults:</Text>
            <Text style={styles.performanceValue}>{record.minorFaults || 0}</Text>
          </View>
          
          <View style={styles.performanceRow}>
            <Text style={styles.performanceLabel}>Major Faults:</Text>
            <Text style={styles.performanceValue}>{record.majorFaults || 0}</Text>
          </View>
          
          <View style={styles.performanceRow}>
            <Text style={styles.performanceLabel}>Yellow Card:</Text>
            <Text style={styles.performanceValue}>{record.yellowCard ? 'Yes' : 'No'}</Text>
          </View>
          
          <View style={styles.performanceRow}>
            <Text style={styles.performanceLabel}>Red Card:</Text>
            <Text style={styles.performanceValue}>{record.redCard ? 'Yes' : 'No'}</Text>
          </View>
        </View>
        
        <View style={styles.commentsCard}>
          <View style={styles.commentsHeader}>
            <Text style={styles.cardTitle}>Comments</Text>
            {!isEditing ? (
              <TouchableOpacity onPress={handleEdit}>
                <Edit size={20} color={colors.primary} />
              </TouchableOpacity>
            ) : (
              <View style={styles.editActions}>
                <TouchableOpacity onPress={handleCancelEdit} style={styles.editActionButton}>
                  <X size={20} color={colors.danger} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSaveEdit} style={styles.editActionButton}>
                  <Save size={20} color={colors.success} />
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          {isEditing ? (
            <TextInput
              style={styles.commentsInput}
              value={editedComments}
              onChangeText={setEditedComments}
              multiline
              placeholder="Enter comments about this team's performance..."
              placeholderTextColor={colors.gray[500]}
            />
          ) : (
            <Text style={styles.commentsText}>
              {record.comments || 'No comments provided.'}
            </Text>
          )}
        </View>
        
        <View style={styles.buttonContainer}>
          <Button 
            title="Back to Scouting" 
            onPress={() => router.push('/scouting')}
            style={styles.button}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: 18,
    color: colors.text,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 28,
    alignItems: 'flex-end',
  },
  deleteButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  allianceIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  allianceText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  scoreCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  scoreSection: {
    marginBottom: 12,
  },
  scoreSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  scoreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  scoreItem: {
    width: '48%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: colors.background,
    borderRadius: 8,
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  scoreValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  endgameSection: {
    marginBottom: 8,
  },
  endgameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  endgameLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  endgameValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  performanceCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  performanceLabel: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  performanceValue: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginLeft: 4,
  },
  commentsCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  commentsText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
  },
  commentsInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
  },
  editActionButton: {
    marginLeft: 12,
  },
  buttonContainer: {
    marginTop: 8,
  },
  button: {
    marginBottom: 8,
  },
});