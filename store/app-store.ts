import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Team, Match, UpcomingMatch, Note, EventData, AppSettings, ExportData } from '@/types';
import { calculateTeamRating } from '@/utils/alliance-helper';

interface AppState {
  // Team data
  myTeamNumber: number;
  teams: Team[];
  
  // Match data
  matches: Match[];
  upcomingMatches: UpcomingMatch[];
  
  // Event data
  events: EventData[];
  
  // Notes
  notes: Note[];
  
  // Settings
  tbaApiKey: string | null;
  darkMode: boolean;
  notificationsEnabled: boolean;
  dataExportFormat: 'json' | 'csv';
  autoBackup: boolean;
  onboardingCompleted: boolean;
  
  // Actions - Teams
  setMyTeamNumber: (teamNumber: number) => void;
  addTeam: (team: Team) => void;
  updateTeam: (team: Team) => void;
  removeTeam: (teamId: number | string) => void;
  importTeams: (teams: Team[]) => void;
  updateTeamRatings: () => void;
  
  // Actions - Matches
  addMatch: (match: Match) => void;
  updateMatch: (match: Match) => void;
  removeMatch: (matchId: number | string) => void;
  addUpcomingMatch: (match: UpcomingMatch) => void;
  removeUpcomingMatch: (matchId: number | string) => void;
  importMatches: (matches: Match[]) => void;
  importUpcomingMatches: (matches: UpcomingMatch[]) => void;
  
  // Actions - Events
  addEvent: (event: EventData) => void;
  removeEvent: (eventKey: string) => void;
  importEvents: (events: EventData[]) => void;
  
  // Actions - Notes
  addNote: (note: Note) => void;
  updateNote: (note: Note) => void;
  removeNote: (noteId: string) => void;
  
  // Actions - Settings
  setTbaApiKey: (apiKey: string) => void;
  setDarkMode: (enabled: boolean) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setDataExportFormat: (format: 'json' | 'csv') => void;
  setAutoBackup: (enabled: boolean) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  
  // Actions - TBA Data
  setEventsMatchesTeams: (events: EventData[], matches: Match[], teams: Team[]) => void;
  
  // Actions - Import/Export
  exportData: () => ExportData;
  importData: (data: ExportData) => void;
  
  // Reset
  resetStore: () => void;
  clearAllData: () => void;
}

const initialState = {
  myTeamNumber: 0,
  teams: [],
  matches: [],
  upcomingMatches: [],
  events: [],
  notes: [],
  tbaApiKey: null,
  darkMode: true,
  notificationsEnabled: true,
  dataExportFormat: 'json' as const,
  autoBackup: false,
  onboardingCompleted: false,
};

const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Team actions
      setMyTeamNumber: (teamNumber) => set({ myTeamNumber: teamNumber }),
      
      addTeam: (team) => set((state) => {
        // Ensure team has all required properties
        const safeTeam: Team = {
          id: team.id || Math.floor(Math.random() * 10000),
          number: team.number || team.team_number || 0,
          name: team.name || team.nickname || `Team ${team.number || team.team_number || 0}`,
          ...team
        };
        
        // Check if team already exists
        const existingTeam = state.teams.find(t => 
          t.id === safeTeam.id || 
          t.number === safeTeam.number || 
          (t.key && t.key === safeTeam.key)
        );
        
        if (existingTeam) {
          // Update existing team
          return {
            teams: state.teams.map(t => 
              (t.id === existingTeam.id || t.number === existingTeam.number || (t.key && t.key === safeTeam.key)) 
                ? { ...t, ...safeTeam } 
                : t
            )
          };
        }
        
        // Add new team
        return {
          teams: [...state.teams, safeTeam]
        };
      }),
      
      updateTeam: (team) => set((state) => ({
        teams: state.teams.map((t) => t.id === team.id ? {
          ...t,
          ...team,
          number: team.number || team.team_number || t.number || 0,
          name: team.name || team.nickname || t.name || `Team ${team.number || team.team_number || t.number || 0}`
        } : t)
      })),
      
      removeTeam: (teamId) => set((state) => ({
        teams: state.teams.filter((t) => t.id !== teamId)
      })),
      
      importTeams: (teams) => set((state) => {
        // Ensure all teams have required properties
        const safeTeams = teams.map(team => ({
          id: team.id || team.team_number || Math.floor(Math.random() * 10000),
          number: team.number || team.team_number || 0,
          name: team.name || team.nickname || `Team ${team.number || team.team_number || 0}`,
          ...team
        }));
        
        // Create a map of existing teams by number for quick lookup
        const existingTeamsMap = new Map();
        state.teams.forEach(team => {
          if (team && team.number) {
            existingTeamsMap.set(team.number, team);
          }
        });
        
        // Merge with existing teams, avoiding duplicates
        const mergedTeams = [...state.teams];
        
        safeTeams.forEach(team => {
          if (!team.number) return;
          
          const existingTeam = existingTeamsMap.get(team.number);
          if (existingTeam) {
            // Update existing team
            const index = mergedTeams.findIndex(t => t.id === existingTeam.id);
            if (index !== -1) {
              mergedTeams[index] = { ...existingTeam, ...team };
            }
          } else {
            // Add new team
            mergedTeams.push(team);
            existingTeamsMap.set(team.number, team);
          }
        });
        
        return { teams: mergedTeams };
      }),
      
      updateTeamRatings: () => {
        const { teams } = get();
        
        if (!teams || !Array.isArray(teams) || teams.length === 0) {
          return;
        }
        
        // Import the scouting store dynamically to avoid circular dependencies
        const scoutingStore = require('@/store/scouting-store').default;
        const { records } = scoutingStore.getState();
        
        set((state) => {
          const updatedTeams = state.teams.map(team => {
            if (!team || !team.number) return team;
            
            // Calculate rating
            const rating = calculateTeamRating(team.number, records);
            
            // Update team with rating
            return {
              ...team,
              rating
            };
          });
          
          return { teams: updatedTeams };
        });
      },
      
      // Match actions
      addMatch: (match) => set((state) => {
        // Ensure match has alliance arrays
        const safeMatch = {
          ...match,
          redAlliance: match.redAlliance || [],
          blueAlliance: match.blueAlliance || []
        };
        
        // Check if match already exists
        const existingMatch = state.matches.find(m => 
          m.id === safeMatch.id || 
          (m.matchNumber === safeMatch.matchNumber && m.eventKey === safeMatch.eventKey)
        );
        
        if (existingMatch) {
          // Update existing match
          return {
            matches: state.matches.map(m => 
              (m.id === existingMatch.id || (m.matchNumber === safeMatch.matchNumber && m.eventKey === safeMatch.eventKey)) 
                ? { ...m, ...safeMatch } 
                : m
            )
          };
        }
        
        // Add new match
        return {
          matches: [...state.matches, safeMatch]
        };
      }),
      
      updateMatch: (match) => set((state) => ({
        matches: state.matches.map((m) => m.id === match.id ? {
          ...match,
          redAlliance: match.redAlliance || [],
          blueAlliance: match.blueAlliance || []
        } : m)
      })),
      
      removeMatch: (matchId) => set((state) => ({
        matches: state.matches.filter((m) => m.id !== matchId)
      })),
      
      addUpcomingMatch: (match) => set((state) => {
        // Ensure match has alliance arrays
        const safeMatch = {
          ...match,
          redAlliance: match.redAlliance || [],
          blueAlliance: match.blueAlliance || []
        };
        return {
          upcomingMatches: [...state.upcomingMatches, safeMatch]
        };
      }),
      
      removeUpcomingMatch: (matchId) => set((state) => ({
        upcomingMatches: state.upcomingMatches.filter((m) => m.id !== matchId)
      })),
      
      importMatches: (matches) => set((state) => {
        // Ensure all matches have alliance arrays
        const safeMatches = matches.map(match => ({
          ...match,
          redAlliance: match.redAlliance || [],
          blueAlliance: match.blueAlliance || []
        }));
        
        // Create a map of existing matches by ID for quick lookup
        const existingMatchesMap = new Map();
        state.matches.forEach(match => {
          if (match && match.id) {
            existingMatchesMap.set(match.id, match);
          }
        });
        
        // Merge with existing matches, avoiding duplicates
        const mergedMatches = [...state.matches];
        
        safeMatches.forEach(match => {
          if (!match.id) return;
          
          const existingMatch = existingMatchesMap.get(match.id);
          if (existingMatch) {
            // Update existing match
            const index = mergedMatches.findIndex(m => m.id === existingMatch.id);
            if (index !== -1) {
              mergedMatches[index] = { ...existingMatch, ...match };
            }
          } else {
            // Add new match
            mergedMatches.push(match);
            existingMatchesMap.set(match.id, match);
          }
        });
        
        return { matches: mergedMatches };
      }),
      
      importUpcomingMatches: (matches) => set((state) => {
        // Ensure all matches have alliance arrays
        const safeMatches = matches.map(match => ({
          ...match,
          redAlliance: match.redAlliance || [],
          blueAlliance: match.blueAlliance || []
        }));
        
        // Merge with existing upcoming matches, avoiding duplicates
        const existingIds = new Set(state.upcomingMatches.map(m => m.id));
        const newMatches = safeMatches.filter(m => !existingIds.has(m.id));
        
        return {
          upcomingMatches: [...state.upcomingMatches, ...newMatches]
        };
      }),
      
      // Event actions
      addEvent: (event) => set((state) => ({
        events: [...state.events, event]
      })),
      
      removeEvent: (eventKey) => set((state) => ({
        events: state.events.filter((e) => e.key !== eventKey)
      })),
      
      importEvents: (events) => set((state) => {
        // Create a map of existing events by key for quick lookup
        const existingEventsMap = new Map();
        state.events.forEach(event => {
          if (event && event.key) {
            existingEventsMap.set(event.key, event);
          }
        });
        
        // Merge with existing events, avoiding duplicates
        const mergedEvents = [...state.events];
        
        events.forEach(event => {
          if (!event.key) return;
          
          const existingEvent = existingEventsMap.get(event.key);
          if (existingEvent) {
            // Update existing event
            const index = mergedEvents.findIndex(e => e.key === existingEvent.key);
            if (index !== -1) {
              mergedEvents[index] = { ...existingEvent, ...event };
            }
          } else {
            // Add new event
            mergedEvents.push(event);
            existingEventsMap.set(event.key, event);
          }
        });
        
        return { events: mergedEvents };
      }),
      
      // Note actions
      addNote: (note) => set((state) => ({
        notes: [...state.notes, note]
      })),
      
      updateNote: (note) => set((state) => ({
        notes: state.notes.map((n) => n.id === note.id ? note : n)
      })),
      
      removeNote: (noteId) => set((state) => ({
        notes: state.notes.filter((n) => n.id !== noteId)
      })),
      
      // Settings actions
      setTbaApiKey: (apiKey) => set({ tbaApiKey: apiKey }),
      setDarkMode: (enabled) => set({ darkMode: enabled }),
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
      setDataExportFormat: (format) => set({ dataExportFormat: format }),
      setAutoBackup: (enabled) => set({ autoBackup: enabled }),
      
      updateSettings: (settings) => set((state) => ({
        myTeamNumber: settings.myTeamNumber !== undefined ? settings.myTeamNumber : state.myTeamNumber,
        tbaApiKey: settings.tbaApiKey !== undefined ? settings.tbaApiKey : state.tbaApiKey,
        darkMode: settings.darkMode !== undefined ? settings.darkMode : state.darkMode,
        notificationsEnabled: settings.notificationsEnabled !== undefined ? settings.notificationsEnabled : state.notificationsEnabled,
        dataExportFormat: settings.dataExportFormat !== undefined ? settings.dataExportFormat : state.dataExportFormat,
        autoBackup: settings.autoBackup !== undefined ? settings.autoBackup : state.autoBackup,
        onboardingCompleted: settings.onboardingCompleted !== undefined ? settings.onboardingCompleted : state.onboardingCompleted,
      })),
      
      // TBA Data actions
      setEventsMatchesTeams: (events, matches, teams) => {
        
        set((state) => {
          // Process teams
          const processedTeams = teams.map(team => ({
            id: team.id || team.team_number || Math.floor(Math.random() * 10000),
            number: team.number || team.team_number || 0,
            name: team.name || team.nickname || `Team ${team.number || team.team_number || 0}`,
            ...team
          }));
          
          // Process matches
          const processedMatches = matches.map(match => ({
            ...match,
            redAlliance: match.redAlliance || [],
            blueAlliance: match.blueAlliance || []
          }));
          
          // Create maps for existing data
          const existingTeamsMap = new Map();
          state.teams.forEach(team => {
            if (team && (team.id || team.number)) {
              existingTeamsMap.set(team.number || team.id, team);
            }
          });
          
          const existingMatchesMap = new Map();
          state.matches.forEach(match => {
            if (match && match.id) {
              existingMatchesMap.set(match.id, match);
            }
          });
          
          const existingEventsMap = new Map();
          state.events.forEach(event => {
            if (event && event.key) {
              existingEventsMap.set(event.key, event);
            }
          });
          
          // Merge teams
          const mergedTeams = [...state.teams];
          processedTeams.forEach(team => {
            if (!team.number) return;
            
            const existingTeam = existingTeamsMap.get(team.number);
            if (existingTeam) {
              // Update existing team
              const index = mergedTeams.findIndex(t => t.number === existingTeam.number);
              if (index !== -1) {
                mergedTeams[index] = { ...existingTeam, ...team };
              }
            } else {
              // Add new team
              mergedTeams.push(team);
            }
          });
          
          // Merge matches
          const mergedMatches = [...state.matches];
          processedMatches.forEach(match => {
            if (!match.id) return;
            
            const existingMatch = existingMatchesMap.get(match.id);
            if (existingMatch) {
              // Update existing match
              const index = mergedMatches.findIndex(m => m.id === existingMatch.id);
              if (index !== -1) {
                mergedMatches[index] = { ...existingMatch, ...match };
              }
            } else {
              // Add new match
              mergedMatches.push(match);
            }
          });
          
          // Merge events
          const mergedEvents = [...state.events];
          events.forEach(event => {
            if (!event.key) return;
            
            const existingEvent = existingEventsMap.get(event.key);
            if (existingEvent) {
              // Update existing event
              const index = mergedEvents.findIndex(e => e.key === existingEvent.key);
              if (index !== -1) {
                mergedEvents[index] = { ...existingEvent, ...event };
              }
            } else {
              // Add new event
              mergedEvents.push(event);
            }
          });
          
          return { 
            events: mergedEvents, 
            matches: mergedMatches, 
            teams: mergedTeams
          };
        });
        
        // Update team ratings after importing data
        setTimeout(() => {
          get().updateTeamRatings();
        }, 500);
      },
      
      // Import/Export actions
      exportData: () => {
        const state = get();
        return {
          teams: state.teams,
          matches: state.matches,
          upcomingMatches: state.upcomingMatches,
          notes: state.notes,
          events: state.events,
          settings: {
            myTeamNumber: state.myTeamNumber,
            tbaApiKey: state.tbaApiKey,
            darkMode: state.darkMode,
            notificationsEnabled: state.notificationsEnabled,
            dataExportFormat: state.dataExportFormat,
            autoBackup: state.autoBackup
          },
          timestamp: Date.now(),
          version: "1.0.0"
        };
      },
      
      importData: (data) => set((state) => {
        // Import data with validation
        const teams = Array.isArray(data.teams) ? data.teams : [];
        const matches = Array.isArray(data.matches) ? data.matches : [];
        const upcomingMatches = Array.isArray(data.upcomingMatches) ? data.upcomingMatches : [];
        const notes = Array.isArray(data.notes) ? data.notes : [];
        const events = Array.isArray(data.events) ? data.events : [];
        
        // Ensure all matches have alliance arrays
        const safeMatches = matches.map(match => ({
          ...match,
          redAlliance: match.redAlliance || [],
          blueAlliance: match.blueAlliance || []
        }));
        
        const safeUpcomingMatches = upcomingMatches.map(match => ({
          ...match,
          redAlliance: match.redAlliance || [],
          blueAlliance: match.blueAlliance || []
        }));
        
        // Import settings if available
        const settings = data.settings || {};
        
        return {
          // Only replace data if it exists in the import
          teams: teams.length > 0 ? teams : state.teams,
          matches: matches.length > 0 ? safeMatches : state.matches,
          upcomingMatches: upcomingMatches.length > 0 ? safeUpcomingMatches : state.upcomingMatches,
          notes: notes.length > 0 ? notes : state.notes,
          events: events.length > 0 ? events : state.events,
          
          // Update settings if provided
          myTeamNumber: settings.myTeamNumber !== undefined ? settings.myTeamNumber : state.myTeamNumber,
          tbaApiKey: settings.tbaApiKey !== undefined ? settings.tbaApiKey : state.tbaApiKey,
          darkMode: settings.darkMode !== undefined ? settings.darkMode : state.darkMode,
          notificationsEnabled: settings.notificationsEnabled !== undefined ? settings.notificationsEnabled : state.notificationsEnabled,
          dataExportFormat: settings.dataExportFormat !== undefined ? settings.dataExportFormat : state.dataExportFormat,
          autoBackup: settings.autoBackup !== undefined ? settings.autoBackup : state.autoBackup,
        };
      }),
      
      // Reset store
      resetStore: () => {
        set(initialState);
      },
      
      // Clear all data
      clearAllData: () => {
        
        // Reset this store to initial state
        set(initialState);
        
        // Clear scouting store data directly
        try {
          const scoutingStore = require('@/store/scouting-store').default;
          if (scoutingStore && typeof scoutingStore.getState === 'function') {
            const scoutingState = scoutingStore.getState();
            if (scoutingState && typeof scoutingState.clearRecords === 'function') {
              scoutingState.clearRecords();
            }
          }
        } catch (error) {
          console.error("Error clearing scouting store:", error);
        }
        
        // Clear theme store data
        try {
          const themeStore = require('@/store/theme-store').default;
          if (themeStore && typeof themeStore.getState === 'function') {
            const themeState = themeStore.getState();
            if (themeState && typeof themeState.setDarkMode === 'function') {
              themeState.setDarkMode(true);
            }
          }
        } catch (error) {
          console.error("Error resetting theme store:", error);
        }
      },
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 2, // Increment version to force reset on schema changes
    }
  )
);

export default useAppStore;