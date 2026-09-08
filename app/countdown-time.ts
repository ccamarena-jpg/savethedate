export const WEDDING_TIME = Date.parse('2026-12-12T00:00:00-05:00');
export function remainingTime(now: number) {
  const seconds = Math.max(0, Math.floor((WEDDING_TIME - now) / 1000));
  return {
    days: Math.floor(seconds / 86400),
    hours: Math.floor(seconds / 3600) % 24,
    minutes: Math.floor(seconds / 60) % 60,
    seconds: seconds % 60,
    finished: now >= WEDDING_TIME,
  };
}
