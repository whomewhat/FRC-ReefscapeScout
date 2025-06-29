import { Match, Team } from '@/types';
import { ScoutingRecord } from '@/types/scouting';
import { generateId } from '@/utils/helpers';

/**
 * Convert TBA match data to scouting records
 * This function takes match data from The Blue Alliance API and converts it to scouting records
 * that can be used in the app.
 */
export function convertMatchesToScoutingRecords(
  matches: Match[],
  teams: Team[],
  myTeamNumber?: number
): ScoutingRecord[] {
  if (!matches || !Array.isArray(matches) || matches.length === 0) {
    return [];
  }
  const scoutingRecords: ScoutingRecord[] = [];
  const processedMatchTeams = new Set<string>(); // Track processed match-team combinations

  // Process each match
  matches.forEach(match => {
    if (!match) {
      return;
    }
    
    // Skip matches that haven't been played yet
    if (!match.completed) {
      return;
    }
    
    // Get teams from both alliances
    const redAlliance = match.redAlliance || [];
    const blueAlliance = match.blueAlliance || [];
    

    
    // Process red alliance teams
    redAlliance.forEach(teamNumber => {
      if (!teamNumber) {
        return;
      }
      
      // Create a unique key for this match-team combination
      const matchTeamKey = `${match.id}-${teamNumber}-red`;
      
      // Skip if we've already processed this match-team combination
      if (processedMatchTeams.has(matchTeamKey)) {
        return;
      }
      
      // Find team in teams array
      const team = teams.find(t => t && (t.number === teamNumber || t.team_number === teamNumber));
      if (!team) {
        return;
      }
      
      const teamId = team.id || team.key || teamNumber;
      
      // Create scouting record
      const record = createScoutingRecordFromMatch(match, teamId, 'red', myTeamNumber);
      if (record) {
        scoutingRecords.push(record);
        processedMatchTeams.add(matchTeamKey); // Mark as processed
      }
    });
    
    // Process blue alliance teams
    blueAlliance.forEach(teamNumber => {
      if (!teamNumber) {
        return;
      }
      
      // Create a unique key for this match-team combination
      const matchTeamKey = `${match.id}-${teamNumber}-blue`;
      
      // Skip if we've already processed this match-team combination
      if (processedMatchTeams.has(matchTeamKey)) {
        return;
      }
      
      // Find team in teams array
      const team = teams.find(t => t && (t.number === teamNumber || t.team_number === teamNumber));
      if (!team) {
        return;
      }
      
      const teamId = team.id || team.key || teamNumber;
      
      // Create scouting record
      const record = createScoutingRecordFromMatch(match, teamId, 'blue', myTeamNumber);
      if (record) {
        scoutingRecords.push(record);
        processedMatchTeams.add(matchTeamKey); // Mark as processed
      }
    });
  });

  return scoutingRecords;
}

/**
 * Create a scouting record from a match
 */
function createScoutingRecordFromMatch(
  match: Match,
  teamId: number | string,
  alliance: 'red' | 'blue',
  myTeamNumber?: number
): ScoutingRecord | null {
  if (!match) {
    return null;
  }
  
  // Get alliance score
  const allianceScore = alliance === 'red' ? match.redScore : match.blueScore;
  if (allianceScore === undefined) {
    return null;
  }
  
  // Get opponent score
  const opponentScore = alliance === 'red' ? match.blueScore : match.redScore;
  if (opponentScore === undefined) {
    return null;
  }
  
  // Determine if this team won
  const winner = match.winner || (allianceScore > opponentScore ? alliance : allianceScore < opponentScore ? (alliance === 'red' ? 'blue' : 'red') : 'tie');
  const won = winner === alliance;
  
  // Calculate estimated contributions
  // This is a rough estimate - in a real app, you'd use actual breakdowns from TBA
  const teamCount = alliance === 'red' ? (match.redAlliance?.length || 3) : (match.blueAlliance?.length || 3);
  const estimatedContribution = Math.floor(allianceScore / teamCount);
  
  // Estimate auto and teleop points (30% auto, 50% teleop, 20% endgame)
  const estimatedAuto = Math.floor(estimatedContribution * 0.3);
  const estimatedTeleop = Math.floor(estimatedContribution * 0.5);
  const estimatedEndgame = Math.floor(estimatedContribution * 0.2);
  
  // Distribute auto points
  const autoCoralL1 = Math.floor(estimatedAuto * 0.2);
  const autoCoralL2 = Math.floor(estimatedAuto * 0.3);
  const autoCoralL3 = Math.floor(estimatedAuto * 0.3);
  const autoCoralL4 = Math.floor(estimatedAuto * 0.2);
  const autoAlgaeProcessor = Math.floor(estimatedAuto * 0.1);
  const autoAlgaeNet = Math.floor(estimatedAuto * 0.1);
  
  // Distribute teleop points
  const teleopCoralL1 = Math.floor(estimatedTeleop * 0.2);
  const teleopCoralL2 = Math.floor(estimatedTeleop * 0.3);
  const teleopCoralL3 = Math.floor(estimatedTeleop * 0.3);
  const teleopCoralL4 = Math.floor(estimatedTeleop * 0.2);
  const teleopAlgaeProcessor = Math.floor(estimatedTeleop * 0.1);
  const teleopAlgaeNet = Math.floor(estimatedTeleop * 0.1);
  
  // Determine endgame status based on points
  let endgameStatus: 'none' | 'parked' | 'shallowCage' | 'deepCage' = 'none';
  if (estimatedEndgame >= 12) {
    endgameStatus = 'deepCage';
  } else if (estimatedEndgame >= 6) {
    endgameStatus = 'shallowCage';
  } else if (estimatedEndgame >= 2) {
    endgameStatus = 'parked';
  }
  
  // Create scouting record
  return {
    id: generateId(),
    teamId,
    matchNumber: match.matchNumber || 0,
    scoutName: `TBA Import${myTeamNumber ? ` (Team ${myTeamNumber})` : ''}`,
    timestamp: Date.now(),
    
    // Auto
    autoLeavesBarge: true, // Assume they left the barge
    autoCoralL1,
    autoCoralL2,
    autoCoralL3,
    autoCoralL4,
    autoAlgaeProcessor,
    autoAlgaeNet,
    
    // Teleop
    teleopCoralL1,
    teleopCoralL2,
    teleopCoralL3,
    teleopCoralL4,
    teleopAlgaeProcessor,
    teleopAlgaeNet,
    
    // Endgame
    endgameStatus,
    
    // Performance
    defenseRating: 3, // Default to average
    minorFaults: 0,
    majorFaults: 0,
    
    // Penalties
    yellowCard: false,
    redCard: false,
    
    // Comments
    comments: `Auto-generated from TBA match data. Match ${match.matchNumber}, ${alliance} alliance. Final score: ${allianceScore}-${opponentScore} (${won ? 'Win' : winner === 'tie' ? 'Tie' : 'Loss'})`,
    
    // Legacy support
    autoCoralScored: autoCoralL1 + autoCoralL2 + autoCoralL3 + autoCoralL4,
    autoAlgaeScored: autoAlgaeProcessor + autoAlgaeNet,
    teleopCoralScored: teleopCoralL1 + teleopCoralL2 + teleopCoralL3 + teleopCoralL4,
    teleopAlgaeScored: teleopAlgaeProcessor + teleopAlgaeNet,
    bargeLevel: endgameStatus === 'none' ? 0 : endgameStatus === 'parked' ? 1 : endgameStatus === 'shallowCage' ? 2 : 3,
    
    // Metadata
    source: 'tba',
    alliance,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}