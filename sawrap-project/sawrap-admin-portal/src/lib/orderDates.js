const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const nextDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

export function orderDateRange(preset, from, to, now = new Date()) {
  if (preset === 'all') return { start: null, end: null };
  const today = startOfDay(now);
  if (preset === 'today') return { start: today.toISOString(), end: nextDay(today).toISOString() };
  if (preset === 'week') {
    return { start: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6).toISOString(),
      end: nextDay(today).toISOString() };
  }
  if (preset === 'month') {
    return { start: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29).toISOString(),
      end: nextDay(today).toISOString() };
  }
  if (!from || !to || from > to) return null;
  return { start: new Date(`${from}T00:00:00`).toISOString(),
    end: nextDay(new Date(`${to}T00:00:00`)).toISOString() };
}
