import { Printer } from "lucide-react";
import type { HealthData } from "../types";
import { formatDate, formatMetric } from "../utils/format";
import { deltaFromPrevious, getLatestAndPrevious } from "../utils/metrics";
import { DeltaPill } from "./common/DeltaPill";
import { Panel } from "./common/Panel";

interface NutritionistTableProps {
  healthData: HealthData;
}

interface DenseRow {
  category: "BIA" | "Pliche" | "Circonferenze";
  date: string;
  measurement: string;
  metric: string;
  value: number;
  unit: string;
  delta: number | null;
  positiveIsGood?: boolean;
}

const buildDenseRows = (healthData: HealthData): DenseRow[] => {
  const rows: DenseRow[] = [];

  const { latest: latestBia, previous: previousBia } = getLatestAndPrevious(
    healthData.bia.measurements,
  );
  if (latestBia) {
    rows.push(
      {
        category: "BIA",
        date: latestBia.date
          ? formatDate(latestBia.date)
          : (latestBia.dateLabel ?? "Data non disponibile"),
        measurement: latestBia.id,
        metric: "Peso",
        value: latestBia.metrics.weightKg,
        unit: "kg",
        delta: deltaFromPrevious(
          latestBia.metrics.weightKg,
          previousBia?.metrics.weightKg,
        ),
        positiveIsGood: false,
      },
      {
        category: "BIA",
        date: latestBia.date
          ? formatDate(latestBia.date)
          : (latestBia.dateLabel ?? "Data non disponibile"),
        measurement: latestBia.id,
        metric: "Massa grassa",
        value: latestBia.metrics.bodyFatPct,
        unit: "%",
        delta: deltaFromPrevious(
          latestBia.metrics.bodyFatPct,
          previousBia?.metrics.bodyFatPct,
        ),
        positiveIsGood: false,
      },
      {
        category: "BIA",
        date: latestBia.date
          ? formatDate(latestBia.date)
          : (latestBia.dateLabel ?? "Data non disponibile"),
        measurement: latestBia.id,
        metric: "ECW",
        value: latestBia.metrics.ecwKg,
        unit: "kg",
        delta: deltaFromPrevious(
          latestBia.metrics.ecwKg,
          previousBia?.metrics.ecwKg,
        ),
      },
      {
        category: "BIA",
        date: latestBia.date
          ? formatDate(latestBia.date)
          : (latestBia.dateLabel ?? "Data non disponibile"),
        measurement: latestBia.id,
        metric: "ICW",
        value: latestBia.metrics.icwKg,
        unit: "kg",
        delta: deltaFromPrevious(
          latestBia.metrics.icwKg,
          previousBia?.metrics.icwKg,
        ),
      },
      {
        category: "BIA",
        date: latestBia.date
          ? formatDate(latestBia.date)
          : (latestBia.dateLabel ?? "Data non disponibile"),
        measurement: latestBia.id,
        metric: "BMR",
        value: latestBia.metrics.bmrKcal,
        unit: "kcal",
        delta: deltaFromPrevious(
          latestBia.metrics.bmrKcal,
          previousBia?.metrics.bmrKcal,
        ),
      },
    );
  }

  const { latest: latestSkin, previous: previousSkin } = getLatestAndPrevious(
    healthData.skinfolds.measurements,
  );
  if (latestSkin) {
    rows.push(
      {
        category: "Pliche",
        date: formatDate(latestSkin.date),
        measurement: `#${latestSkin.measurementNumber}`,
        metric: "Massa grassa da pliche",
        value: latestSkin.bodyFatPctFromSkinfold,
        unit: "%",
        delta: deltaFromPrevious(
          latestSkin.bodyFatPctFromSkinfold,
          previousSkin?.bodyFatPctFromSkinfold,
        ),
        positiveIsGood: false,
      },
      {
        category: "Pliche",
        date: formatDate(latestSkin.date),
        measurement: `#${latestSkin.measurementNumber}`,
        metric: "Media pliche",
        value: latestSkin.averageMm,
        unit: "mm",
        delta: deltaFromPrevious(latestSkin.averageMm, previousSkin?.averageMm),
        positiveIsGood: false,
      },
      {
        category: "Pliche",
        date: formatDate(latestSkin.date),
        measurement: `#${latestSkin.measurementNumber}`,
        metric: "Densita corporea",
        value: latestSkin.bodyDensity,
        unit: "",
        delta: deltaFromPrevious(
          latestSkin.bodyDensity,
          previousSkin?.bodyDensity,
        ),
      },
    );
  }

  const { latest: latestCirc, previous: previousCirc } = getLatestAndPrevious(
    healthData.circumferences.measurements,
  );
  if (latestCirc) {
    rows.push(
      {
        category: "Circonferenze",
        date: formatDate(latestCirc.date),
        measurement: `#${latestCirc.measurementNumber}`,
        metric: "Massa grassa da circonferenze",
        value: latestCirc.bodyFatPctFromCircumferences,
        unit: "%",
        delta: deltaFromPrevious(
          latestCirc.bodyFatPctFromCircumferences,
          previousCirc?.bodyFatPctFromCircumferences,
        ),
        positiveIsGood: false,
      },
      {
        category: "Circonferenze",
        date: formatDate(latestCirc.date),
        measurement: `#${latestCirc.measurementNumber}`,
        metric: "Vita",
        value: latestCirc.sitesCm.vita,
        unit: "cm",
        delta: deltaFromPrevious(
          latestCirc.sitesCm.vita,
          previousCirc?.sitesCm.vita,
        ),
        positiveIsGood: false,
      },
      {
        category: "Circonferenze",
        date: formatDate(latestCirc.date),
        measurement: `#${latestCirc.measurementNumber}`,
        metric: "Collo",
        value: latestCirc.sitesCm.collo,
        unit: "cm",
        delta: deltaFromPrevious(
          latestCirc.sitesCm.collo,
          previousCirc?.sitesCm.collo,
        ),
      },
    );
  }

  return rows;
};

export const NutritionistTable = ({ healthData }: NutritionistTableProps) => {
  const rows = buildDenseRows(healthData);

  return (
    <Panel
      title="Modalita nutrizionista"
      subtitle="Vista compatta ottimizzata per stampa ed export PDF."
      rightSlot={
        <button
          type="button"
          onClick={() => window.print()}
          className="no-print inline-flex items-center gap-2 rounded-lg border border-cyan-700/60 bg-cyan-900/30 px-3 py-1.5 text-sm font-medium text-cyan-100 transition hover:bg-cyan-900/45"
        >
          <Printer className="h-4 w-4" />
          Stampa / Salva PDF
        </button>
      }
    >
      <div className="overflow-x-auto rounded-xl border border-slate-700/50">
        <table className="min-w-full divide-y divide-slate-700 text-sm">
          <thead className="bg-slate-900/80 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-3 py-2 text-left">Categoria</th>
              <th className="px-3 py-2 text-left">Data</th>
              <th className="px-3 py-2 text-left">Misurazione</th>
              <th className="px-3 py-2 text-left">Metrica</th>
              <th className="px-3 py-2 text-left">Valore</th>
              <th className="px-3 py-2 text-left">Delta vs precedente</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-100">
            {rows.map((row) => (
              <tr key={`${row.category}-${row.measurement}-${row.metric}`}>
                <td className="px-3 py-2 text-slate-300">{row.category}</td>
                <td className="px-3 py-2 text-slate-300">{row.date}</td>
                <td className="px-3 py-2 text-slate-300">{row.measurement}</td>
                <td className="px-3 py-2">{row.metric}</td>
                <td className="px-3 py-2">
                  {formatMetric(row.value, row.unit, 2)}
                </td>
                <td className="px-3 py-2">
                  <DeltaPill
                    delta={row.delta}
                    unit={row.unit ? ` ${row.unit}` : ""}
                    positiveIsGood={row.positiveIsGood}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid gap-3 text-xs text-slate-400 md:grid-cols-3">
        <article className="rounded-lg border border-slate-700/50 bg-slate-900/65 p-3">
          <p className="font-semibold text-slate-200">Densita da pliche</p>
          <p className="mt-1">
            {healthData.formulas.bodyDensityFromSkinfolds.expression}
          </p>
        </article>
        <article className="rounded-lg border border-slate-700/50 bg-slate-900/65 p-3">
          <p className="font-semibold text-slate-200">Massa grassa da densita</p>
          <p className="mt-1">
            {healthData.formulas.bodyFatFromDensity.expression}
          </p>
        </article>
        <article className="rounded-lg border border-slate-700/50 bg-slate-900/65 p-3">
          <p className="font-semibold text-slate-200">
            Massa grassa da circonferenze
          </p>
          <p className="mt-1">
            {healthData.formulas.bodyFatFromCircumferences.expression}
          </p>
        </article>
      </div>
    </Panel>
  );
};
