export interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch?: number;
  bearing?: number;
  minZoom?: number;
  maxZoom?: number;
  [key: string]: unknown;
}

export interface CellData {
  cellX: number;
  cellY: number;
  count: number;
  centerLat: number;
  centerLng: number;
  intents?: Record<string, number>;
  activities?: Record<string, number>;
}

export interface HeatmapResponse {
  timestamp: number;
  totalOnline: number;
  cells: CellData[];
  players?: PlayerData[];
  globalReasons?: string[];
  poiReasons?: Record<string, string[]>;
  simulationApplied?: boolean;
  simulationReasons?: string[];
}

export type ConnectionStatus = 'live' | 'connecting' | 'disconnected' | 'forecast' | 'simulation';

export interface PoiData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  labelMinZoom?: number;
}

export interface WayData {
  id: string;
  name: string;
  wayType: string;
  coordinates: [number, number][]; // [lng, lat][]
  distanceMeters: number;
  isOneway: boolean;
}

export interface BuildingPolygonData {
  id: string;
  name: string;
  coordinates: number[][];
  fillColor: [number, number, number, number];
  category: string;
  imageUrl?: string;
}

export interface PlayerData {
  userId: string;
  username: string;
  latitude: number;
  longitude: number;
  activityState: string;
}

export interface BackendConfig {
  httpBase: string;
  wsBase: string;
}

export interface QuickPickItem {
  label: string;
  value: string;
}
