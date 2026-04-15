import type { MeasurementDate } from "../types";

export const formatDate = (
  date: MeasurementDate,
  fallback = "Data non disponibile",
  locale = "it-IT",
): string => {
  if (!date) {
    return fallback;
  }

  const parsed = Date.parse(date);
  if (Number.isNaN(parsed)) {
    return fallback;
  }

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(parsed));
};

export const formatNumber = (
  value: number,
  decimals = 1,
  locale = "it-IT",
): string => {
  if (!Number.isFinite(value)) {
    return "-";
  }

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value);
};

export const formatMetric = (
  value: number,
  unit: string,
  decimals = 1,
  locale = "it-IT",
): string => {
  if (!unit) {
    return formatNumber(value, decimals, locale);
  }

  return `${formatNumber(value, decimals, locale)} ${unit}`;
};
