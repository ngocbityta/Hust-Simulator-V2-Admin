import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import DeckGL from '@deck.gl/react';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import { ScatterplotLayer, PolygonLayer, TextLayer, PathLayer } from '@deck.gl/layers';
import ReactMap, { Marker } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import { useHeatmapData } from '../hooks/useHeatmapData';
import { useSimulation } from '../hooks/useSimulation';
import { apiFetch } from '../utils/api';
import type { ViewState, CellData, PoiData, BuildingPolygonData, WayData, PlayerData } from '../types/heatmap';
import {
  CAMPUS_POLYGON,
  INITIAL_VIEW_STATE,
  MAP_STYLE,
  COLOR_RANGE,
} from '../constants/heatmap';
import SimulationPanel from './SimulationPanel';
import ZoneDetailPanel from './ZoneDetailPanel';
import BuildingDetailPanel from './BuildingDetailPanel';

type HeatmapMode = 'observation' | 'simulation';

export default function HeatmapViewer() {
  const [mode, setMode] = useState<HeatmapMode>('observation');

  const {
    data: observationData,
    players: wsPlayers,
    selectedCell,
    setSelectedCell,
    loading: obsLoading,
    globalReasons,
    poiReasons,
    pause: pauseObservation,
    resume: resumeObservation,
  } = useHeatmapData();

  const handleModeChange = useCallback((newMode: HeatmapMode) => {
    if (newMode === 'simulation') {
      pauseObservation();
    } else {
      resumeObservation();
    }
    setMode(newMode);
  }, [pauseObservation, resumeObservation]);

  const sim = useSimulation();

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
  const [hoveredPlayer, setHoveredPlayer] = useState<PlayerData | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const poisRef = useRef<PoiData[]>([]);

  useEffect(() => {
    poisRef.current = pois;
  }, [pois]);

  /* players come from WS heatmap:update — no polling needed */
  const players = mode === 'observation' ? wsPlayers : [];

  // Current display data depends on mode
  const displayData: CellData[] = useMemo(() => {
    if (mode === 'simulation' && sim.result) {
      return sim.result.cells ?? [];
    }
    return observationData;
  }, [mode, sim.result, observationData]);

  const loading = mode === 'simulation' ? sim.loading : obsLoading;

  // Compute building density for either mode
  const buildingDensity = useMemo(() => {
    const m = new Map<string, number>();
    for (const cell of displayData) {
      if (cell.intents) {
        for (const [poiName, count] of Object.entries(cell.intents)) {
          m.set(poiName, (m.get(poiName) || 0) + count);
        }
      }
    }
    return m;
  }, [displayData]);

  // Closed building IDs set for visual styling
  const closedBuildingIds = useMemo(() => {
    if (mode !== 'simulation') return new Set<string>();
    return new Set(
      sim.scenario.closedFacilities
        .filter((f) => f.type === 'building')
        .map((f) => f.id),
    );
  }, [mode, sim.scenario.closedFacilities]);

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
            labelMinZoom: 15.0,
          }));
        setPois((prev) => {
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
          newPaint['fill-opacity'] = 0.0;
        }

        return { ...layer, paint: newPaint };
      });
      style.layers = style.layers.filter((l: { id: string }) => l.id !== 'building-outlines');
    }

    return style;
  }, [rawMapStyle]);


  /* ── Deck.gl layers ─────────────────────── */

  const layers = useMemo(() => {
    const layersArray: any[] = [
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
          data: [...buildingPolygons, ...(mode === 'simulation' ? sim.scenario.customBuildings : [])],
          pickable: true,
          stroked: true,
          filled: true,
          extruded: false,
          getPolygon: (d: BuildingPolygonData) => d.coordinates,
          getFillColor: (d: BuildingPolygonData) => {
            // Closed building in simulation mode → red tint
            if (mode === 'simulation' && closedBuildingIds.has(d.id)) {
              return [180, 40, 40, 160] as [number, number, number, number];
            }
            return d.fillColor;
          },
          getLineColor: (d: BuildingPolygonData) => {
            if (d.category === 'PLAZA') return [0, 0, 0, 0] as [number, number, number, number];

            // Closed building → red border
            if (mode === 'simulation' && closedBuildingIds.has(d.id)) {
              return [239, 68, 68, 255] as [number, number, number, number];
            }

            const selectedName = selectedPoi ? selectedPoi.name : '';
            if (selectedName === d.name && d.name !== '') return [56, 189, 248, 255] as [number, number, number, number];
            if (hoveredBuildingName === d.name && d.name !== '') return [234, 179, 8, 255] as [number, number, number, number];
            return [45, 55, 72, 255] as [number, number, number, number];
          },
          getLineWidth: (d: BuildingPolygonData) => {
            if (mode === 'simulation' && closedBuildingIds.has(d.id)) return 3.0;
            const n = d.name || '';
            const selectedName = selectedPoi ? selectedPoi.name : '';
            if (selectedName === n && n !== '') return 3.0;
            if (hoveredBuildingName === n && n !== '') return 3.0;
            return 1.2;
          },
          lineWidthMinPixels: 1,
          updateTriggers: {
            getFillColor: [selectedPoi, hoveredBuildingName, mode, closedBuildingIds],
            getLineColor: [selectedPoi, hoveredBuildingName, mode, closedBuildingIds],
            getLineWidth: [selectedPoi, hoveredBuildingName, mode, closedBuildingIds]
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

        // ─── 2. Heatmap Density Glow (KDE Heatmap) ───
        new HeatmapLayer({
          id: 'kde-heatmap',
          data: displayData,
          getPosition: (d: CellData) => [d.centerLng, d.centerLat],
          getWeight: (d: CellData) => d.count * 2,
          radiusPixels: 70,
          intensity: 2,
          threshold: 0.005,
          colorRange: COLOR_RANGE,
          aggregation: 'SUM',
          opacity: 0.65,
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

        // ─── 3. Player Dots (on top of heatmap) ───
        mode === 'observation' && players.length > 0 && new ScatterplotLayer({
          id: 'player-dots',
          data: players,
          pickable: true,
          getPosition: (d: PlayerData) => [d.longitude, d.latitude],
          getRadius: Math.max(1, 20 / Math.pow(2, viewState.zoom - 15)),
          radiusMinPixels: 2,
          radiusMaxPixels: 10,
          radiusUnits: 'meters',
          getFillColor: (d: PlayerData) => {
            if (d.activityState === 'IN_EVENT' || d.activityState === 'IN_RECURRING_EVENT') return [245, 158, 11, 255];
            if (d.activityState === 'IN_ROOM' || d.activityState === 'IN_BUILDING') return [56, 189, 248, 255];
            return [134, 239, 172, 255];
          },
          getLineColor: [255, 255, 255, 200],
          lineWidthMinPixels: 1.5,
          stroked: true,
          filled: true,
          onHover: (info: { object?: PlayerData; x?: number; y?: number }) => {
            if (info.object) {
              setHoveredPlayer(info.object);
              setTooltipPos({ x: info.x ?? 0, y: info.y ?? 0 });
              setCursor('pointer');
            } else {
              setHoveredPlayer(null);
              setTooltipPos(null);
              setCursor('crosshair');
            }
          },
          updateTriggers: {
            getRadius: [viewState.zoom],
            getFillColor: [],
          },
        }),

        // ─── Virtual Event Markers (simulation only) ───
        mode === 'simulation' && sim.scenario.virtualEvents.length > 0 &&
        new ScatterplotLayer({
          id: 'virtual-event-markers',
          data: sim.scenario.virtualEvents.map((ve) => {
            const poi = pois.find((p) => p.id === ve.buildingId);
            return poi ? { ...ve, lat: poi.lat, lng: poi.lng } : null;
          }).filter(Boolean),
          getPosition: (d: any) => [d.lng, d.lat],
          getRadius: 12,
          radiusUnits: 'meters',
          getFillColor: [245, 158, 11, 80],
          getLineColor: [245, 158, 11, 255],
          lineWidthMinPixels: 2,
          stroked: true,
          filled: true,
        }),
        


        new TextLayer({
          id: 'building-labels',
          data: pois,
          minZoom: 15.0,
          getPosition: (d: PoiData) => [d.lng, d.lat],
          getText: (d: PoiData) => {
            // Show lock icon for closed buildings in simulation mode
            if (mode === 'simulation' && closedBuildingIds.has(d.id)) {
              return `🔒 ${d.name}`;
            }
            return d.name;
          },
          getSize: (d: PoiData) => {
             const minZoom = d.labelMinZoom ?? 15.0;
             return viewState.zoom >= minZoom ? 12 : 0;
          },
          getColor: (d: PoiData) => {
            if (mode === 'simulation' && closedBuildingIds.has(d.id)) {
              return [239, 68, 68, 255];
            }
            return [0, 0, 0, 255];
          },
          background: false,
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          fontWeight: 'bold',
          characterSet: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789áàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđĐ👥🔒 ()-',
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
            getSize: [viewState.zoom],
            getText: [mode, closedBuildingIds],
            getColor: [mode, closedBuildingIds],
          }
        })
    ];

      return layersArray;
  }, [displayData, selectedCell, setSelectedCell, pois, ways, setSelectedPoi, buildingPolygons, hoveredBuildingName, viewState.zoom, campusPolygon, selectedPoi, mode, closedBuildingIds, sim.scenario.virtualEvents, players]);

  /* ── Map click → find nearest cell or building ── */
  const handleClick = (info: { layer?: { id: string }; coordinate?: number[]; object?: unknown }) => {
    if (info.layer?.id === 'building-labels') return;
    if (info.layer?.id === 'custom-building-polygons') return;
    if (info.layer?.id === 'selected-cell-highlight') return;
    if (info.layer?.id === 'virtual-event-markers') return;
    if (info.layer?.id === 'empty-space-highlight') return;
    if (!info.coordinate) {
      setSelectedCell(null);
      setSelectedPoi(null);
      return;
    }
    const [lng, lat] = info.coordinate;

    let best: CellData | null = null;
    let bestD = Infinity;
    for (const c of displayData) {
      const d = (c.centerLat - lat) ** 2 + (c.centerLng - lng) ** 2;
      if (d < bestD) {
        bestD = d;
        best = c;
      }
    }
    const distanceDeg = Math.sqrt(bestD);
    if (distanceDeg < 0.00015 && best) {
      setSelectedCell(best);
      setSelectedPoi(null);
    } else {
      setSelectedCell(null);
      setSelectedPoi({
        id: 'empty-space-click',
        name: 'Bãi đất trống',
        lat: lat,
        lng: lng,
        labelMinZoom: 0,
      });
    }
  };

  // Display reasons depending on mode
  const displayGlobalReasons = mode === 'simulation' && sim.result
    ? sim.result.globalReasons
    : globalReasons;
  const displayPoiReasons = mode === 'simulation' && sim.result
    ? sim.result.poiReasons
    : poiReasons;

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: '#f3efea' }}>
      
      {/* ── Top Center Overlays ─────────── */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-20 pointer-events-auto transition-transform duration-300">
        {/* Mode Toggle */}
          <div className="flex bg-zinc-950/80 backdrop-blur-2xl rounded-full p-1 shadow-2xl border border-white/10 transition-all">
            <button
              onClick={() => handleModeChange('observation')}
              className={`px-6 py-2.5 text-[13px] font-bold border-none cursor-pointer rounded-full transition-all duration-300 flex items-center gap-2 ${
                mode === 'observation'
                  ? 'bg-zinc-100 text-zinc-900 shadow-lg'
                  : 'bg-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              🔭 Quan sát
            </button>
            <button
              onClick={() => handleModeChange('simulation')}
              className={`px-6 py-2.5 text-[13px] font-bold border-none cursor-pointer rounded-full transition-all duration-300 flex items-center gap-2 ${
                mode === 'simulation'
                  ? 'bg-amber-500 text-black shadow-[0_4px_20px_rgba(245,158,11,0.3)]'
                  : 'bg-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              🔬 Giả lập
            </button>
          </div>
      </div>
      {/* ── Simulation Mode Banner ─────────── */}
      {mode === 'simulation' && (
        <div
          className="absolute bottom-5 left-1/2 -translate-x-1/2 z-15 bg-amber-500/10 backdrop-blur-md border border-amber-500/25 rounded-lg px-4 py-1.5 text-[11px] font-semibold text-amber-500 tracking-wide flex items-center gap-1.5 pointer-events-none"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-[pulse_2s_infinite]" />
          SIMULATION MODE — Kết quả chỉ mang tính giả lập
        </div>
      )}

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
        >
          {selectedPoi && selectedPoi.id === 'empty-space-click' && (
            <Marker longitude={selectedPoi.lng} latitude={selectedPoi.lat} anchor="bottom">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none' }}>
                <div style={{ 
                  background: 'rgba(15,15,20,0.9)', 
                  padding: '6px 10px', 
                  borderRadius: 8, 
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                  fontSize: 12, 
                  fontWeight: 600, 
                  color: '#fafafa',
                  whiteSpace: 'nowrap',
                  textAlign: 'center',
                  marginBottom: 4,
                  backdropFilter: 'blur(8px)'
                }}>
                  Bãi đất trống<br/>
                  <span style={{ fontSize: 10, color: '#a1a1aa', fontWeight: 400 }}>
                    {selectedPoi.lat.toFixed(5)}, {selectedPoi.lng.toFixed(5)}
                  </span>
                </div>
                <div style={{ fontSize: 28, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))', transform: 'translateY(4px)' }}>
                  📍
                </div>
              </div>
            </Marker>
          )}
        </ReactMap>
      </DeckGL>

      {/* ── Player Hover Tooltip ─────────────── */}
      {hoveredPlayer && tooltipPos && (
        <div
          className="pointer-events-none absolute z-30"
          style={{ left: tooltipPos.x + 12, top: tooltipPos.y - 36 }}
        >
          <div className="flex flex-col bg-zinc-950/90 backdrop-blur-xl border border-white/10 rounded-xl px-3 py-2 shadow-2xl min-w-[120px]">
            <span className="text-[12px] font-bold text-white leading-tight">{hoveredPlayer.username || hoveredPlayer.userId.slice(0, 8)}</span>
            <span className="text-[10px] mt-0.5" style={{
              color: hoveredPlayer.activityState === 'IN_EVENT' || hoveredPlayer.activityState === 'IN_RECURRING_EVENT'
                ? '#f59e0b'
                : hoveredPlayer.activityState === 'IN_ROOM' || hoveredPlayer.activityState === 'IN_BUILDING'
                ? '#38bdf8'
                : '#86efac'
            }}>
              {hoveredPlayer.activityState.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      )}

      {/* ── Control / Simulation Panel ───────── */}
      {mode === 'observation' ? (
        <>
          {/* Bottom Center Time Bar */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-zinc-950/80 backdrop-blur-2xl border border-white/10 p-2 pl-5 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-10 pointer-events-auto">
            {/* LIVE Status */}
            <div className="flex items-center gap-2 mr-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-[pulse_1.5s_ease-in-out_infinite] shadow-[0_0_10px_rgba(239,68,68,0.6)]" />
              <span className="text-[12px] font-bold text-red-500 uppercase tracking-widest">TRỰC TIẾP</span>
            </div>
          </div>

          {/* Density Scale + Player Legend at bottom right */}
          <div className="absolute bottom-6 right-6 z-10 pointer-events-none bg-zinc-950/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-3 shadow-2xl flex flex-col gap-2">
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block text-center">
              Mật độ
            </span>
            <div
              className="h-1.5 w-32 rounded-full opacity-90 shadow-inner"
              style={{
                background: 'linear-gradient(90deg, #1e3cb4, #0096dc, #00c8a0, #50d264, #b4dc32, #ffdc00, #ff9600, #dc1e14)',
              }}
            />
            <div className="flex justify-between px-0.5 mb-1">
              <span className="text-[8px] font-bold text-zinc-500">Thấp</span>
              <span className="text-[8px] font-bold text-zinc-500">Cao</span>
            </div>
            <div className="border-t border-white/10 pt-2 flex flex-col gap-1">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block text-center mb-0.5">Người dùng</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#86efac] inline-block" />
                <span className="text-[9px] text-zinc-400">Đang di chuyển</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#38bdf8] inline-block" />
                <span className="text-[9px] text-zinc-400">Trong phòng / tòa nhà</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#f59e0b] inline-block" />
                <span className="text-[9px] text-zinc-400">Trong sự kiện</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <SimulationPanel
          scenario={sim.scenario}
          result={sim.result}
          loading={sim.loading}
          error={sim.error}
          hasChanges={sim.hasChanges}
          onAddEvent={sim.addVirtualEvent}
          onRemoveEvent={sim.removeVirtualEvent}
          onUpdateEvent={sim.updateVirtualEvent}
          onToggleFacility={sim.toggleFacilityClosed}
          onSetMultiplier={sim.setUserCountMultiplier}
          onSetTargetTime={sim.setTargetTime}
          onRemoveCustomBuilding={sim.removeCustomBuilding}
          onRunSimulation={sim.runSimulation}
          onResetAll={sim.resetAll}
          onExitSimulation={() => handleModeChange('observation')}
          panelCollapsed={panelCollapsed}
          setPanelCollapsed={setPanelCollapsed}
        />
      )}

      {/* ── Zone Detail Panel (on click) ──── */}
      {selectedCell && (
        <ZoneDetailPanel
          selectedCell={selectedCell}
          onClose={() => setSelectedCell(null)}
        />
      )}

      {/* ── Building Detail Panel ───────────── */}
      {selectedPoi && selectedPoi.id !== 'empty-space-click' && (
        <BuildingDetailPanel
          selectedPoi={selectedPoi}
          onClose={() => setSelectedPoi(null)}
          buildingDensity={buildingDensity}
          globalReasons={displayGlobalReasons}
          poiReasons={displayPoiReasons}
        />
      )}

      {/* Bottom Overlays */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-10 pointer-events-auto transition-transform duration-300">
      </div>

      {/* ── Dynamic AI model predicting overlay ── */}
      {loading && (
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-950/70 backdrop-blur-xl border rounded-[24px] px-12 py-8 flex flex-col items-center gap-5 z-[99999] pointer-events-none ${
            mode === 'simulation'
              ? 'border-amber-500/30 shadow-[0_0_40px_rgba(245,158,11,0.2),_inset_0_0_20px_rgba(245,158,11,0.1)]'
              : 'border-violet-400/30 shadow-[0_0_40px_rgba(139,92,246,0.2),_inset_0_0_20px_rgba(139,92,246,0.1)]'
          }`}
        >
          <div className="relative w-16 h-16 flex items-center justify-center">
            <div
              className={`absolute inset-0 rounded-full border-[3px] border-transparent custom-spinner opacity-80 ${
                mode === 'simulation' ? 'border-t-amber-500 border-l-amber-600' : 'border-t-purple-500 border-l-purple-600'
              }`}
            />
            <div
              className={`absolute inset-2 rounded-full animate-pulse ${
                mode === 'simulation'
                  ? 'bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                  : 'bg-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.5)]'
              }`}
            />
            <span className="relative text-2xl">{mode === 'simulation' ? '🔬' : '🧠'}</span>
          </div>
          <div className="flex flex-col items-center">
            <div
              className={`text-[13px] font-medium tracking-wide mt-1 animate-pulse ${
                mode === 'simulation' ? 'text-amber-500' : 'text-violet-400'
              }`}
            >
              {mode === 'simulation'
                ? 'Đang chạy kịch bản giả lập...'
                : 'Synthesizing Future Spatiotemporal Density...'}
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
        input[type="datetime-local"]::-webkit-calendar-picker-indicator {
          filter: invert(0.7);
          cursor: pointer;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #fafafa;
          border: 2px solid rgba(0,0,0,0.3);
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          transition: transform 0.15s;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }
        input[type="range"]::-webkit-slider-thumb:active {
          transform: scale(1.1);
          background: #f59e0b;
        }
      `}</style>
    </div>
  );
}
