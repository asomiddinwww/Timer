/**
 * Timezone and deadline calculation utilities for Asia/Tashkent
 * Target deadline: 2 June 2027 23:59:59 (Asia/Tashkent UTC+5)
 */

export const DEFAULT_DEADLINE = '2027-06-02T23:59:59';
export const DEFAULT_TIMEZONE = 'Asia/Tashkent';

/**
 * Returns current timestamp adjusted or parsed in target timezone
 */
export function getNowInTimezone(timeZone = DEFAULT_TIMEZONE) {
  return new Date();
}

/**
 * Calculates remaining time dynamically down to milliseconds and seconds
 */
export function calculateRemainingTime(targetDateStr = DEFAULT_DEADLINE, timeZone = DEFAULT_TIMEZONE) {
  const now = new Date();
  
  // Format target date in target timezone or parse as ISO with +05:00 if Tashkent
  let targetTimestamp;
  if (targetDateStr.includes('Z') || targetDateStr.includes('+')) {
    targetTimestamp = new Date(targetDateStr).getTime();
  } else {
    // Tashkent is UTC+5 without daylight savings time
    const tzOffset = timeZone === 'Asia/Tashkent' ? '+05:00' : 'Z';
    // If target has time part
    const isoString = targetDateStr.length === 10 ? `${targetDateStr}T23:59:59${tzOffset}` : `${targetDateStr}${tzOffset}`;
    targetTimestamp = new Date(isoString).getTime();
  }

  const diffMs = targetTimestamp - now.getTime();

  if (diffMs <= 0) {
    return {
      isReached: true,
      totalSeconds: 0,
      totalMinutes: 0,
      totalHours: 0,
      totalDays: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      urgency: 'CRITICAL',
    };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  // Urgency indicator according to specs:
  // > 180 days: LOW
  // 90–180 days: MEDIUM
  // 30–90 days: HIGH
  // < 30 days: CRITICAL
  let urgency = 'LOW';
  if (totalDays < 30) {
    urgency = 'CRITICAL';
  } else if (totalDays <= 90) {
    urgency = 'HIGH';
  } else if (totalDays <= 180) {
    urgency = 'MEDIUM';
  }

  return {
    isReached: false,
    totalSeconds,
    totalMinutes,
    totalHours,
    totalDays,
    days,
    hours,
    minutes,
    seconds,
    urgency,
  };
}

/**
 * Calculates days passed since reference start date
 */
export function calculateDaysPassed(startDateStr = '2026-01-01') {
  const start = new Date(startDateStr).getTime();
  const now = new Date().getTime();
  const diffMs = now - start;
  if (diffMs <= 0) return 0;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Formats a Date object or string as YYYY-MM-DD
 */
export function formatDateKey(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a date nicely
 */
export function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}
