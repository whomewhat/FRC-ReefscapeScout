import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { colors } from '@/constants/colors';
import { Compass, Anchor, Ship, Waves, Target, Award, Lightbulb, AlertTriangle } from 'lucide-react-native';

export default function ReefscapeGuide() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>REEFSCAPE: 2025 FRC Game Guide</Text>
        <Text style={styles.subtitle}>Team 5268 Strategy Notes</Text>
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Compass size={24} color={colors.primary} />
          <Text style={styles.sectionTitle}>Game Overview</Text>
        </View>
        <Text style={styles.paragraph}>
          REEFSCAPE is played on a 27' x 54' field where alliances must navigate underwater challenges, 
          collect and place coral fragments, and anchor their robots to score points. The game combines 
          precise object manipulation, strategic positioning, and autonomous navigation.
        </Text>
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Target size={24} color={colors.primary} />
          <Text style={styles.sectionTitle}>Key Scoring Elements</Text>
        </View>
        <View style={styles.bulletPoints}>
          <View style={styles.bulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>CORAL Fragments:</Text> Score on the REEF at different levels
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>CORAL Levels (Auto/Teleop):</Text>
            </Text>
          </View>
          <View style={styles.indentedBulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>
              L1 Trough: 3 pts / 2 pts
            </Text>
          </View>
          <View style={styles.indentedBulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>
              L2 Low Branch: 4 pts / 3 pts
            </Text>
          </View>
          <View style={styles.indentedBulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>
              L3 Mid Branch: 6 pts / 4 pts
            </Text>
          </View>
          <View style={styles.indentedBulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>
              L4 High Branch: 7 pts / 5 pts
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>ALGAE:</Text>
            </Text>
          </View>
          <View style={styles.indentedBulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>
              Processor: 6 pts
            </Text>
          </View>
          <View style={styles.indentedBulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>
              Net: 4 pts
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Endgame:</Text>
            </Text>
          </View>
          <View style={styles.indentedBulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>
              PARK in BARGE Zone: 2 pts
            </Text>
          </View>
          <View style={styles.indentedBulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>
              Shallow CAGE: 6 pts
            </Text>
          </View>
          <View style={styles.indentedBulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>
              Deep CAGE: 12 pts
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Penalties:</Text>
            </Text>
          </View>
          <View style={styles.indentedBulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>
              Minor Foul: +2 pts to opponent
            </Text>
          </View>
          <View style={styles.indentedBulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>
              Major Foul: +6 pts to opponent
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ship size={24} color={colors.primary} />
          <Text style={styles.sectionTitle}>Robot Design Considerations</Text>
        </View>
        <View style={styles.bulletPoints}>
          <View style={styles.bulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Manipulator:</Text> Need precise grabbing mechanism for CORAL fragments
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Drivetrain:</Text> Must handle variable "current" forces on field
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Climbing:</Text> Mechanism to secure to CAGE for endgame points
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Reach:</Text> Ability to place CORAL at highest branch level (L4)
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Vision:</Text> Camera system to identify CORAL and ALGAE placement locations
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Anchor size={24} color={colors.primary} />
          <Text style={styles.sectionTitle}>Team 5268 Strategy Suggestions</Text>
        </View>
        <View style={styles.bulletPoints}>
          <View style={styles.bulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>
              Focus on reliable autonomous CORAL scoring at higher levels (L3-L4)
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>
              Prioritize Deep CAGE capability - high point value (12 points)
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>
              Design for stability in changing currents - low center of gravity
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>
              Develop simple but effective CORAL manipulator with quick release
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>
              Create alliance strategy focused on complementary capabilities
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Waves size={24} color={colors.primary} />
          <Text style={styles.sectionTitle}>Scouting Focus Areas</Text>
        </View>
        <View style={styles.bulletPoints}>
          <View style={styles.bulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>
              Autonomous reliability and scoring capability
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>
              Cycle time for CORAL fragment collection and placement
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>
              Ability to score at higher levels (L3-L4 branches)
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>
              CAGE climbing success rate and time required
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>
              Driving skill in variable current conditions
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Award size={24} color={colors.primary} />
          <Text style={styles.sectionTitle}>Ideal Alliance Partners</Text>
        </View>
        <Text style={styles.paragraph}>
          Look for teams with complementary capabilities to our robot design:
        </Text>
        <View style={styles.bulletPoints}>
          <View style={styles.bulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>
              If we focus on CORAL collection, find partners good at CAGE climbing
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>
              If we excel at autonomous, partner with teams strong in teleop
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>
              Teams with reliable performance over flashy but inconsistent robots
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>
              Partners with strong drivers who can navigate currents effectively
            </Text>
          </View>
        </View>
      </View>
      
      {/* New section with team member suggestions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Lightbulb size={24} color={colors.primary} />
          <Text style={styles.sectionTitle}>Team Member Suggestions</Text>
        </View>
        <View style={styles.memberSuggestion}>
          <Text style={styles.memberName}>Alex (Programming):</Text>
          <Text style={styles.memberText}>
            "We should focus on developing a robust vision system that can identify CORAL patterns even in variable lighting conditions. I suggest using AprilTags for field navigation and a separate camera system for CORAL identification."
          </Text>
        </View>
        <View style={styles.memberSuggestion}>
          <Text style={styles.memberName}>Jamie (Mechanical):</Text>
          <Text style={styles.memberText}>
            "For the CAGE climbing mechanism, I'm thinking of a pneumatic-actuated hook system that can deploy quickly and secure firmly. We should test different hook designs to find one that's reliable but not too complex."
          </Text>
        </View>
        <View style={styles.memberSuggestion}>
          <Text style={styles.memberName}>Taylor (Strategy):</Text>
          <Text style={styles.memberText}>
            "Based on our team's strengths, I think we should prioritize autonomous reliability and quick cycle times over complex mechanisms. Let's aim to be the team that consistently scores 20-30 points in autonomous rather than attempting high-risk, high-reward strategies."
          </Text>
        </View>
        <View style={styles.memberSuggestion}>
          <Text style={styles.memberName}>Morgan (Drive Team):</Text>
          <Text style={styles.memberText}>
            "We need to practice driving in simulated current conditions. I suggest building a practice field with fans that can create variable resistance to simulate the currents. This will help our drivers adapt to changing conditions during matches."
          </Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <AlertTriangle size={24} color={colors.warning} />
          <Text style={styles.sectionTitle}>Potential Challenges</Text>
        </View>
        <View style={styles.bulletPoints}>
          <View style={styles.bulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>
              Variable currents may affect robot stability and precision
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>
              CORAL fragment manipulation requires delicate but secure grip
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>
              CAGE climbing points may be contested by multiple robots
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>
              Balancing autonomous capabilities with teleop effectiveness
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>
              Coordinating with alliance partners in dynamic underwater environment
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <AlertTriangle size={24} color={colors.warning} />
          <Text style={styles.sectionTitle}>Critical Rules</Text>
        </View>
        <View style={styles.bulletPoints}>
          <View style={styles.bulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Robot Limits:</Text> Max extension 18 in. beyond frame perimeter (R415)
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Control Limits:</Text> Only 1 CORAL + 1 ALGAE at a time (G409)
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Autonomous:</Text> No opponent CAGE contact (G405)
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Defense:</Text> Pinning opponents &gt;15 sec risks fouls (G211)
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Penalties:</Text> Damaging SCORING ELEMENTS (G408) risks yellow cards
            </Text>
          </View>
        </View>
      </View>
      
      <Text style={styles.disclaimer}>
        Note: REEFSCAPE is a hypothetical 2025 FRC game concept created for this app. The actual 2025 game will be revealed by FIRST in January 2025.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.primary,
    marginBottom: 8,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 8,
  },
  paragraph: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    marginBottom: 12,
  },
  bulletPoints: {
    marginTop: 8,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  indentedBulletPoint: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
    marginLeft: 20,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 8,
    marginRight: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  bold: {
    fontWeight: 'bold',
  },
  disclaimer: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  },
  memberSuggestion: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 6,
  },
  memberText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    fontStyle: 'italic',
  },
});
