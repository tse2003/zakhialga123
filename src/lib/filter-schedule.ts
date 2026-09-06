export const FILTER_DEFINITIONS = [
  { filterNumber: 1, name: '№1 Тунадаст шүүр', intervalMonths: 3 },
  { filterNumber: 2, name: '№2 Нүүрсэн шүүр', intervalMonths: 6 },
  { filterNumber: 3, name: '№3 Нэмэлт шүүлтүүр', intervalMonths: 9 },
  { filterNumber: 4, name: '№4 Эцсийн шүүлтүүр', intervalMonths: 12 },
] as const;

export function addMonthsClamped(dateValue: Date | string, months: number) {
  const date = new Date(dateValue);
  const result = new Date(date);
  const originalDay = result.getUTCDate();

  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + months);

  const lastDay = new Date(
    Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)
  ).getUTCDate();

  result.setUTCDate(Math.min(originalDay, lastDay));
  return result;
}

export function createFilterSchedules(installedAt: Date | string) {
  const installedDate = new Date(installedAt);

  return FILTER_DEFINITIONS.map((filter) => ({
    ...filter,
    lastChangedAt: installedDate,
    nextChangeAt: addMonthsClamped(installedDate, filter.intervalMonths),
  }));
}

