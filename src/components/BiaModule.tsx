import { ActivitySquare } from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Locale } from "../i18n";
import { useI18n } from "../i18n";
import type { HealthData } from "../types";
import { formatDate, formatMetric } from "../utils/format";
import { Panel } from "./common/Panel";

interface BiaModuleProps {
  healthData: HealthData;
  locale: Locale;
}

export const BiaModule = ({ healthData, locale }: BiaModuleProps) => {
  const { m } = useI18n();
  const numberLocale = locale === "it" ? "it-IT" : "en-US";
  const dateLocale = locale === "it" ? "it-IT" : "en-GB";

  const chartData = healthData.bia.measurements.map((measurement, index) => ({
    label: measurement.date
      ? formatDate(measurement.date, m.dateUnavailable, dateLocale)
      : `BIA ${index + 1}`,
    weightKg: measurement.metrics.weightKg,
    bodyFatPct: measurement.metrics.bodyFatPct,
    bmrKcal: measurement.metrics.bmrKcal,
    ecwKg: measurement.metrics.ecwKg,
    icwKg: measurement.metrics.icwKg,
    ratio: measurement.metrics.ecwKg / measurement.metrics.icwKg,
  }));

  const latest =
    healthData.bia.measurements[healthData.bia.measurements.length - 1];

  if (!latest) {
    return null;
  }

  return (
    <Panel title="BIA" subtitle={m.biaSubtitle} icon={ActivitySquare}>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-xl border border-slate-700/50 bg-slate-900/65 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            {m.weight}
          </p>
          <p className="mt-1 text-2xl font-display font-semibold text-cyan-200">
            {formatMetric(latest.metrics.weightKg, "kg", 1, numberLocale)}
          </p>
        </article>
        <article className="rounded-xl border border-slate-700/50 bg-slate-900/65 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            {m.bodyFat}
          </p>
          <p className="mt-1 text-2xl font-display font-semibold text-cyan-200">
            {formatMetric(latest.metrics.bodyFatPct, "%", 2, numberLocale)}
          </p>
        </article>
        <article className="rounded-xl border border-slate-700/50 bg-slate-900/65 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            ECW / ICW
          </p>
          <p className="mt-1 text-2xl font-display font-semibold text-cyan-200">
            {formatMetric(
              latest.metrics.ecwKg / latest.metrics.icwKg,
              "",
              3,
              numberLocale,
            )}
          </p>
        </article>
        <article className="rounded-xl border border-slate-700/50 bg-slate-900/65 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">BMR</p>
          <p className="mt-1 text-2xl font-display font-semibold text-cyan-200">
            {formatMetric(latest.metrics.bmrKcal, "kcal", 0, numberLocale)}
          </p>
        </article>
      </div>

      <div className="mt-5 rounded-xl border border-slate-700/50 bg-slate-900/60 p-3">
        <h3 className="mb-2 text-sm font-semibold text-slate-200">
          {m.primaryCharts}
        </h3>
        <div className="h-72 w-full">
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <YAxis yAxisId="left" tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: "12px",
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="weightKg"
                stroke="#22d3ee"
                strokeWidth={2}
                name="Peso (kg)"
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="bodyFatPct"
                stroke="#f59e0b"
                strokeWidth={2}
                name={m.bodyFatLegend}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="ecwKg"
                stroke="#4ade80"
                strokeWidth={2}
                name="ECW (kg)"
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="icwKg"
                stroke="#38bdf8"
                strokeWidth={2}
                name="ICW (kg)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="bmrKcal"
                stroke="#fb7185"
                strokeWidth={2}
                name="BMR (kcal)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto rounded-xl border border-slate-700/50 bg-slate-900/60">
        <h3 className="px-3 pb-1 pt-3 text-sm font-semibold text-slate-200">
          {m.singleData}
        </h3>
        <table className="min-w-full divide-y divide-slate-700 text-sm">
          <thead className="bg-slate-900/80 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-3 py-2 text-left">{m.date}</th>
              <th className="px-3 py-2 text-left">{m.weight}</th>
              <th className="px-3 py-2 text-left">{m.bodyFat}</th>
              <th className="px-3 py-2 text-left">ECW</th>
              <th className="px-3 py-2 text-left">ICW</th>
              <th className="px-3 py-2 text-left">BMR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-100">
            {healthData.bia.measurements.map((measurement) => (
              <tr key={measurement.id}>
                <td className="px-3 py-2 text-slate-300">
                  {measurement.date
                    ? formatDate(
                        measurement.date,
                        m.dateUnavailable,
                        dateLocale,
                      )
                    : measurement.dateLabel}
                </td>
                <td className="px-3 py-2">
                  {formatMetric(
                    measurement.metrics.weightKg,
                    "kg",
                    1,
                    numberLocale,
                  )}
                </td>
                <td className="px-3 py-2">
                  {formatMetric(
                    measurement.metrics.bodyFatPct,
                    "%",
                    2,
                    numberLocale,
                  )}
                </td>
                <td className="px-3 py-2">
                  {formatMetric(
                    measurement.metrics.ecwKg,
                    "kg",
                    2,
                    numberLocale,
                  )}
                </td>
                <td className="px-3 py-2">
                  {formatMetric(
                    measurement.metrics.icwKg,
                    "kg",
                    2,
                    numberLocale,
                  )}
                </td>
                <td className="px-3 py-2">
                  {formatMetric(
                    measurement.metrics.bmrKcal,
                    "kcal",
                    0,
                    numberLocale,
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
};
