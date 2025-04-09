import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Info, 
  Award, 
  Clock, 
  Layers, 
  Anchor, 
  Fish,
  Droplets,
  Gauge,
  Ruler,
  Compass
} from 'lucide-react-native';
import { colors } from '@/constants/colors';

const { width } = Dimensions.get('window');

export default function ReefscapeScreen() {
  const [activeTab, setActiveTab] = useState('overview');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'scoring':
        return <ScoringTab />;
      case 'field':
        return <FieldTab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>REEFSCAPE</Text>
        <Text style={styles.subtitle}>2024 FRC Game</Text>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]} 
          onPress={() => setActiveTab('overview')}
        >
          <Info size={16} color={activeTab === 'overview' ? colors.primary : colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>Overview</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'scoring' && styles.activeTab]} 
          onPress={() => setActiveTab('scoring')}
        >
          <Award size={16} color={activeTab === 'scoring' ? colors.primary : colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'scoring' && styles.activeTabText]}>Scoring</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'field' && styles.activeTab]} 
          onPress={() => setActiveTab('field')}
        >
          <Layers size={16} color={activeTab === 'field' ? colors.primary : colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'field' && styles.activeTabText]}>Field</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderTabContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const OverviewTab = () => (
  <View>
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Game Overview</Text>
      <Text style={styles.sectionText}>
        REEFSCAPE is played by two alliances of three teams each. Alliances score points by collecting coral and algae and placing them in the reef. Teams must navigate their robots through the ocean-themed field while managing their resources effectively.
      </Text>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Match Timeline</Text>
      <View style={styles.timelineItem}>
        <View style={styles.timelineBadge}>
          <Clock size={16} color={colors.white} />
        </View>
        <View style={styles.timelineContent}>
          <Text style={styles.timelineTitle}>Auto Period (15 seconds)</Text>
          <Text style={styles.timelineText}>
            Robots operate autonomously to collect and place coral and algae. Higher points are awarded during this period.
          </Text>
        </View>
      </View>
      
      <View style={styles.timelineItem}>
        <View style={styles.timelineBadge}>
          <Clock size={16} color={colors.white} />
        </View>
        <View style={styles.timelineContent}>
          <Text style={styles.timelineTitle}>Teleop Period (2:15 minutes)</Text>
          <Text style={styles.timelineText}>
            Drivers control robots to continue collecting and placing game pieces. Strategic alliances can maximize scoring opportunities.
          </Text>
        </View>
      </View>
      
      <View style={styles.timelineItem}>
        <View style={styles.timelineBadge}>
          <Clock size={16} color={colors.white} />
        </View>
        <View style={styles.timelineContent}>
          <Text style={styles.timelineTitle}>Endgame (30 seconds)</Text>
          <Text style={styles.timelineText}>
            Robots can score additional points by parking in designated areas or climbing to different levels of the reef structure.
          </Text>
        </View>
      </View>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Game Pieces</Text>
      <View style={styles.gamePieceRow}>
        <View style={styles.gamePiece}>
          <View style={[styles.gamePieceIcon, { backgroundColor: colors.success }]}>
            <Fish size={24} color={colors.white} />
          </View>
          <Text style={styles.gamePieceTitle}>Coral</Text>
          <Text style={styles.gamePieceText}>
            Different sizes and shapes worth varying point values
          </Text>
        </View>
        
        <View style={styles.gamePiece}>
          <View style={[styles.gamePieceIcon, { backgroundColor: colors.warning }]}>
            <Droplets size={24} color={colors.white} />
          </View>
          <Text style={styles.gamePieceTitle}>Algae</Text>
          <Text style={styles.gamePieceText}>
            Can be processed or collected in nets for points
          </Text>
        </View>
      </View>
    </View>
  </View>
);

const ScoringTab = () => (
  <View>
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Scoring Summary</Text>
      <Text style={styles.sectionText}>
        Teams earn points by collecting and placing coral and algae in designated areas. Additional points are awarded for autonomous operation and endgame activities.
      </Text>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Auto Period Points</Text>
      <View style={styles.scoreRow}>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreValue}>3-7</Text>
          <Text style={styles.scoreLabel}>Coral Placement</Text>
        </View>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreValue}>4-6</Text>
          <Text style={styles.scoreLabel}>Algae Processing</Text>
        </View>
      </View>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Teleop Period Points</Text>
      <View style={styles.scoreRow}>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreValue}>2-5</Text>
          <Text style={styles.scoreLabel}>Coral Placement</Text>
        </View>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreValue}>4-6</Text>
          <Text style={styles.scoreLabel}>Algae Processing</Text>
        </View>
      </View>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Endgame Points</Text>
      <View style={styles.scoreRow}>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreValue}>2</Text>
          <Text style={styles.scoreLabel}>Parked</Text>
        </View>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreValue}>6</Text>
          <Text style={styles.scoreLabel}>Shallow Cage</Text>
        </View>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreValue}>12</Text>
          <Text style={styles.scoreLabel}>Deep Cage</Text>
        </View>
      </View>
    </View>
  </View>
);

const FieldTab = () => (
  <View>
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Field Layout</Text>
      <Text style={styles.sectionText}>
        The REEFSCAPE field features a complex underwater environment with multiple scoring zones, obstacles, and strategic elements.
      </Text>
      
      <View style={styles.fieldImageContainer}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1582967788606-a171c1080cb0?q=80&w=2070&auto=format&fit=crop' }} 
          style={styles.fieldImage}
          resizeMode="cover"
        />
        <Text style={styles.imageCaption}>Conceptual field layout (representative image)</Text>
      </View>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Key Field Elements</Text>
      
      <View style={styles.fieldElement}>
        <View style={styles.fieldElementIcon}>
          <Anchor size={20} color={colors.primary} />
        </View>
        <View style={styles.fieldElementContent}>
          <Text style={styles.fieldElementTitle}>Reef Structure</Text>
          <Text style={styles.fieldElementText}>
            Central scoring area with multiple levels for coral placement
          </Text>
        </View>
      </View>
      
      <View style={styles.fieldElement}>
        <View style={styles.fieldElementIcon}>
          <Gauge size={20} color={colors.primary} />
        </View>
        <View style={styles.fieldElementContent}>
          <Text style={styles.fieldElementTitle}>Algae Processor</Text>
          <Text style={styles.fieldElementText}>
            Specialized scoring mechanism for algae game pieces
          </Text>
        </View>
      </View>
      
      <View style={styles.fieldElement}>
        <View style={styles.fieldElementIcon}>
          <Ruler size={20} color={colors.primary} />
        </View>
        <View style={styles.fieldElementContent}>
          <Text style={styles.fieldElementTitle}>Barge</Text>
          <Text style={styles.fieldElementText}>
            Floating platform that can be balanced for endgame points
          </Text>
        </View>
      </View>
      
      <View style={styles.fieldElement}>
        <View style={styles.fieldElementIcon}>
          <Compass size={20} color={colors.primary} />
        </View>
        <View style={styles.fieldElementContent}>
          <Text style={styles.fieldElementTitle}>Navigation Zones</Text>
          <Text style={styles.fieldElementText}>
            Areas that robots must traverse to access different parts of the field
          </Text>
        </View>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: colors.card,
  },
  activeTab: {
    backgroundColor: colors.gray[800],
  },
  tabText: {
    marginLeft: 6,
    fontSize: 14,
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 0,
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  timelineText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  gamePieceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  gamePiece: {
    width: '48%',
    backgroundColor: colors.gray[800],
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  gamePieceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  gamePieceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  gamePieceText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  scoreItem: {
    width: '30%',
    backgroundColor: colors.gray[800],
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginRight: '3%',
    marginBottom: 12,
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  scoreLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  fieldImageContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  fieldImage: {
    width: width - 64,
    height: 200,
    borderRadius: 8,
  },
  imageCaption: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    fontStyle: 'italic',
  },
  fieldElement: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[800],
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  fieldElementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fieldElementContent: {
    flex: 1,
  },
  fieldElementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  fieldElementText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});