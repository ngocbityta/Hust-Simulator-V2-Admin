import { useMemo, useState } from 'react';
import { useFetch } from './useFetch';

export type Tab = 'passive' | 'active';

export const useUserDetailData = (id: string | undefined, activeTab: Tab) => {
  // Fetch Passive Data with one-time cache-busting per ID
  const passiveUrl = useMemo(() => `/prediction-data/checkin-sequences/${id}?t=${Date.now()}`, [id]);
  const { data: passiveDataRaw, isLoading: isLoadingPassive } = useFetch<any>(passiveUrl);
  const passiveData = passiveDataRaw?.content || (Array.isArray(passiveDataRaw) ? passiveDataRaw : null);

  // Fetch User Info for Title
  const { data: userData } = useFetch<any>(`/users/${id}`);

  // Fetch Active Data (Journeys)
  const { data: activeJourneysRaw, isLoading: isLoadingActive } = useFetch<any>(
    `/journeys/user/${id}`
  );
  const activeJourneys = activeJourneysRaw?.content || (Array.isArray(activeJourneysRaw) ? activeJourneysRaw : null);

  // Fetch Buildings for mapping POI ID to Name and Location
  const { data: buildingsData } = useFetch<any>('/buildings/active');
  const buildings = buildingsData?.content || (Array.isArray(buildingsData) ? buildingsData : []);

  const buildingMap = useMemo(() => {
    const map = new Map();
    buildings.forEach((b: any) => {
      map.set(b.id, b);
    });
    return map;
  }, [buildings]);

  // Transform passive data for map and list
  const passiveCheckins = useMemo(() => {
    if (!passiveData) return [];
    return passiveData.map((c: any) => {
      const b = buildingMap.get(c.poi_id);
      return {
        ...c,
        poi_name: b?.name || 'Unknown Location',
        lat: b?.centroidLat || b?.lat || 0,
        lng: b?.centroidLng || b?.lng || 0,
      };
    });
  }, [passiveData, buildingMap]);

  // Extract active checkins for map and list
  const activeCheckins = useMemo(() => {
    if (!activeJourneys) return [];
    const checkins: any[] = [];
    activeJourneys.forEach((j: any) => {
      if (j.items) {
        j.items.forEach((item: any) => {
          if (item.referenceId) {
            const b = buildingMap.get(item.referenceId);
            checkins.push({
              ...item,
              journey_id: j.id,
              poi_name: b?.name || 'Unknown Location',
              lat: b?.centroidLat || item.latitude || 0,
              lng: b?.centroidLng || item.longitude || 0,
              timestamp: item.timestamp,
            });
          }
        });
      }
    });
    // Sort by timestamp desc
    return checkins.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [activeJourneys, buildingMap]);

  // Extract paths for active journeys
  const activePaths = useMemo(() => {
    if (!activeJourneys) return [];
    return activeJourneys
      .filter((j: any) => j.pathCoordinates && j.pathCoordinates.length > 1)
      .map((j: any) => ({
        path: j.pathCoordinates.map((coord: any) => [coord.longitude, coord.latitude]),
        color: [50, 150, 250]
      }));
  }, [activeJourneys]);

  // Use stats from backend for passive tab
  const buildingStats = useMemo(() => {
    const stats = passiveDataRaw?.stats || [];
    const total = passiveDataRaw?.total_duration_seconds || 0;
    
    const result = stats.map((s: any) => {
      const b = buildingMap.get(s.poi_id);
      return {
        poi_id: s.poi_id,
        name: b?.name || 'Unknown',
        lat: b?.centroidLat || 0,
        lng: b?.centroidLng || 0,
        percentage: s.percentage,
        duration: s.duration_seconds
      };
    }).filter((s: any) => s.lat !== 0 && s.lng !== 0);
    
    return { data: result, totalDuration: total };
  }, [activeTab, passiveDataRaw, buildingMap]);

  const isLoading = activeTab === 'passive' ? isLoadingPassive : isLoadingActive;

  const [predictionResults, setPredictionResults] = useState<any | null>(null);
  const [isPredicting, setIsPredicting] = useState<boolean>(false);

  const predictLocation = async (targetTimestampMs: number) => {
    if (!id) return;
    setIsPredicting(true);
    setPredictionResults(null);
    try {
      const payload = {
        userId: id,
        targetTimestampMs
      };
      
      const { apiFetch } = await import('../utils/api');
      const res = await apiFetch('/prediction/predict-next', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      setPredictionResults(res);
    } catch (err) {
      console.error('Prediction failed:', err);
    } finally {
      setIsPredicting(false);
    }
  };

  const clearPrediction = () => setPredictionResults(null);

  return {
    passiveDataRaw,
    userData,
    buildings,
    buildingMap,
    passiveCheckins,
    activeCheckins,
    activePaths,
    buildingStats,
    isLoading,
    predictionResults,
    isPredicting,
    predictLocation,
    clearPrediction
  };
};
