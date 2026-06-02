import type { BackendConfig, QuickPickItem } from '../types/heatmap';

function toLocalDatetimeStr(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function getQuickPicks(): QuickPickItem[] {
  const now = new Date();

  const inHours = (h: number) => {
    const d = new Date(now.getTime() + h * 3600_000);
    return toLocalDatetimeStr(d);
  };

  const nextWeekday = (dayOffset: number, hour: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + dayOffset);
    d.setHours(hour, 0, 0, 0);
    return toLocalDatetimeStr(d);
  };

  return [
    { label: '+1h', value: inHours(1) },
    { label: '+3h', value: inHours(3) },
    { label: 'Tomorrow 8AM', value: nextWeekday(1, 8) },
    { label: 'Tomorrow 1PM', value: nextWeekday(1, 13) },
    { label: '+3 days 9AM', value: nextWeekday(3, 9) },
    { label: '+7 days 10AM', value: nextWeekday(7, 10) },
  ];
}

export function getBackendConfig(): BackendConfig {
  const isHttps = window.location.protocol === 'https:';
  const hostName = window.location.hostname;
  const currentPort = window.location.port;

  let apiPort = currentPort;
  if (currentPort !== '80' && currentPort !== '443') {
    apiPort = isHttps ? '443' : '80';
  }

  const backendHost = hostName ? `${hostName}:${apiPort}` : 'localhost:80';

  return {
    httpBase: `${isHttps ? 'https' : 'http'}://${backendHost}`,
    wsBase: `${isHttps ? 'wss' : 'ws'}://${backendHost}`
  };
}
