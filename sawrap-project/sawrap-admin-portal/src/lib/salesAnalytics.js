export const salesPeriods = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'Last 7 Days' },
  { id: 'sixMonths', label: 'Last 6 Months' },
  { id: 'year', label: 'Last 1 Year' },
  { id: 'custom', label: 'Custom Range' },
  { id: 'all', label: 'All Dates' },
];

// The shop uses Philippine Standard Time (UTC+8) for reporting days.
const manilaOffset = 8 * 60 * 60 * 1000;
const dayMillis = 24 * 60 * 60 * 1000;
const toInstant = (calendarDay) => new Date(calendarDay - manilaOffset).toISOString();

export function salesDateRange(period, from, through, now = new Date()) {
  if (period === 'all') return { start: null, end: null };
  if (period === 'custom') {
    if (!from || !through || from > through) return null;
    return { start: toInstant(Date.parse(from)), end: toInstant(Date.parse(through) + dayMillis) };
  }

  const date = new Date(now.getTime() + manilaOffset);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  let start = Date.UTC(year, month, day - (period === 'week' ? 6 : 0));
  if (period === 'sixMonths' || period === 'year') {
    const startMonth = month - (period === 'sixMonths' ? 6 : 12);
    const lastDay = new Date(Date.UTC(year, startMonth + 1, 0)).getUTCDate();
    start = Date.UTC(year, startMonth, Math.min(day, lastDay));
  }
  return { start: toInstant(start), end: toInstant(Date.UTC(year, month, day + 1)) };
}

export function summarizeSales(orders) {
  const report = { count: orders.length, subtotal: 0, discounts: 0, total: 0 };
  const categories = new Map(['Sakto', 'Sarap', 'Sagad'].map((name) => [name, 0]));
  const flavors = new Map();

  for (const order of orders) {
    report.subtotal += order.subtotal_centavos;
    report.discounts += order.discount_centavos;
    report.total += order.total_centavos;

    for (const item of order.order_items) {
      const category = item.category || 'Uncategorized';
      categories.set(category, (categories.get(category) ?? 0) + item.line_total_centavos);
      const key = item.product_id ?? JSON.stringify([item.product_name, category]);
      const flavor = flavors.get(key) ?? { key, name: item.product_name, category, units: 0 };
      flavor.units += item.quantity;
      flavors.set(key, flavor);
    }
  }

  return {
    ...report,
    categories: [...categories],
    flavors: [...flavors.values()].sort((a, b) => b.units - a.units || a.name.localeCompare(b.name)),
  };
}
