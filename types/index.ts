export interface Team {
  id: number;
  key?: string;
  number?: number;
  team_number?: number;
  name?: string;
  nickname?: string;
  city?: string;
  state?: string;
  country?: string;
  rookie_year?: number;
  website?: string;
  motto?: string;
  avatar?: string;
  notes?: string;
  tags?: string[];
  stats?: TeamStats;
  location?: string; // ADDED for UI display
}

export interface TeamStats {
  avgScore?: number;
  avgAutoScore?: number;
  avgTeleopScore?: number;
  avgEndgameScore?: number;
  winRate?: number;
  matchesPlayed?: number;
  matchesWon?: number;
  matchesLost?: number;
  matchesTied?: number;
}

export interface Match {
  id: string | number;
  matchNumber: number;
  matchType?: 'qualification' | 'practice' | 'playoff' | 'quarterfinal' | 'semifinal' | 'final';
  redAlliance: number[];
  blueAlliance: number[];
  redScore?: number;
  blueScore?: number;
  winner?: 'red' | 'blue' | 'tie' | null;
  scheduledTime?: number;
  actualTime?: number;
  notes?: string;
  completed?: boolean;
  timestamp?: number;
  eventKey?: string;
  time?: number; // ADDED if used as general fallback
  key?: string; // ADDED for TBA match key
}

export interface UpcomingMatch {
  id: string | number;
  matchNumber: number;
  matchType?: 'qualification' | 'practice' | 'playoff' | 'quarterfinal' | 'semifinal' | 'final';
  redAlliance: number[];
  blueAlliance: number[];
  scheduledTime: number;
  notes?: string;
  eventKey?: string;
  time?: number; // ADDED for compatibility
  predictedTime?: number; // ADDED for sorting fallback
  matchNumberAlt?: number; // if used as match.match_number
  compLevel?: string; // if used as match.comp_level
}

export interface Note {
  id: string;
  teamId: number;
  title: string;
  content: string;
  tags: string[];
  timestamp: number;
  author?: string;
  matchId?: string | number;
  matchNumber?: number; // ADDED
  createdAt?: number; // ADDED
  teamName?: string; // ADDED
  teamNumber?: number; // ADDED
}

export interface EventData {
  key: string;
  name: string;
  shortName?: string;
  eventCode?: string;
  eventType?: number;
  district?: string;
  city?: string;
  stateProv?: string;
  country?: string;
  startDate?: string;
  endDate?: string;
  year?: number;
  website?: string;
  timezone?: string;
  location?: {
    lat?: number;
    lng?: number;
    address?: string;
    locationName?: string;
  };
  teams?: number[]; // ADDED
}

export interface AppSettings {
  myTeamNumber?: number;
  tbaApiKey?: string | null;
  darkMode?: boolean;
  notificationsEnabled?: boolean;
  dataExportFormat?: 'json' | 'csv';
  autoBackup?: boolean;
  onboardingCompleted?: boolean;
}

export interface ExportData {
  teams: Team[];
  matches: Match[];
  upcomingMatches: UpcomingMatch[];
  notes: Note[];
  events: EventData[];
  settings: AppSettings;
  timestamp: number;
  version: string;
}
