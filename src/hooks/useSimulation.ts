import { useState, useCallback } from 'react';
import type { HeatmapResponse } from '../types/heatmap';
import type {
  SimulationScenario,
  WeatherOverride,
  VirtualEvent,
  ClosedFacility,
} from '../types/simulation';
import { DEFAULT_SCENARIO } from '../types/simulation';
import { getBackendConfig } from '../utils/heatmapHelpers';

export function useSimulation() {
  const [scenario, setScenario] = useState<SimulationScenario>({ ...DEFAULT_SCENARIO });
  const [result, setResult] = useState<HeatmapResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setWeatherOverride = useCallback((weather: WeatherOverride | null) => {
    setScenario((prev) => ({ ...prev, weatherOverride: weather }));
  }, []);

  const addVirtualEvent = useCallback((event: VirtualEvent) => {
    setScenario((prev) => ({
      ...prev,
      virtualEvents: [...prev.virtualEvents, event],
    }));
  }, []);

  const removeVirtualEvent = useCallback((id: string) => {
    setScenario((prev) => ({
      ...prev,
      virtualEvents: prev.virtualEvents.filter((e) => e.id !== id),
    }));
  }, []);

  const updateVirtualEvent = useCallback((id: string, updates: Partial<VirtualEvent>) => {
    setScenario((prev) => ({
      ...prev,
      virtualEvents: prev.virtualEvents.map((e) =>
        e.id === id ? { ...e, ...updates } : e,
      ),
    }));
  }, []);

  const toggleFacilityClosed = useCallback((facility: ClosedFacility) => {
    setScenario((prev) => {
      const exists = prev.closedFacilities.some((f) => f.id === facility.id);
      return {
        ...prev,
        closedFacilities: exists
          ? prev.closedFacilities.filter((f) => f.id !== facility.id)
          : [...prev.closedFacilities, facility],
      };
    });
  }, []);

  const setUserCountMultiplier = useCallback((value: number) => {
    setScenario((prev) => ({ ...prev, userCountMultiplier: value }));
  }, []);

  const setTargetTime = useCallback((value: string) => {
    setScenario((prev) => ({ ...prev, targetTime: value }));
  }, []);

  const addCustomBuilding = useCallback((b: import('../types/heatmap').BuildingPolygonData) => {
    setScenario((prev) => ({
      ...prev,
      customBuildings: [...prev.customBuildings, b],
    }));
  }, []);

  const removeCustomBuilding = useCallback((id: string) => {
    setScenario((prev) => ({
      ...prev,
      customBuildings: prev.customBuildings.filter((b) => b.id !== id),
    }));
  }, []);

  const runSimulation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { httpBase } = getBackendConfig();
      const targetMs = scenario.targetTime
        ? new Date(scenario.targetTime).getTime()
        : Date.now();

      const body = {
        targetTime: targetMs,
        simulation: {
          weatherOverride: scenario.weatherOverride,
          virtualEvents: scenario.virtualEvents.map((ve) => ({
            name: ve.name,
            buildingId: ve.buildingId,
            estimatedParticipants: ve.estimatedParticipants,
            startTime: ve.startTime,
            endTime: ve.endTime,
          })),
          eventModifications: scenario.eventModifications,
          closedBuildingIds: scenario.closedFacilities
            .filter((f) => f.type === 'building')
            .map((f) => f.id),
          closedNodeIds: scenario.closedFacilities
            .filter((f) => f.type === 'parking' || f.type === 'gate')
            .map((f) => f.id),
          userCountMultiplier: scenario.userCountMultiplier,
        },
      };

      const res = await fetch(`${httpBase}/api/heatmap/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data: HeatmapResponse = await res.json();
        setResult(data);
      } else {
        setError(`Server returned ${res.status}: ${res.statusText}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Simulation failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, [scenario]);

  const resetAll = useCallback(() => {
    setScenario({ ...DEFAULT_SCENARIO });
    setResult(null);
    setError(null);
  }, []);

  const hasChanges =
    scenario.weatherOverride !== null ||
    scenario.virtualEvents.length > 0 ||
    scenario.eventModifications.length > 0 ||
    scenario.closedFacilities.length > 0 ||
    scenario.customBuildings.length > 0 ||
    scenario.userCountMultiplier !== 1.0;

  return {
    scenario,
    result,
    loading,
    error,
    hasChanges,
    setWeatherOverride,
    addVirtualEvent,
    removeVirtualEvent,
    updateVirtualEvent,
    toggleFacilityClosed,
    setUserCountMultiplier,
    setTargetTime,
    addCustomBuilding,
    removeCustomBuilding,
    runSimulation,
    resetAll,
  };
}
