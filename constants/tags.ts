import { Tag } from '@/types';

// Organized tag categories for REEFSCAPE game
export const predefinedTags: Tag[] = [
  // Robot Capabilities
  { id: 'cap-1', name: 'Fast Cycle Time', category: 'Capabilities' },
  { id: 'cap-2', name: 'Strong Defense', category: 'Capabilities' },
  { id: 'cap-3', name: 'Precise Control', category: 'Capabilities' },
  { id: 'cap-4', name: 'High Maneuverability', category: 'Capabilities' },
  { id: 'cap-5', name: 'Durable Design', category: 'Capabilities' },
  { id: 'cap-6', name: 'Vision System', category: 'Capabilities' },
  { id: 'cap-7', name: 'Reliable Mechanism', category: 'Capabilities' },
  { id: 'cap-8', name: 'Fast Intake', category: 'Capabilities' },
  
  // REEFSCAPE Game Elements
  { id: 'game-1', name: 'CORAL Expert', category: 'Game Elements' },
  { id: 'game-2', name: 'ALGAE Expert', category: 'Game Elements' },
  { id: 'game-3', name: 'BARGE Specialist', category: 'Game Elements' },
  { id: 'game-4', name: 'CAGE Climber', category: 'Game Elements' },
  { id: 'game-5', name: 'L4 Branch Scorer', category: 'Game Elements' },
  { id: 'game-6', name: 'Processor Feeder', category: 'Game Elements' },
  { id: 'game-7', name: 'Net Scorer', category: 'Game Elements' },
  { id: 'game-8', name: 'Trough Scorer', category: 'Game Elements' },
  
  // Autonomous
  { id: 'auto-1', name: 'Reliable Auto', category: 'Autonomous' },
  { id: 'auto-2', name: 'Multi-path Auto', category: 'Autonomous' },
  { id: 'auto-3', name: 'Auto CORAL Scoring', category: 'Autonomous' },
  { id: 'auto-4', name: 'Auto ALGAE Scoring', category: 'Autonomous' },
  { id: 'auto-5', name: 'Auto Mobility', category: 'Autonomous' },
  { id: 'auto-6', name: 'Auto Fails Often', category: 'Autonomous' },
  { id: 'auto-7', name: 'Auto L4 Scorer', category: 'Autonomous' },
  { id: 'auto-8', name: 'Auto Processor', category: 'Autonomous' },
  
  // Strategy
  { id: 'strat-1', name: 'Offensive Focus', category: 'Strategy' },
  { id: 'strat-2', name: 'Defensive Focus', category: 'Strategy' },
  { id: 'strat-3', name: 'Balanced Strategy', category: 'Strategy' },
  { id: 'strat-4', name: 'Support Role', category: 'Strategy' },
  { id: 'strat-5', name: 'Lead Scorer', category: 'Strategy' },
  { id: 'strat-6', name: 'Endgame Specialist', category: 'Strategy' },
  { id: 'strat-7', name: 'High Branch Focus', category: 'Strategy' },
  { id: 'strat-8', name: 'Processor Focus', category: 'Strategy' },
  
  // Performance
  { id: 'perf-1', name: 'Consistent', category: 'Performance' },
  { id: 'perf-2', name: 'Inconsistent', category: 'Performance' },
  { id: 'perf-3', name: 'Improving', category: 'Performance' },
  { id: 'perf-4', name: 'Declining', category: 'Performance' },
  { id: 'perf-5', name: 'Strong Driver', category: 'Performance' },
  { id: 'perf-6', name: 'Weak Driver', category: 'Performance' },
  { id: 'perf-7', name: 'Fast Cycle', category: 'Performance' },
  { id: 'perf-8', name: 'Slow Cycle', category: 'Performance' },
  
  // Alliance Compatibility
  { id: 'ally-1', name: 'Good Partner', category: 'Alliance' },
  { id: 'ally-2', name: 'Needs Support', category: 'Alliance' },
  { id: 'ally-3', name: 'Complements Us', category: 'Alliance' },
  { id: 'ally-4', name: 'Communication Issues', category: 'Alliance' },
  { id: 'ally-5', name: 'Strategic Alignment', category: 'Alliance' },
  { id: 'ally-6', name: 'Cage Climber', category: 'Alliance' },
  { id: 'ally-7', name: 'High Scorer', category: 'Alliance' },
  
  // Issues
  { id: 'issue-1', name: 'Mechanical Issues', category: 'Issues' },
  { id: 'issue-2', name: 'Electrical Issues', category: 'Issues' },
  { id: 'issue-3', name: 'Programming Issues', category: 'Issues' },
  { id: 'issue-4', name: 'Communication Issues', category: 'Issues' },
  { id: 'issue-5', name: 'Penalty Prone', category: 'Issues' },
  { id: 'issue-6', name: 'Tipping Issues', category: 'Issues' },
  { id: 'issue-7', name: 'Intake Problems', category: 'Issues' },
  { id: 'issue-8', name: 'Climbing Failures', category: 'Issues' },
  
  // Miscellaneous
  { id: 'misc-1', name: 'Rookie Team', category: 'Miscellaneous' },
  { id: 'misc-2', name: 'Veteran Team', category: 'Miscellaneous' },
  { id: 'misc-3', name: 'Innovative Design', category: 'Miscellaneous' },
  { id: 'misc-4', name: 'Unique Strategy', category: 'Miscellaneous' },
  { id: 'misc-5', name: 'Follow Up Needed', category: 'Miscellaneous' },
  { id: 'misc-6', name: 'Potential Alliance', category: 'Miscellaneous' },
];

// Get tags grouped by category
export const getTagsByCategory = () => {
  const categories: { [key: string]: Tag[] } = {};
  
  predefinedTags.forEach(tag => {
    if (!categories[tag.category]) {
      categories[tag.category] = [];
    }
    categories[tag.category].push(tag);
  });
  
  return categories;
};

// Get all tag names as a flat array
export const getAllTagNames = (): string[] => {
  return predefinedTags.map(tag => tag.name);
};