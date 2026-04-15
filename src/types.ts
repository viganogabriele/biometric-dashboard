export type MeasurementDate = string | null;

export interface FormulaDefinition {
  id: string;
  title: string;
  description: string;
  expression: string;
  excelReference: string;
  variables: string[];
}

export interface BIAMetrics {
  weightKg: number;
  bodyFatPct: number;
  ecwKg: number;
  icwKg: number;
  bmrKcal: number;
  tbwKg: number;
  bmi: number;
  phaseAngleDeg: number;
  visceralFatLevel: number;
}

export interface BIARecordedMetric {
  label: string;
  value: number;
  unit: string;
}

export interface BIAMeasurement {
  id: string;
  date: MeasurementDate;
  dateLabel?: string;
  metrics: BIAMetrics;
  rawMetrics: BIARecordedMetric[];
}

export interface SkinfoldSites {
  tricipite: number;
  addome: number;
  soprailiaca: number;
  sottoscapolare: number;
  ascellare: number;
  pettorale: number;
  coscia: number;
}

export interface SkinfoldMeasurement {
  id: string;
  measurementNumber: number;
  date: MeasurementDate;
  weightKg: number;
  ageUsedInFormula: number;
  sitesMm: SkinfoldSites;
  sumMm: number;
  averageMm: number;
  bodyDensity: number;
  bodyFatPctFromSkinfold: number;
}

export interface CircumferenceSites {
  braccio: number;
  torace: number;
  vita: number;
  fianchi: number;
  coscia: number;
  polpaccio: number;
  collo: number;
}

export interface CircumferenceMeasurement {
  id: string;
  measurementNumber: number;
  date: MeasurementDate;
  sitesCm: CircumferenceSites;
  bodyFatPctFromCircumferences: number;
}

export interface HealthData {
  profile: {
    patientName: string;
    ageYears: number;
    birthDate?: string;
    sex: "male" | "female";
    heightCm: number;
  };
  sources: {
    bia: string;
    anthropometry: string;
  };
  formulas: {
    bodyDensityFromSkinfolds: FormulaDefinition;
    bodyFatFromDensity: FormulaDefinition;
    bodyFatFromCircumferences: FormulaDefinition;
  };
  bia: {
    measurements: BIAMeasurement[];
  };
  skinfolds: {
    measurements: SkinfoldMeasurement[];
  };
  circumferences: {
    measurements: CircumferenceMeasurement[];
  };
}
