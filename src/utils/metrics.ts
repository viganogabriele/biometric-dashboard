import type { MeasurementDate } from "../types";

const toTimestamp = (date: MeasurementDate): number => {
  if (!date) {
    return Number.NEGATIVE_INFINITY;
  }

  const parsed = Date.parse(date);
  return Number.isNaN(parsed) ? Number.NEGATIVE_INFINITY : parsed;
};

export const getLatestAndPrevious = <T extends { date: MeasurementDate }>(
  items: T[],
): { latest?: T; previous?: T } => {
  if (items.length === 0) {
    return {};
  }

  const ordered = [...items]
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const timestampDelta =
        toTimestamp(a.item.date) - toTimestamp(b.item.date);
      if (timestampDelta === 0) {
        return a.index - b.index;
      }
      return timestampDelta;
    });

  return {
    latest: ordered[ordered.length - 1]?.item,
    previous: ordered[ordered.length - 2]?.item,
  };
};

export const deltaFromPrevious = (
  currentValue: number,
  previousValue?: number,
): number | null => {
  if (previousValue === undefined) {
    return null;
  }

  return currentValue - previousValue;
};
