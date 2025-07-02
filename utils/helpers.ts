import { Platform } from 'react-native';
import { Team, Match, ScoutingRecord } from '@/types';

/**
 * Formats a date as a string
 * @param date Date to format
 * @param includeTime Whether to include the time
 * @returns Formatted date string
 */
export const formatDate = (date: Date | number, includeTime = false): string => {
  if (!date) return 'N/A';
  
  const d = typeof date === 'number' ? new Date(date) : date;
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return d.toLocaleDateString('en-US', options);
};

/**
 * Formats a time as a string
 * @param date Date to format
 * @returns Formatted time string
 */
export const formatTime = (date: Date | number): string => {
  if (!date) return 'N/A';
  
  const d = typeof date === 'number' ? new Date(date) : date;
  
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Generates a random ID
 * @returns Random ID string
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

/**
 * Formats a team number with leading zeros
 * @param number Team number
 * @returns Formatted team number
 */
export const formatTeamNumber = (number: number | string | undefined): string => {
  if (number === undefined || number === null) return 'N/A';
  return number.toString().padStart(4, '0');
};

/**
 * Gets a team avatar URL
 * @param teamNumber Team number
 * @returns URL to team avatar
 */
export const getTeamAvatarUrl = (teamNumber: number | string | undefined): string => {
  if (!teamNumber) return 'https://via.placeholder.com/60';
  // Use a placeholder image service with the team number as a seed
  return `https://robohash.org/${teamNumber}?set=set3&size=60x60`;
};

/**
 * Validates a team object
 * @param team Team to validate
 * @returns Whether the team is valid
 */
export const validateTeam = (team: any): boolean => {
  if (!team) return false;
  
  // Check required fields
  if (!team.number && !team.team_number) return false;
  
  return true;
};

/**
 * Validates a match object
 * @param match Match to validate
 * @returns Whether the match is valid
 */
export const validateMatch = (match: any): boolean => {
  if (!match) return false;
  
  // Check required fields
  if (!match.matchNumber && !match.match_number) return false;
  if (!match.matchType && !match.comp_level) return false;
  
  return true;
};

/**
 * Validates a scouting record object
 * @param record Scouting record to validate
 * @returns Whether the record is valid
 */
export const validateScoutingRecord = (record: any): boolean => {
  if (!record) return false;
  
  // Check required fields
  if (!record.teamId) return false;
  if (!record.matchNumber) return false;
  
  return true;
};

/**
 * Safely parses JSON
 * @param json JSON string to parse
 * @returns Parsed object or null if invalid
 */
export const safeJsonParse = (json: string): any => {
  try {
    return JSON.parse(json);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return null;
  }
};

/**
 * Normalizes a team object from various sources
 * @param team Team object to normalize
 * @returns Normalized team object
 */
export const normalizeTeam = (team: any): Team => {
  if (!team) throw new Error('Invalid team input');
  
  return {
    id: team.id || team.key?.replace('frc', '') || Math.floor(Math.random() * 10000),
    number: team.number || team.team_number || parseInt(team.key?.replace('frc', '')) || 0,
    name: team.name || team.nickname || `Team ${team.number || team.team_number || 0}`,
    city: team.city,
    state: team.state_prov || team.state,
    country: team.country,
    rookie_year: team.rookie_year,
    website: team.website,
    motto: team.motto,
    location: team.location,
    key: team.key,
    team_number: team.team_number,
    nickname: team.nickname,
  };
};

/**
 * Normalizes a match object from various sources
 * @param match Match object to normalize
 * @returns Normalized match object
 */
export const normalizeMatch = (match: any): Match => {
  if (!match) throw new Error('Invalid match input');
  
  // Handle TBA API format
  if (match.alliances) {
    const redTeams = match.alliances.red.team_keys?.map((key: string) => parseInt(key.replace('frc', ''))) || [];
    const blueTeams = match.alliances.blue.team_keys?.map((key: string) => parseInt(key.replace('frc', ''))) || [];
    
    return {
  id: match.id || match.key?.replace(/.*_/, '') || Math.floor(Math.random() * 10000),
  matchNumber: match.match_number || match.matchNumber || 0,
  matchType: match.comp_level || match.matchType || 'qualification',
  redAlliance: redTeams,
  blueAlliance: blueTeams,
  redScore: match.alliances.red.score,
  blueScore: match.alliances.blue.score,
  winner: match.winning_alliance || match.winner || 
    (match.alliances.red.score > match.alliances.blue.score ? 'red' : 
     match.alliances.blue.score > match.alliances.red.score ? 'blue' : 'tie'),
  timestamp: match.actual_time || match.timestamp || Date.now(),
  completed: match.post_result_time !== null || match.completed || false,
  key: match.key,
  eventKey: match.event_key,
};

  }
  
  // Handle our app format
  return {
    id: match.id || Math.floor(Math.random() * 10000),
    matchNumber: match.matchNumber || match.match_number || 0,
    matchType: match.matchType || match.comp_level || 'qualification',
    redAlliance: match.redAlliance || [],
    blueAlliance: match.blueAlliance || [],
    redScore: match.redScore,
    blueScore: match.blueScore,
    winner: match.winner || 
      (match.redScore > match.blueScore ? 'red' : 
       match.blueScore > match.redScore ? 'blue' : 'tie'),
    timestamp: match.timestamp || Date.now(),
    completed: match.completed || false,
  };
};

/**
 * Normalizes a scouting record object from various sources
 * @param record Scouting record object to normalize
 * @returns Normalized scouting record object
 */
export const normalizeScoutingRecord = (record: any): ScoutingRecord => {
  if (!record) throw new Error('Invalid scouting record input');
  
  return {
    id: record.id || generateId(),
    teamId: record.teamId || 0,
    matchNumber: record.matchNumber || 0,
    scoutName: record.scoutName || 'Unknown',
    timestamp: record.timestamp || Date.now(),
    alliance: record.alliance || 'red',
    
    // Auto period
    autoLeavesBarge: record.autoLeavesBarge,
    autoCoralL1: record.autoCoralL1 || 0,
    autoCoralL2: record.autoCoralL2 || 0,
    autoCoralL3: record.autoCoralL3 || 0,
    autoCoralL4: record.autoCoralL4 || 0,
    autoAlgaeProcessor: record.autoAlgaeProcessor || 0,
    autoAlgaeNet: record.autoAlgaeNet || 0,
    autoCoralScored: record.autoCoralScored || 0,
    autoAlgaeScored: record.autoAlgaeScored || 0,
    
    // Teleop period
    teleopCoralL1: record.teleopCoralL1 || 0,
    teleopCoralL2: record.teleopCoralL2 || 0,
    teleopCoralL3: record.teleopCoralL3 || 0,
    teleopCoralL4: record.teleopCoralL4 || 0,
    teleopAlgaeProcessor: record.teleopAlgaeProcessor || 0,
    teleopAlgaeNet: record.teleopAlgaeNet || 0,
    teleopCoralScored: record.teleopCoralScored || 0,
    teleopAlgaeScored: record.teleopAlgaeScored || 0,
    
    // Endgame
    endgameStatus: record.endgameStatus,
    bargeLevel: record.bargeLevel,
    
    // Performance
    defenseRating: record.defenseRating || 0,
    minorFaults: record.minorFaults || 0,
    majorFaults: record.majorFaults || 0,
    
    // Penalties
    yellowCard: record.yellowCard || false,
    redCard: record.redCard || false,
    
    // Overall
    driverSkill: record.driverSkill || 0,
    robotSpeed: record.robotSpeed || 0,
    robotReliability: record.robotReliability || 0,
    comments: record.comments || '',
    notes: record.notes || '',
  };
};

/**
 * Checks if the app is running on a web platform
 * @returns Whether the app is running on web
 */
export const isWeb = (): boolean => {
  return Platform.OS === 'web';
};

/**
 * Checks if the app is running on a mobile platform
 * @returns Whether the app is running on mobile
 */
export const isMobile = (): boolean => {
  return Platform.OS === 'ios' || Platform.OS === 'android';
};

/**
 * Checks if the app is running on iOS
 * @returns Whether the app is running on iOS
 */
export const isIOS = (): boolean => {
  return Platform.OS === 'ios';
};

/**
 * Checks if the app is running on Android
 * @returns Whether the app is running on Android
 */
export const isAndroid = (): boolean => {
  return Platform.OS === 'android';
};
