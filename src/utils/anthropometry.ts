import type {
  CircumferenceMeasurement,
  CircumferenceSites,
  HealthData,
  SkinfoldMeasurement,
  SkinfoldSites,
} from "../types";

export interface NutritionReportRow {
  categoria: "Pliche" | "Circonferenze";
  date: string;
  numeroMisurazione: number;
  pesoKg: number | null;
  bodyFatPct: number;
  mediaPlicheMm: number | null;
  tricipiteMm: number | null;
  addomeMm: number | null;
  soprailiacaMm: number | null;
  sottoscapolareMm: number | null;
  ascellareMm: number | null;
  pettoraleMm: number | null;
  cosciaMm: number | null;
  braccioCm: number | null;
  toraceCm: number | null;
  vitaCm: number | null;
  fianchiCm: number | null;
  cosciaCm: number | null;
  polpaccioCm: number | null;
  colloCm: number | null;
}

export interface SkinfoldInput {
  date: string;
  weightKg: number;
  ageYears: number;
  sitesMm: SkinfoldSites;
}

export interface CircumferenceInput {
  date: string;
  sitesCm: CircumferenceSites;
}

const round = (value: number, digits = 2): number => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const createMeasurementId = (prefix: "sf" | "cf"): string => {
  if (
    typeof globalThis.crypto !== "undefined" &&
    "randomUUID" in globalThis.crypto
  ) {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const sumValues = (values: number[]): number =>
  values.reduce((acc, value) => acc + value, 0);

const bodyDensityFromSkinfolds = (
  sumOf7SkinfoldsMm: number,
  ageYears: number,
): number => {
  return (
    1.112 -
    0.00043499 * sumOf7SkinfoldsMm +
    0.00000055 * sumOf7SkinfoldsMm ** 2 -
    0.00028826 * ageYears
  );
};

const bodyFatPctFromDensity = (density: number): number => 495 / density - 450;

const bodyFatPctFromCircumferences = (
  waistCm: number,
  neckCm: number,
  heightCm: number,
): number => {
  if (waistCm <= neckCm) {
    throw new Error("Invalid circumferences: waist must be greater than neck.");
  }

  if (heightCm <= 0) {
    throw new Error("Invalid height for circumference formula.");
  }

  return (
    495 /
      (1.0324 -
        0.19077 * Math.log10(waistCm - neckCm) +
        0.15456 * Math.log10(heightCm)) -
    450
  );
};

export const buildSkinfoldMeasurement = (
  input: SkinfoldInput,
  measurementNumber: number,
): SkinfoldMeasurement => {
  if (!Number.isFinite(input.weightKg) || input.weightKg <= 0) {
    throw new Error("Invalid skinfold measurement: weight must be > 0.");
  }

  if (!Number.isFinite(input.ageYears) || input.ageYears <= 0) {
    throw new Error("Invalid skinfold measurement: age must be > 0.");
  }

  const values = Object.values(input.sitesMm);
  if (values.some((value) => !Number.isFinite(value) || value <= 0)) {
    throw new Error("Invalid skinfold measurement: all sites must be > 0.");
  }

  const sumMm = sumValues(values);
  const averageMm = sumMm / values.length;
  const bodyDensity = bodyDensityFromSkinfolds(sumMm, input.ageYears);
  const bodyFat = bodyFatPctFromDensity(bodyDensity);

  return {
    id: createMeasurementId("sf"),
    measurementNumber,
    date: input.date,
    weightKg: input.weightKg,
    ageUsedInFormula: input.ageYears,
    sitesMm: input.sitesMm,
    sumMm: round(sumMm, 2),
    averageMm: round(averageMm, 2),
    bodyDensity: round(bodyDensity, 4),
    bodyFatPctFromSkinfold: round(bodyFat, 2),
  };
};

export const buildCircumferenceMeasurement = (
  input: CircumferenceInput,
  measurementNumber: number,
  heightCm: number,
): CircumferenceMeasurement => {
  const values = Object.values(input.sitesCm);
  if (values.some((value) => !Number.isFinite(value) || value <= 0)) {
    throw new Error(
      "Invalid circumference measurement: all sites must be > 0.",
    );
  }

  const bodyFat = bodyFatPctFromCircumferences(
    input.sitesCm.vita,
    input.sitesCm.collo,
    heightCm,
  );

  return {
    id: createMeasurementId("cf"),
    measurementNumber,
    date: input.date,
    sitesCm: input.sitesCm,
    bodyFatPctFromCircumferences: round(bodyFat, 2),
  };
};

export const buildAnthropometryExport = (
  healthData: HealthData,
): { json: string; csv: string } => {
  const exportObject = {
    generatoIl: new Date().toISOString(),
    profilo: healthData.profile,
    pliche: healthData.skinfolds.measurements,
    circonferenze: healthData.circumferences.measurements,
    nota: "BIA gestita separatamente da sorgenti .md.",
  };

  const rows = buildNutritionReportRows(healthData);

  const csvHeader = [
    "categoria",
    "data",
    "numero_misurazione",
    "peso_kg",
    "body_fat_pct",
    "media_pliche_mm",
    "tricipite_mm",
    "addome_mm",
    "soprailiaca_mm",
    "sottoscapolare_mm",
    "ascellare_mm",
    "pettorale_mm",
    "coscia_mm",
    "braccio_cm",
    "torace_cm",
    "vita_cm",
    "fianchi_cm",
    "coscia_cm",
    "polpaccio_cm",
    "collo_cm",
  ];

  const escapeCsvValue = (value: string | number | null): string => {
    if (value === null || value === undefined) {
      return "";
    }

    const text = String(value);
    if (
      text.includes(";") ||
      text.includes("\n") ||
      text.includes("\"")
    ) {
      return `"${text.replace(/\"/g, '""')}"`;
    }

    return text;
  };

  const csvBody = rows
    .map((row) => [
      row.categoria,
      row.date,
      row.numeroMisurazione,
      row.pesoKg,
      row.bodyFatPct,
      row.mediaPlicheMm,
      row.tricipiteMm,
      row.addomeMm,
      row.soprailiacaMm,
      row.sottoscapolareMm,
      row.ascellareMm,
      row.pettoraleMm,
      row.cosciaMm,
      row.braccioCm,
      row.toraceCm,
      row.vitaCm,
      row.fianchiCm,
      row.cosciaCm,
      row.polpaccioCm,
      row.colloCm,
    ])
    .map((row) => row.map((value) => escapeCsvValue(value)).join(";"))
    .join("\n");

  return {
    json: JSON.stringify(exportObject, null, 2),
    csv: `${csvHeader.join(";")}\n${csvBody}`,
  };
};

export const buildNutritionReportRows = (
  healthData: HealthData,
): NutritionReportRow[] => {
  const skinfoldRows: NutritionReportRow[] =
    healthData.skinfolds.measurements.map((measurement) => ({
      categoria: "Pliche",
      date: measurement.date ?? "",
      numeroMisurazione: measurement.measurementNumber,
      pesoKg: measurement.weightKg,
      bodyFatPct: measurement.bodyFatPctFromSkinfold,
      mediaPlicheMm: measurement.averageMm,
      tricipiteMm: measurement.sitesMm.tricipite,
      addomeMm: measurement.sitesMm.addome,
      soprailiacaMm: measurement.sitesMm.soprailiaca,
      sottoscapolareMm: measurement.sitesMm.sottoscapolare,
      ascellareMm: measurement.sitesMm.ascellare,
      pettoraleMm: measurement.sitesMm.pettorale,
      cosciaMm: measurement.sitesMm.coscia,
      braccioCm: null,
      toraceCm: null,
      vitaCm: null,
      fianchiCm: null,
      cosciaCm: null,
      polpaccioCm: null,
      colloCm: null,
    }));

  const circumferenceRows: NutritionReportRow[] =
    healthData.circumferences.measurements.map((measurement) => ({
      categoria: "Circonferenze",
      date: measurement.date ?? "",
      numeroMisurazione: measurement.measurementNumber,
      pesoKg: null,
      bodyFatPct: measurement.bodyFatPctFromCircumferences,
      mediaPlicheMm: null,
      tricipiteMm: null,
      addomeMm: null,
      soprailiacaMm: null,
      sottoscapolareMm: null,
      ascellareMm: null,
      pettoraleMm: null,
      cosciaMm: null,
      braccioCm: measurement.sitesCm.braccio,
      toraceCm: measurement.sitesCm.torace,
      vitaCm: measurement.sitesCm.vita,
      fianchiCm: measurement.sitesCm.fianchi,
      cosciaCm: measurement.sitesCm.coscia,
      polpaccioCm: measurement.sitesCm.polpaccio,
      colloCm: measurement.sitesCm.collo,
    }));

  return [...skinfoldRows, ...circumferenceRows];
};
