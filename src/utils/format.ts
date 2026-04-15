import type { MeasurementDate } from "../types";

export const formatDate = (
  date: MeasurementDate,
  fallback = "Data non disponibile",
): string => {
  if (!date) {
    return fallback;
  }

  const parsed = Date.parse(date);
  if (Number.isNaN(parsed)) {
    return fallback;
  }

  return new Intl.DateTimeFormat("it-IT", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(parsed));
};

export const formatNumber = (value: number, decimals = 1): string => {
  if (!Number.isFinite(value)) {
    return "-";
  }

  return new Intl.NumberFormat("it-IT", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value);
};

export const formatMetric = (
  value: number,
  unit: string,
  decimals = 1,
): string => {
  if (!unit) {
    return formatNumber(value, decimals);
  }

  return `${formatNumber(value, decimals)} ${unit}`;
};
