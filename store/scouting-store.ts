import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScoutingRecord } from '@/types/scouting';
import { generateId } from '@/utils/helpers';

interface ScoutingState {
  records: ScoutingRecord[];
  
  // Actions
  addRecord: (record: ScoutingRecord) => void;
  updateRecord: (record: ScoutingRecord) => void;
  removeRecord: (recordId: string) => void;
  importRecords: (records: ScoutingRecord[]) => void;
  clearRecords: () => void;
  
  // Queries
  getManualRecords: () => ScoutingRecord[];
  getTbaRecords: (teamId: number | string) => ScoutingRecord[];
  getRecordsByTeam: (teamId: number | string) => ScoutingRecord[];
}

const initialState = {
  records: [],
};

const useScoutingStore = create<ScoutingState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      addRecord: (record) => set((state) => ({
        records: [...state.records, {
          ...record,
          id: record.id || generateId(),
          createdAt: record.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          source: record.source || 'manual'
        }]
      })),
      
      updateRecord: (record) => set((state) => ({
        records: state.records.map((r) => 
          r.id === record.id 
            ? { ...record, updatedAt: new Date().toISOString() } 
            : r
        )
      })),
      
      removeRecord: (recordId) => set((state) => ({
        records: state.records.filter((r) => r.id !== recordId)
      })),
      
      importRecords: (records) => set((state) => {
        
        // Process new records
        const processedRecords = records.map(record => ({
          ...record,
          id: record.id || generateId(),
          createdAt: record.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          source: record.source || 'manual'
        }));
        
        // Create a map of existing records by ID for quick lookup
        const existingRecordsMap = new Map(
          state.records.map(record => [record.id, record])
        );
        
        // Create a set to track unique match-team combinations
        const existingMatchTeamCombos = new Set(
          state.records.map(record => `${record.matchNumber}-${record.teamId}-${record.alliance || ''}`)
        );
        
        // Merge new records with existing ones, avoiding duplicates
        const mergedRecords = [...state.records];
        
        processedRecords.forEach(record => {
          // Skip if record ID already exists
          if (existingRecordsMap.has(record.id)) {
            return;
          }
          
          // Skip if this match-team combination already exists
          const matchTeamCombo = `${record.matchNumber}-${record.teamId}-${record.alliance || ''}`;
          if (existingMatchTeamCombos.has(matchTeamCombo)) {
            return;
          }
          
          // Add the new record
          mergedRecords.push(record);
          existingMatchTeamCombos.add(matchTeamCombo);
        });
        
        return { records: mergedRecords };
      }),

      clearRecords: () => {
        set({ records: [] });
      },
      
      // Queries
      getManualRecords: () => {
        const state = get();
        return state.records.filter(record => 
          record.source === 'manual' || !record.source
        );
      },
      
      getTbaRecords: (teamId: number | string) => {
        const state = get();
        const id = Number(teamId);
        return state.records.filter(record => Number(record.teamId) === id);
      },

      
      getRecordsByTeam: (teamId: number | string) => {
        const state = get();
        const id = Number(teamId);
        return state.records.filter(record => Number(record.teamId) === id);
      },

    }),
    {
      name: 'scouting-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 3, // Increment version to force reset on schema changes
      partialize: (state) => ({ records: state.records }),
    }
  )
);

export default useScoutingStore;
