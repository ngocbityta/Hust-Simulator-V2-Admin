/**
 * Converts a Spring or standard Cron expression into a human-readable Vietnamese description.
 * Expected formats:
 * - "0 0 13 * * 2,4" (6 fields: sec min hour dayOfMonth month dayOfWeek)
 * - "0 0 8 * * 1-5"
 * - "0 30 17 * * 5"
 * - "0 0 8 * * ?"
 */
export const cronToHumanReadable = (cron: string): string => {
  if (!cron) return 'Chưa xác định';
  
  const parts = cron.trim().split(/\s+/);
  if (parts.length < 5) return cron;

  let min = '00';
  let hour = '00';
  let dayOfWeek = '*';

  if (parts.length === 6) {
    min = parts[1];
    hour = parts[2];
    dayOfWeek = parts[5];
  } else if (parts.length === 5) {
    min = parts[0];
    hour = parts[1];
    dayOfWeek = parts[4];
  } else {
    // 7 fields or other formats
    min = parts[1] || '00';
    hour = parts[2] || '00';
    dayOfWeek = parts[5] || '*';
  }

  const formatTime = (h: string, m: string) => {
    const hh = h.padStart(2, '0');
    const mm = m.padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const timeStr = formatTime(hour, min);

  const dayMap: { [key: string]: string } = {
    '1': 'Thứ 2', 'MON': 'Thứ 2',
    '2': 'Thứ 3', 'TUE': 'Thứ 3',
    '3': 'Thứ 4', 'WED': 'Thứ 4',
    '4': 'Thứ 5', 'THU': 'Thứ 5',
    '5': 'Thứ 6', 'FRI': 'Thứ 6',
    '6': 'Thứ 7', 'SAT': 'Thứ 7',
    '7': 'Chủ Nhật', '0': 'Chủ Nhật', 'SUN': 'Chủ Nhật'
  };

  const translateDay = (day: string) => dayMap[day.toUpperCase()] || day;

  let dayStr = '';
  if (dayOfWeek === '*' || dayOfWeek === '?') {
    dayStr = 'Hàng ngày';
  } else if (dayOfWeek.includes('-')) {
    const rangeParts = dayOfWeek.split('-');
    if (rangeParts.length === 2) {
      dayStr = `Từ ${translateDay(rangeParts[0])} đến ${translateDay(rangeParts[1])}`;
    } else {
      dayStr = dayOfWeek;
    }
  } else if (dayOfWeek.includes(',')) {
    const days = dayOfWeek.split(',').map(d => translateDay(d));
    dayStr = days.join(', ');
  } else {
    dayStr = translateDay(dayOfWeek);
  }

  return `${dayStr} lúc ${timeStr}`;
};

/**
 * Cleans the virtual classroom name by removing any trailing "(Định kỳ)" or "(định kỳ)" pattern.
 */
export const cleanClassName = (name: string): string => {
  if (!name) return '';
  return name.replace(/\s*\(định kỳ\)\s*$/gi, '');
};
