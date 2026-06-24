import type { BuildingPolygonData } from './heatmap';

export interface VirtualEvent {
  id: string;
  name: string;
  buildingId: string;
  buildingName: string;
  estimatedParticipants: number;
  startTime: string;
  endTime: string;
}

export interface EventModification {
  originalEventName: string;
  action: 'modify' | 'remove';
  newBuildingId?: string;
  newStartTime?: string;
  newEndTime?: string;
  newParticipants?: number;
}

export interface ClosedFacility {
  id: string;
  name: string;
  type: 'building' | 'parking' | 'gate';
}

export interface SimulationScenario {
  virtualEvents: VirtualEvent[];
  eventModifications: EventModification[];
  closedFacilities: ClosedFacility[];
  customBuildings: BuildingPolygonData[];
  userCountMultiplier: number;
  targetTime: string;
}

export const DEFAULT_SCENARIO: SimulationScenario = {
  virtualEvents: [],
  eventModifications: [],
  closedFacilities: [],
  customBuildings: [],
  userCountMultiplier: 1.0,
  targetTime: '',
};
