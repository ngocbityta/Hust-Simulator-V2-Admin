export interface WeatherOverride {
  temp: number;
  rain: number;
}

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
  weatherOverride: WeatherOverride | null;
  virtualEvents: VirtualEvent[];
  eventModifications: EventModification[];
  closedFacilities: ClosedFacility[];
  userCountMultiplier: number;
  targetTime: string;
}

export const DEFAULT_SCENARIO: SimulationScenario = {
  weatherOverride: null,
  virtualEvents: [],
  eventModifications: [],
  closedFacilities: [],
  userCountMultiplier: 1.0,
  targetTime: '',
};
