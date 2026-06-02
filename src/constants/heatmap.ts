import type { ViewState, ConnectionStatus } from '../types/heatmap';

export const CAMPUS_POLYGON: [number, number][] = [
  [105.841245, 21.007668],
  [105.844122, 21.007732],
  [105.845182, 21.006839],
  [105.849038, 21.007340],
  [105.849744, 21.004347],
  [105.849842, 21.003300],
  [105.848517, 21.000433],
  [105.846281, 21.001933],
  [105.844902, 21.003605],
  [105.841192, 21.003622],
  [105.841245, 21.007668]
];

export const INITIAL_VIEW_STATE: ViewState = {
  longitude: 105.8456, // Centered perfectly on campus center
  latitude: 21.0048,  // Centered perfectly on campus center
  zoom: 17.5,        // Large default zoom to see buildings beautifully on startup!
  pitch: 0,          // Flat 2D perspective
  bearing: 0,        // Facing North
  minZoom: 16.8,      // Allow comfortable zoom out to see the entire HUST campus
  maxZoom: 19.8,
};

export const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

// Purple→Blue→Cyan→Green→Yellow→Orange→Red — wide contrast for clear density tiers
export const COLOR_RANGE: [number, number, number, number][] = [
  [0, 0, 0, 0],              // fully transparent (no density)
  [120, 80, 220, 140],       // soft purple  (very low density — clearly visible)
  [50, 100, 240, 170],       // blue         (low density)
  [0, 180, 230, 190],        // cyan         (low-medium)
  [20, 200, 120, 210],       // teal-green   (medium)
  [140, 220, 40, 230],       // lime-green   (medium-high)
  [255, 210, 0, 245],        // yellow       (high)
  [255, 120, 0, 255],        // orange       (high)
  [230, 20, 10, 255],        // deep red     (hotspot)
];

export const STATUS_COLOR: Record<ConnectionStatus, string> = {
  live: '#22c55e',
  connecting: '#facc15',
  disconnected: '#ef4444',
  forecast: '#a78bfa',
};

export const STATUS_LABEL: Record<ConnectionStatus, string> = {
  live: 'Live',
  connecting: 'Connecting…',
  disconnected: 'Offline',
  forecast: 'Forecast',
};
