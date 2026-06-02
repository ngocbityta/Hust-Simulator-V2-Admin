import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import DeckGL from '@deck.gl/react';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import { ScatterplotLayer, PolygonLayer, TextLayer, PathLayer } from '@deck.gl/layers';
import ReactMap from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import { useHeatmapData } from '../hooks/useHeatmapData';
import { getQuickPicks } from '../utils/heatmapHelpers';
import { apiFetch } from '../utils/api';
import type { ViewState, CellData, PoiData, BuildingPolygonData, WayData } from '../types/heatmap';
import {
  CAMPUS_POLYGON,
  INITIAL_VIEW_STATE,
  MAP_STYLE,
  COLOR_RANGE,
} from '../constants/heatmap';
import ControlPanel from './ControlPanel';
import ZoneDetailPanel from './ZoneDetailPanel';
import BuildingDetailPanel from './BuildingDetailPanel';

export default function HeatmapViewer() {
  const {
    data,
    lastUpdated,
    targetDateStr,
    setTargetDateStr,
    selectedCell,
    setSelectedCell,
    connStatus,
    loading,
    errorMsg,
    buildingDensity,
    isLive,
    globalReasons,
    poiReasons,
  } = useHeatmapData();

  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [viewState, setViewState] = useState<ViewState>(INITIAL_VIEW_STATE);
  const [pois, setPois] = useState<PoiData[]>([]);
  const [ways, setWays] = useState<WayData[]>([]);
  const [buildingPolygons, setBuildingPolygons] = useState<BuildingPolygonData[]>([]);
  const [campusPolygon, setCampusPolygon] = useState<[number, number][]>(CAMPUS_POLYGON);
  const [selectedPoi, setSelectedPoi] = useState<PoiData | null>(null);
  const [cursor, setCursor] = useState<string>('crosshair');
  const [hoveredBuildingName, setHoveredBuildingName] = useState<string>('');
  const [rawMapStyle, setRawMapStyle] = useState<Record<string, unknown> | null>(null);

  const poisRef = useRef<PoiData[]>([]);

  useEffect(() => {
    poisRef.current = pois;
  }, [pois]);

  /* ── Fetch Map Style JSON once ──────────── */
  useEffect(() => {
    fetch(MAP_STYLE)
      .then((r) => r.json())
      .then((data) => {
        setRawMapStyle(data);
      })
      .catch((err) => console.error('Failed to load raw map style:', err));
  }, []);

  /* ── Load Building data from DB ───────────── */
  useEffect(() => {
    apiFetch('/buildings/active')
      .then((buildings: Array<{
        id: string; name: string; coordinates: string;
        centroidLat: number | null; centroidLng: number | null;
        fillColor: string | null; labelMinZoom: number | null;
        isLabelVisible: boolean | null; category: string | null;
      }>) => {
        // Build POI labels from centroids (only visible labels)
        const poiList: PoiData[] = buildings
          .filter((b) => b.centroidLat != null && b.centroidLng != null)
          .filter((b) => b.isLabelVisible !== false)
          .map((b) => ({
            id: b.id, name: b.name,
            lat: b.centroidLat!, lng: b.centroidLng!,
            labelMinZoom: b.labelMinZoom ?? 15.0,
          }));
        setPois((prev) => {
          const newIds = new Set(poiList.map(p => p.id));
          const existingToKeep = prev.filter(p => !newIds.has(p.id));
          return [...existingToKeep, ...poiList];
        });

        // Build polygon data with display properties from DB
        const polygons: BuildingPolygonData[] = buildings
          .map((b) => {
            try {
              const coords = JSON.parse(b.coordinates);
              const colorParts = (b.fillColor || '179,167,154,230').split(',').map(Number);
              const fillColor: [number, number, number, number] = [
                colorParts[0] ?? 179, colorParts[1] ?? 167,
                colorParts[2] ?? 154, colorParts[3] ?? 230,
              ];
              return {
                id: b.id, name: b.name, coordinates: coords,
                fillColor, category: b.category || 'OTHER',
              };
            } catch {
              return null;
            }
          })
          .filter((p): p is BuildingPolygonData => p !== null);
        setBuildingPolygons(polygons);
      })
      .catch((err) => console.error('Failed to load buildings from API:', err));
  }, []);

  /* ── Load Gates from Nodes DB ───────────── */
  useEffect(() => {
    apiFetch('/campus-nodes')
      .then((nodes: Array<{ id: string; name: string; nodeType: string; latitude: number; longitude: number }>) => {
        const gatePois: PoiData[] = nodes
          .filter((n) => n.nodeType === 'GATE')
          .map((n) => ({
            id: n.id,
            name: n.name,
            lat: n.latitude,
            lng: n.longitude,
            labelMinZoom: 15.0, // Gates appear at the same zoom level as buildings
          }));
        setPois((prev) => {
          // Prevent duplicates in case of React strict mode double-firing
          const existingIds = new Set(prev.map(p => p.id));
          const newGates = gatePois.filter(g => !existingIds.has(g.id));
          return [...prev, ...newGates];
        });
      })
      .catch((err) => console.error('Failed to load nodes:', err));
  }, []);

  /* ── Load Maps (Campus Boundaries) from DB ───────────── */
  useEffect(() => {
    apiFetch('/maps/active')
      .then((maps: Array<{ coordinates: string }>) => {
        if (maps.length > 0) {
          try {
            const coords = JSON.parse(maps[0].coordinates);
            if (Array.isArray(coords)) {
              setCampusPolygon(coords);
            }
          } catch (err) {
            console.error('Failed to parse map coordinates', err);
          }
        }
      })
      .catch((err) => console.error('Failed to load maps from API:', err));
  }, []);

  /* ── Load Ways (OSM-style paths) from DB ───────────── */
  useEffect(() => {
    apiFetch('/campus-ways')
      .then((wayList: Array<{ id: string; name: string; wayType: string; coordinates: [number, number][]; distanceMeters: number; isOneway: boolean }>) => {
        const parsed: WayData[] = wayList.map((w) => ({
          id: w.id,
          name: w.name,
          wayType: w.wayType,
          coordinates: w.coordinates,
          distanceMeters: w.distanceMeters,
          isOneway: w.isOneway,
        }));
        setWays(parsed);
      })
      .catch((err) => console.error('Failed to load ways:', err));
  }, []);

  const handleViewStateChange = useCallback(({ viewState: vs }: any) => {
    if (
      !vs ||
      isNaN(vs.longitude) ||
      isNaN(vs.latitude) ||
      vs.longitude < 105.0 ||
      vs.longitude > 106.5 ||
      vs.latitude < 20.5 ||
      vs.latitude > 21.5
    ) {
      return;
    }

    const minLng = Math.min(...campusPolygon.map(p => p[0]));
    const maxLng = Math.max(...campusPolygon.map(p => p[0]));
    const minLat = Math.min(...campusPolygon.map(p => p[1]));
    const maxLat = Math.max(...campusPolygon.map(p => p[1]));

    const padLng = 0.001;
    const padLat = 0.0006;
    const clampedLng = Math.min(Math.max(vs.longitude, minLng - padLng), maxLng + padLng);
    const clampedLat = Math.min(Math.max(vs.latitude, minLat - padLat), maxLat + padLat);
    const clampedZoom = Math.min(
      Math.max(vs.zoom ?? INITIAL_VIEW_STATE.zoom, INITIAL_VIEW_STATE.minZoom!),
      INITIAL_VIEW_STATE.maxZoom!,
    );

    setViewState({
      ...vs,
      longitude: clampedLng,
      latitude: clampedLat,
      zoom: clampedZoom,
    });
  }, [campusPolygon]);

  /* ── Computes the dynamic map style declaratively ── */
  const computedMapStyle = useMemo(() => {
    if (!rawMapStyle) return MAP_STYLE;

    // Deep clone the raw map style object to modify safely
    const style = JSON.parse(JSON.stringify(rawMapStyle));

    if (style.layers) {
      style.layers = style.layers.map((layer: { id: string; paint?: Record<string, unknown>; [key: string]: unknown }) => {
        const newPaint = { ...(layer.paint || {}) };

        if (layer.id === 'water') {
          newPaint['fill-color'] = '#59c3e2';
          newPaint['fill-opacity'] = 0.95;
        } else if (layer.id === 'background') {
          newPaint['background-color'] = '#f3efea';
        } else if (layer.id === 'landuse') {
          newPaint['fill-color'] = '#f3efea';
          newPaint['fill-opacity'] = 1.0;
        } else if (layer.id === 'landcover' || layer.id === 'park_nature_reserve') {
          newPaint['fill-color'] = '#8bc39a';
          newPaint['fill-opacity'] = 0.95;
        } else if (layer.id === 'landuse_residential') {
          newPaint['fill-color'] = '#f3efea';
          newPaint['fill-opacity'] = 1.0;
        } else if ([
          'road_path', 'road_minor_fill', 'road_service_fill', 'road_sec_fill_noramp',
          'road_pri_fill_noramp', 'road_trunk_fill_noramp', 'road_mot_fill_noramp'
        ].includes(layer.id)) {
          newPaint['line-color'] = '#3a3b3c';
        } else if (layer.id === 'building' || layer.id === 'building-top') {
          newPaint['fill-opacity'] = 0.0; // Hide MapLibre buildings completely
        }

        return { ...layer, paint: newPaint };
      });
      // Remove any previously injected building-outlines
      style.layers = style.layers.filter((l: { id: string }) => l.id !== 'building-outlines');
    }

    return style;
  }, [rawMapStyle]);


  /* ── Deck.gl layers ─────────────────────── */

  const layers = useMemo(() => {
    const WORLD_POLYGON: [number, number][] = [
      [105.7, 21.1],
      [105.7, 20.9],
      [106.0, 20.9],
      [106.0, 21.1],
      [105.7, 21.1]
    ];

    return [
        new PathLayer({
          id: 'ways-layer',
          data: ways,
          pickable: false,
          widthScale: 1,
          widthMinPixels: 1.5,
          getPath: (d: WayData) => d.coordinates,
          getColor: (d: WayData) => d.isOneway ? [252, 211, 77, 160] : [226, 232, 240, 120],
          getWidth: () => 2,
        }),

        // ─── 1. Custom Colored Buildings Overlay ───
        new PolygonLayer({
          id: 'custom-building-polygons',
          data: buildingPolygons,
          pickable: true,
          stroked: true,
          filled: true,
          extruded: false,
          getPolygon: (d: BuildingPolygonData) => d.coordinates,
          getFillColor: (d: BuildingPolygonData) => d.fillColor,
          getLineColor: (d: BuildingPolygonData) => {
            if (d.category === 'PLAZA') return [0, 0, 0, 0] as [number, number, number, number];
            
            const selectedName = selectedPoi ? selectedPoi.name : '';
            if (selectedName === d.name && d.name !== '') return [56, 189, 248, 255] as [number, number, number, number];
            if (hoveredBuildingName === d.name && d.name !== '') return [234, 179, 8, 255] as [number, number, number, number];
            return [45, 55, 72, 255] as [number, number, number, number];
          },
          getLineWidth: (d: BuildingPolygonData) => {
            const n = d.name || '';
            const selectedName = selectedPoi ? selectedPoi.name : '';
            if (selectedName === n && n !== '') return 3.0;
            if (hoveredBuildingName === n && n !== '') return 3.0;
            return 1.2;
          },
          lineWidthMinPixels: 1,
          updateTriggers: {
            getLineColor: [selectedPoi, hoveredBuildingName],
            getLineWidth: [selectedPoi, hoveredBuildingName]
          },
          onHover: (info: { object?: BuildingPolygonData }) => {
            if (info.object && info.object.name) {
              const name = info.object.name;
              setHoveredBuildingName(prev => (prev !== name ? name : prev));
              setCursor(prev => (prev !== 'pointer' ? 'pointer' : prev));
            } else {
              setHoveredBuildingName(prev => (prev !== '' ? '' : prev));
              setCursor(prev => (prev !== 'crosshair' ? 'crosshair' : prev));
            }
          },
          onClick: (info: { object?: BuildingPolygonData; coordinate?: number[] }) => {
            if (info.object && info.object.name) {
              const matchingPoi = pois.find((p) => p.name === info.object!.name);
              if (matchingPoi) {
                setSelectedPoi(matchingPoi);
                setSelectedCell(null);
              } else if (info.coordinate) {
                setSelectedPoi({
                  id: 'temp-' + info.object.id,
                  name: info.object.name,
                  lat: info.coordinate[1],
                  lng: info.coordinate[0]
                });
                setSelectedCell(null);
              }
            }
          }
        }),

        // ─── 2. Heatmap Density Glow (KDE Heatmap) - PERFECTLY ON TOP OF BUILDINGS ───
        new HeatmapLayer({
          id: 'kde-heatmap',
          data,
          getPosition: (d: CellData) => [d.centerLng, d.centerLat],
          getWeight: (d: CellData) => d.count * 2,
          radiusPixels: 70, // Larger radius for smoother, wider heat spread
          intensity: 2, // Moderate intensity so color gradient stretches correctly
          threshold: 0.005, // Lower threshold to show even low-density areas
          colorRange: COLOR_RANGE,
          aggregation: 'SUM',
          opacity: 0.65, // Slightly more visible overlay
          transitions: { getWeight: 500 },
        }),

        selectedCell &&
        new ScatterplotLayer({
          id: 'selected-cell-highlight',
          data: [selectedCell],
          getPosition: (d: CellData) => [d.centerLng, d.centerLat],
          getRadius: 7,
          radiusUnits: 'meters',
          getFillColor: [56, 189, 248, 50],
          getLineColor: [56, 189, 248, 255],
          lineWidthMinPixels: 2,
          stroked: true,
          filled: true,
        }),


        // ─── 0. Campus Mask (Inverted Polygon) ───
        new PolygonLayer({
          id: 'campus-mask-layer',
          data: [{ polygon: [WORLD_POLYGON, campusPolygon] }],
          getPolygon: (d: { polygon: [number, number][][] }) => d.polygon,
          getFillColor: [0, 0, 0, 200], // Semi-transparent black overlay to dim outside areas
          getLineColor: [0, 0, 0, 200],
          lineWidthMinPixels: 2,
          pickable: false,
        }),

        new TextLayer({
          id: 'building-labels',
          data: pois,
          minZoom: 15.0, // Allow short names to appear earlier when zoomed out
          getPosition: (d: PoiData) => [d.lng, d.lat],
          getText: (d: PoiData) => d.name,
          getSize: (d: PoiData) => {
             const minZoom = d.labelMinZoom ?? 15.0;
             return viewState.zoom >= minZoom ? 12 : 0;
          },
          getColor: [0, 0, 0, 255],
          background: false,
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          fontWeight: 'bold',
          characterSet: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789áàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđĐ👥 ()-',
          fontSettings: {
            sdf: true,
          },
          pickable: true,
          onClick: (info: { object?: PoiData }) => {
            if (info.object) {
              setSelectedPoi(info.object);
              setSelectedCell(null);
            }
          },
          updateTriggers: {
            getSize: [viewState.zoom]
          }
        }),



      ].filter(Boolean);
  }, [data, selectedCell, setSelectedCell, pois, ways, setSelectedPoi, buildingPolygons, hoveredBuildingName, viewState.zoom, campusPolygon, selectedPoi]);

  /* ── Map click → find nearest cell or building ── */
  const handleClick = (info: { layer?: { id: string }; coordinate?: number[]; object?: unknown }) => {
    if (info.layer?.id === 'building-labels') return; // handled by TextLayer onClick
    if (info.layer?.id === 'custom-building-polygons') return; // handled by PolygonLayer onClick
    if (info.layer?.id === 'selected-cell-highlight') return; // let it be handled elsewhere or ignore
    if (!info.coordinate) {
      setSelectedCell(null);
      setSelectedPoi(null);
      return;
    }
    const [lng, lat] = info.coordinate;

    // Otherwise check heatmap cells
    let best: CellData | null = null;
    let bestD = Infinity;
    for (const c of data) {
      const d = (c.centerLat - lat) ** 2 + (c.centerLng - lng) ** 2;
      if (d < bestD) {
        bestD = d;
        best = c;
      }
    }
    if (bestD < 0.00005 && best) {
      setSelectedCell(best);
      setSelectedPoi(null);
    } else {
      setSelectedCell(null);
      setSelectedPoi(null);
    }
  };

  const quickPicks = useMemo(() => getQuickPicks(), []);

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: '#0a0a0f' }}>
      {/* ── Map ─────────────────────────────── */}
      <DeckGL
        viewState={viewState}
        onViewStateChange={handleViewStateChange}
        controller={{ dragRotate: false }}
        layers={layers}
        onClick={handleClick}
        getCursor={() => cursor}
      >
        <ReactMap
          maplibreLogo={false}
          mapStyle={computedMapStyle}
          mapLib={maplibregl}
          {...viewState}
        />
      </DeckGL>

      {/* ── Control Panel ───────────────────── */}
      <ControlPanel
        panelCollapsed={panelCollapsed}
        setPanelCollapsed={setPanelCollapsed}
        connStatus={connStatus}
        lastUpdated={lastUpdated}
        errorMsg={errorMsg}
        isLive={isLive}
        targetDateStr={targetDateStr}
        setTargetDateStr={setTargetDateStr}
        quickPicks={quickPicks}
      />

      {/* ── Zone Detail Panel (on click) ──── */}
      {selectedCell && (
        <ZoneDetailPanel
          selectedCell={selectedCell}
          onClose={() => setSelectedCell(null)}
        />
      )}

      {/* ── Building Detail Panel ───────────── */}
      {selectedPoi && (
        <BuildingDetailPanel
          selectedPoi={selectedPoi}
          onClose={() => setSelectedPoi(null)}
          buildingDensity={buildingDensity}
          globalReasons={globalReasons}
          poiReasons={poiReasons}
        />
      )}

      {/* ── Dynamic AI model predicting overlay ── */}
      {loading && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(10,10,14,0.7)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(167,139,250,0.3)',
            borderRadius: 24,
            padding: '32px 48px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 20,
            zIndex: 99999,
            pointerEvents: 'none',
            boxShadow: '0 0 40px rgba(139,92,246,0.2), inset 0 0 20px rgba(139,92,246,0.1)',
          }}
        >
          <div className="relative w-16 h-16 flex items-center justify-center">
            {/* Outer spinning dashed ring */}
            <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-purple-500 border-l-purple-400 opacity-80 custom-spinner" />
            {/* Inner pulsing core */}
            <div className="absolute inset-2 bg-purple-500/20 rounded-full animate-pulse shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
            <span className="relative text-2xl">🧠</span>
          </div>
          <div className="flex flex-col items-center">
            <div style={{ fontSize: 13, fontWeight: 500, color: '#a78bfa', letterSpacing: '0.02em', marginTop: 4 }} className="animate-pulse">
              Synthesizing Future Spatiotemporal Density...
            </div>
          </div>
        </div>
      )}

      {/* ── Global Styles ───────────────────── */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .custom-spinner {
          animation: spin 0.8s linear infinite;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }
        /* Force dark theme for datetime-local input */
        input[type="datetime-local"]::-webkit-calendar-picker-indicator {
          filter: invert(0.7);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
