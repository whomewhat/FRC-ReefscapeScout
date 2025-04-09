export interface ScoutingRecord {
  id: string;
  teamId: number;
  matchNumber: number;
  scoutName: string;
  timestamp: number;
  
  // Auto
  autoLeavesBarge: boolean;
  autoCoralL1: number;
  autoCoralL2: number;
  autoCoralL3: number;
  autoCoralL4: number;
  autoAlgaeProcessor: number;
  autoAlgaeNet: number;
  
  // Teleop
  teleopCoralL1: number;
  teleopCoralL2: number;
  teleopCoralL3: number;
  teleopCoralL4: number;
  teleopAlgaeProcessor: number;
  teleopAlgaeNet: number;
  
  // Endgame
  endgameStatus: 'none' | 'parked' | 'shallowCage' | 'deepCage';
  
  // Performance
  defenseRating: number;
  minorFaults: number;
  majorFaults: number;
  
  // Penalties
  yellowCard: boolean;
  redCard: boolean;
  
  // Comments
  comments: string;
  
  // Legacy support
  autoCoralScored: number;
  autoAlgaeScored: number;
  teleopCoralScored: number;
  teleopAlgaeScored: number;
  bargeLevel: number;
  
  // Metadata
  source?: 'manual' | 'tba';
  alliance?: 'red' | 'blue';
  createdAt?: string;
  updatedAt?: string;
}