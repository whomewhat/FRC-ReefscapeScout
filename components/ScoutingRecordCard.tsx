import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ClipboardList, Calendar, User, Database } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { ScoutingRecord } from '@/types/scouting';

interface ScoutingRecordCardProps {
  record: ScoutingRecord;
  teamNumber: number;
  teamName: string;
  onPress: () => void;
}

export default function ScoutingRecordCard({ 
  record, 
  teamNumber, 
  teamName, 
  onPress 
}: ScoutingRecordCardProps) {
  if (!record) return null;
  
  // Calculate total points
  const autoCoralPoints = 
    (record.autoCoralL1 || 0) * 3 + 
    (record.autoCoralL2 || 0) * 4 + 
    (record.autoCoralL3 || 0) * 6 + 
    (record.autoCoralL4 || 0) * 7;
  
  const autoAlgaePoints = 
    (record.autoAlgaeProcessor || 0) * 6 + 
    (record.autoAlgaeNet || 0) * 4;
  
  const teleopCoralPoints = 
    (record.teleopCoralL1 || 0) * 2 + 
    (record.teleopCoralL2 || 0) * 3 + 
    (record.teleopCoralL3 || 0) * 4 + 
    (record.teleopCoralL4 || 0) * 5;
  
  const teleopAlgaePoints = 
    (record.teleopAlgaeProcessor || 0) * 6 + 
    (record.teleopAlgaeNet || 0) * 4;
  
  let endgamePoints = 0;
  switch (record.endgameStatus) {
    case 'parked': endgamePoints = 2; break;
    case 'shallowCage': endgamePoints = 6; break;
    case 'deepCage': endgamePoints = 12; break;
  }
  
  const penaltyPoints = 
    (record.minorFaults || 0) * 2 + 
    (record.majorFaults || 0) * 6;
  
  const totalPoints = 
    autoCoralPoints + 
    autoAlgaePoints + 
    teleopCoralPoints + 
    teleopAlgaePoints + 
    endgamePoints - 
    penaltyPoints;
  
  // Format date
  const formattedDate = record.timestamp 
    ? new Date(record.timestamp).toLocaleDateString() 
    : 'Unknown Date';
  
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.teamInfo}>
          <Text style={styles.teamNumber}>Team {teamNumber}</Text>
          <Text style={styles.teamName}>{teamName}</Text>
        </View>
        
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Score</Text>
          <Text style={styles.scoreValue}>{totalPoints}</Text>
        </View>
      </View>
      
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Calendar size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>Match {record.matchNumber}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <User size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>{record.scoutName}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <ClipboardList size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>{formattedDate}</Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <View style={styles.pointsBreakdown}>
          <View style={styles.pointCategory}>
            <Text style={styles.pointCategoryLabel}>Auto</Text>
            <Text style={styles.pointCategoryValue}>{autoCoralPoints + autoAlgaePoints}</Text>
          </View>
          
          <View style={styles.pointCategory}>
            <Text style={styles.pointCategoryLabel}>Teleop</Text>
            <Text style={styles.pointCategoryValue}>{teleopCoralPoints + teleopAlgaePoints}</Text>
          </View>
          
          <View style={styles.pointCategory}>
            <Text style={styles.pointCategoryLabel}>Endgame</Text>
            <Text style={styles.pointCategoryValue}>{endgamePoints}</Text>
          </View>
          
          {penaltyPoints > 0 && (
            <View style={styles.pointCategory}>
              <Text style={styles.pointCategoryLabel}>Penalties</Text>
              <Text style={[styles.pointCategoryValue, styles.penaltyValue]}>-{penaltyPoints}</Text>
            </View>
          )}
        </View>
        
        {record.source === 'tba' && (
          <View style={styles.sourceTag}>
            <Database size={12} color={colors.white} />
            <Text style={styles.sourceTagText}>TBA</Text>
          </View>
        )}
        
        {record.alliance && (
          <View style={[
            styles.allianceTag,
            record.alliance === 'red' ? styles.redAllianceTag : styles.blueAllianceTag
          ]}>
            <Text style={styles.allianceTagText}>
              {record.alliance === 'red' ? 'Red' : 'Blue'}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  teamInfo: {
    flex: 1,
  },
  teamNumber: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 2,
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  scoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray[800],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  scoreLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  details: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  pointsBreakdown: {
    flexDirection: 'row',
    flex: 1,
  },
  pointCategory: {
    marginRight: 12,
  },
  pointCategoryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  pointCategoryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  penaltyValue: {
    color: colors.danger,
  },
  sourceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 4,
  },
  sourceTagText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  allianceTag: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 4,
  },
  redAllianceTag: {
    backgroundColor: colors.danger,
  },
  blueAllianceTag: {
    backgroundColor: colors.primary,
  },
  allianceTagText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: 'bold',
  },
});