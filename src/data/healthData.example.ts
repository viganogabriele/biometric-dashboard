import type { HealthData } from "../types";

// Safe example dataset for public repositories.
export const HEALTH_DATA: HealthData = {
  profile: {
    patientName: "Sample Patient",
    ageYears: 30,
    sex: "male",
    heightCm: 175,
  },
  sources: {
    bia: "data/bia.example.csv",
    anthropometry: "data/excel.example.json",
  },
  formulas: {
    bodyDensityFromSkinfolds: {
      id: "jackson-pollock-7-men",
      title: "Body Density from 7 Skinfolds (Men)",
      description: "Example formula metadata.",
      expression:
        "density = 1.112 - (0.00043499 * sum7) + (0.00000055 * sum7^2) - (0.00028826 * age)",
      excelReference: "N5, N6",
      variables: ["sum7 (G:M)", "age"],
    },
    bodyFatFromDensity: {
      id: "siri-equation",
      title: "Body Fat % from Body Density",
      description: "Example formula metadata.",
      expression: "bodyFatPct = (495 / density) - 450",
      excelReference: "O5, O6",
      variables: ["density"],
    },
    bodyFatFromCircumferences: {
      id: "us-navy-circumference-men",
      title: "Body Fat % from Circumferences (Men)",
      description: "Example formula metadata.",
      expression:
        "bodyFatPct = (495 / (1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height))) - 450",
      excelReference: "W5, W6",
      variables: ["waist", "neck", "height"],
    },
  },
  bia: {
    measurements: [
      {
        id: "bia-sample-1",
        date: "2026-01-15",
        metrics: {
          weightKg: 75,
          bodyFatPct: 17.5,
          ecwKg: 17,
          icwKg: 28,
          bmrKcal: 1700,
          tbwKg: 45,
          bmi: 24.5,
          phaseAngleDeg: 7,
          visceralFatLevel: 6,
        },
        rawMetrics: [
          { label: "Peso", value: 75, unit: "kg" },
          { label: "Body Fat", value: 17.5, unit: "%" },
        ],
      },
    ],
  },
  skinfolds: {
    measurements: [
      {
        id: "sf-sample-1",
        measurementNumber: 1,
        date: "2026-01-15",
        weightKg: 75,
        ageUsedInFormula: 30,
        sitesMm: {
          tricipite: 12,
          addome: 18,
          soprailiaca: 11,
          sottoscapolare: 10,
          ascellare: 9,
          pettorale: 7,
          coscia: 16,
        },
        sumMm: 83,
        averageMm: 11.86,
        bodyDensity: 1.07,
        bodyFatPctFromSkinfold: 12.6,
      },
    ],
  },
  circumferences: {
    measurements: [
      {
        id: "cf-sample-1",
        measurementNumber: 1,
        date: "2026-01-15",
        sitesCm: {
          braccio: 33,
          torace: 95,
          vita: 80,
          fianchi: 94,
          coscia: 60,
          polpaccio: 39,
          collo: 37,
        },
        bodyFatPctFromCircumferences: 14.2,
      },
    ],
  },
};
