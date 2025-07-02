import { ScoutingRecord } from '@/types/scouting';

/**
 * Calculate a team's rating based on scouting records
 * Higher rating = better performance
 * 
 * @param teamId The team ID to calculate rating for
 * @param records All scouting records
 * @returns A rating from 0-10
 */
export function calculateTeamRating(teamId: number, records: ScoutingRecord[]): number {
  if (!records || !Array.isArray(records) || records.length === 0) {
    return 0;
  }
// Filter records for this team
const numericTeamId = Number(teamId);
const teamRecords = records.filter(record => record?.teamId === numericTeamId);

if (teamRecords.length === 0) {
  return 0;
}
  
  // Calculate average scores
  let totalScore = 0;
  let totalMatches = 0;
  teamRecords.forEach(record => {
    if (!record) return;
    
    // Calculate total points from this record
    const autoPoints = (
      (record.autoCoralL1 || 0) + 
      (record.autoCoralL2 || 0) * 2 + 
      (record.autoCoralL3 || 0) * 3 + 
      (record.autoCoralL4 || 0) * 4 + 
      (record.autoAlgaeProcessor || 0) * 2 + 
      (record.autoAlgaeNet || 0) * 3
    );
    
    const teleopPoints = (
      (record.teleopCoralL1 || 0) + 
      (record.teleopCoralL2 || 0) * 2 + 
      (record.teleopCoralL3 || 0) * 3 + 
      (record.teleopCoralL4 || 0) * 4 + 
      (record.teleopAlgaeProcessor || 0) * 2 + 
      (record.teleopAlgaeNet || 0) * 3
    );
    
    // Calculate endgame points
    let endgamePoints = 0;
    switch (record.endgameStatus) {
      case 'parked':
        endgamePoints = 2;
        break;
      case 'shallowCage':
        endgamePoints = 6;
        break;
      case 'deepCage':
        endgamePoints = 12;
        break;
      default:
        endgamePoints = 0;
    }
    
    // Calculate defense rating (0-5)
    const defenseRating = record.defenseRating || 0;
    
    // Calculate reliability (penalize for faults)
    const minorFaults = record.minorFaults || 0;
    const majorFaults = record.majorFaults || 0;
    const reliabilityFactor = Math.max(0, 1 - (minorFaults * 0.1 + majorFaults * 0.3));
    
    // Calculate total score for this match
    const matchScore = (autoPoints + teleopPoints + endgamePoints) * reliabilityFactor + defenseRating;
    
    totalScore += matchScore;
    totalMatches++;
  });
  
  // Calculate average score
  const averageScore = totalMatches > 0 ? totalScore / totalMatches : 0;
  
  // Convert to a 0-10 scale (assuming max possible score is around 100)
  return Math.min(10, Math.max(0, averageScore / 10));
}

/**
 * Find the best alliance partners for a team
 * 
 * @param myTeamId The team ID to find partners for
 * @param teams All available teams
 * @param records All scouting records
 * @returns Array of team IDs for the best alliance
 */
export function findBestAlliances(myTeamId: number, teams: any[], records: ScoutingRecord[]): number[] {
  if (!teams || !Array.isArray(teams) || teams.length === 0) {
    return [];
  }
  
  // Calculate ratings for all teams
  const teamRatings: {[key: number]: number} = {};
  teams.forEach(team => {
    if (team && team.number) {
      teamRatings[team.number] = calculateTeamRating(team.number, records);
    }
  });
  
  // Get my team's strengths and weaknesses
  const myTeamStrengths = getTeamStrengths(myTeamId, records);
  
  // Calculate compatibility scores for all teams
  const compatibilityScores: {[key: number]: number} = {};
  teams.forEach(team => {
    if (team && team.number && team.number !== myTeamId) {
      const teamStrengths = getTeamStrengths(team.number, records);
      const compatibilityScore = calculateCompatibility(myTeamStrengths, teamStrengths);
      const overallRating = teamRatings[team.number] || 0;
      
      // Combine compatibility and overall rating (70% compatibility, 30% overall rating)
      compatibilityScores[team.number] = (compatibilityScore * 0.7) + (overallRating * 0.3);
    }
  });
  
  // Sort teams by compatibility score
  const sortedTeams = Object.keys(compatibilityScores)
    .map(Number)
    .sort((a, b) => compatibilityScores[b] - compatibilityScores[a]);
  
  // Return the top teams (up to 2)
  return [myTeamId, ...sortedTeams.slice(0, 2)];
}

/**
 * Get a team's strengths and weaknesses
 * 
 * @param teamId The team ID
 * @param records All scouting records
 * @returns Object with strength scores for different aspects
 */
function getTeamStrengths(teamId: number, records: ScoutingRecord[]): any {
  if (!records || !Array.isArray(records)) {
    return {
      auto: 0,
      teleop: 0,
      endgame: 0,
      defense: 0,
      reliability: 0
    };
  }
  
  // Filter records for this team
const numericTeamId = Number(teamId);
const teamRecords = records.filter(record => record?.teamId === numericTeamId);

if (teamRecords.length === 0) {
  return {
    auto: 0,
    teleop: 0,
    endgame: 0,
    defense: 0,
    reliability: 0
  };
}

  
  // Calculate average scores for different aspects
  let totalAuto = 0;
  let totalTeleop = 0;
  let totalEndgame = 0;
  let totalDefense = 0;
  let totalReliability = 0;
  let totalMatches = 0;
  
  teamRecords.forEach(record => {
    if (!record) return;
    
    // Auto score
    const autoScore = (
      (record.autoCoralL1 || 0) + 
      (record.autoCoralL2 || 0) * 2 + 
      (record.autoCoralL3 || 0) * 3 + 
      (record.autoCoralL4 || 0) * 4 + 
      (record.autoAlgaeProcessor || 0) * 2 + 
      (record.autoAlgaeNet || 0) * 3
    );
    
    // Teleop score
    const teleopScore = (
      (record.teleopCoralL1 || 0) + 
      (record.teleopCoralL2 || 0) * 2 + 
      (record.teleopCoralL3 || 0) * 3 + 
      (record.teleopCoralL4 || 0) * 4 + 
      (record.teleopAlgaeProcessor || 0) * 2 + 
      (record.teleopAlgaeNet || 0) * 3
    );
    
    // Endgame score
    let endgameScore = 0;
    switch (record.endgameStatus) {
      case 'parked':
        endgameScore = 2;
        break;
      case 'shallowCage':
        endgameScore = 6;
        break;
      case 'deepCage':
        endgameScore = 12;
        break;
      default:
        endgameScore = 0;
    }
    
    // Defense rating (0-5)
    const defenseScore = record.defenseRating || 0;
    
    // Reliability (penalize for faults)
    const minorFaults = record.minorFaults || 0;
    const majorFaults = record.majorFaults || 0;
    const reliabilityScore = Math.max(0, 10 - (minorFaults * 1 + majorFaults * 3));
    
    totalAuto += autoScore;
    totalTeleop += teleopScore;
    totalEndgame += endgameScore;
    totalDefense += defenseScore;
    totalReliability += reliabilityScore;
    totalMatches++;
  });
  
  // Calculate averages
  return {
    auto: totalMatches > 0 ? totalAuto / totalMatches / 20 : 0, // Normalize to 0-1 scale
    teleop: totalMatches > 0 ? totalTeleop / totalMatches / 50 : 0, // Normalize to 0-1 scale
    endgame: totalMatches > 0 ? totalEndgame / totalMatches / 12 : 0, // Normalize to 0-1 scale
    defense: totalMatches > 0 ? totalDefense / totalMatches / 5 : 0, // Normalize to 0-1 scale
    reliability: totalMatches > 0 ? totalReliability / totalMatches / 10 : 0 // Normalize to 0-1 scale
  };
}

/**
 * Calculate compatibility between two teams
 * 
 * @param team1Strengths Strengths of team 1
 * @param team2Strengths Strengths of team 2
 * @returns Compatibility score (0-10)
 */
function calculateCompatibility(team1Strengths: any, team2Strengths: any): number {
  // Calculate complementary score (higher when teams complement each other)
  const complementaryScore = (
    // Auto - if one team is strong and the other is weak, they complement each other
    Math.abs(team1Strengths.auto - team2Strengths.auto) * 2 +
    
    // Teleop - both should be strong
    Math.min(team1Strengths.teleop, team2Strengths.teleop) * 3 +
    
    // Endgame - both should be strong
    Math.min(team1Strengths.endgame, team2Strengths.endgame) * 2 +
    
    // Defense - at least one should be good at defense
    Math.max(team1Strengths.defense, team2Strengths.defense) * 1.5 +
    
    // Reliability - both should be reliable
    Math.min(team1Strengths.reliability, team2Strengths.reliability) * 1.5
  );
  
  // Convert to a 0-10 scale
  return Math.min(10, Math.max(0, complementaryScore * 10));
}
