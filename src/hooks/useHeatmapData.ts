import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import type { CellData, ConnectionStatus, HeatmapResponse } from '../types/heatmap';
import { getBackendConfig } from '../utils/heatmapHelpers';

export function useHeatmapData() {
  const [data, setData] = useState<CellData[]>([]);
  const [totalOnline, setTotalOnline] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [targetDateStr, setTargetDateStr] = useState('');
  const [selectedCell, setSelectedCell] = useState<CellData | null>(null);
  const [connStatus, setConnStatus] = useState<ConnectionStatus>('connecting');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [globalReasons, setGlobalReasons] = useState<string[]>([]);
  const [poiReasons, setPoiReasons] = useState<Record<string, string[]>>({});

  const wsRef = useRef<WebSocket | null>(null);

  const handleSetTargetDateStr = useCallback((val: string) => {
    setTargetDateStr(val);
    const customMs = val ? new Date(val).getTime() : undefined;
    if (customMs && !isNaN(customMs)) {
      setConnStatus('forecast');
      // Keep stale data visible while loading new forecast — no flash
    } else {
      setConnStatus('connecting');
      // Keep stale data visible while reconnecting to live — no flash
    }
  }, []);

  const updateState = useCallback((json: HeatmapResponse) => {
    setData(json.cells ?? []);
    setTotalOnline(json.totalOnline ?? 0);
    setLastUpdated(json.timestamp ? new Date(json.timestamp) : new Date());
    setGlobalReasons(json.globalReasons ?? []);
    setPoiReasons(json.poiReasons ?? {});

    setSelectedCell((prev) => {
      if (!prev) return null;
      const next = (json.cells ?? []).find(
        (c) => c.cellX === prev.cellX && c.cellY === prev.cellY,
      );
      return next ?? null;
    });
  }, []);

  const fetchHttp = useCallback(
    async (targetMs?: number) => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const { httpBase } = getBackendConfig();
        let url = `${httpBase}/api/heatmap/latest-predictive`;
        if (targetMs) url += `?targetTime=${targetMs}`;
        const res = await fetch(url);
        if (res.ok) {
          updateState(await res.json());
        } else {
          setErrorMsg(`Server returned status ${res.status}: ${res.statusText}`);
        }
      } catch (err: unknown) {
        console.error('Fetch error:', err);
        const msg = err instanceof Error ? err.message : String(err);
        setErrorMsg(`Network failed: ${msg}. Host target: ${window.location.hostname}:80`);
      } finally {
        setLoading(false);
      }
    },
    [updateState],
  );

  // Live / Forecast logic
  useEffect(() => {
    const customMs = targetDateStr ? new Date(targetDateStr).getTime() : undefined;

    if (customMs && !isNaN(customMs)) {
      // ── FORECAST MODE ──
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      Promise.resolve().then(() => {
        fetchHttp(customMs);
      });
      return;
    }

    // ── LIVE MODE ──
    Promise.resolve().then(() => {
      fetchHttp(); // immediate snapshot
    });

    let ws: WebSocket | null = null;
    let reconnectTimer: NodeJS.Timeout;

    const connectWs = () => {
      const { wsBase } = getBackendConfig();
      ws = new WebSocket(`${wsBase}/ws`);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnStatus('live');
        ws!.send(JSON.stringify({ event: 'predictive_heatmap:subscribe' }));
      };

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.event === 'predictive_heatmap:update' && msg.data) {
            updateState(msg.data);
          }
        } catch { /* noop */ }
      };

      const scheduleReconnect = () => {
        setConnStatus('disconnected');
        clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(() => {
          setConnStatus('connecting');
          connectWs();
        }, 3000);
      };

      ws.onerror = scheduleReconnect;
      ws.onclose = scheduleReconnect;
    };

    connectWs();

    return () => {
      clearTimeout(reconnectTimer);
      if (ws) {
        ws.onclose = null;
        ws.onerror = null;
        ws.close();
      }
    };
  }, [targetDateStr, fetchHttp, updateState]);

  // Compute expected people per building from heatmap intents
  const buildingDensity = useMemo(() => {
    const m = new Map<string, number>();
    for (const cell of data) {
      for (const [poiName, count] of Object.entries(cell.intents)) {
        m.set(poiName, (m.get(poiName) || 0) + count);
      }
    }
    return m;
  }, [data]);

  return {
    data,
    totalOnline,
    lastUpdated,
    targetDateStr,
    setTargetDateStr: handleSetTargetDateStr,
    selectedCell,
    setSelectedCell,
    connStatus,
    loading,
    errorMsg,
    buildingDensity,
    isLive: !targetDateStr,
    globalReasons,
    poiReasons,
  };
}
