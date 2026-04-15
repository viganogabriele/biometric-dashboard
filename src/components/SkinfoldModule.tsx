import { Dna } from "lucide-react";
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
import { getSiteLabel, type Locale, useI18n } from "../i18n";
import type { HealthData } from "../types";
import { formatDate, formatMetric } from "../utils/format";
import { Panel } from "./common/Panel";

interface SkinfoldModuleProps {
  healthData: HealthData;
  locale: Locale;
}

const SITE_KEYS = [
  { key: "tricipite", label: "Tricipite", color: "#22d3ee" },
  { key: "addome", label: "Addome", color: "#f97316" },
  { key: "soprailiaca", label: "Soprailiaca", color: "#facc15" },
  { key: "sottoscapolare", label: "Sottoscapolare", color: "#4ade80" },
  { key: "ascellare", label: "Ascellare", color: "#c084fc" },
  { key: "pettorale", label: "Pettorale", color: "#fb7185" },
  { key: "coscia", label: "Coscia", color: "#60a5fa" },
] as const;

export const SkinfoldModule = ({ healthData, locale }: SkinfoldModuleProps) => {
  const { m } = useI18n();
  const numberLocale = locale === "it" ? "it-IT" : "en-US";
  const dateLocale = locale === "it" ? "it-IT" : "en-GB";

  const chartData = healthData.skinfolds.measurements.map(
    (measurement, index) => ({
      label: measurement.date
        ? formatDate(measurement.date, m.dateUnavailable, dateLocale)
        : `SF ${index + 1}`,
      ...measurement.sitesMm,
      averageMm: measurement.averageMm,
      bodyFatPct: measurement.bodyFatPctFromSkinfold,
    }),
  );

  return (
    <Panel title={m.skinfolds} subtitle={m.skinfoldsSubtitle} icon={Dna}>
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-3">
        <h3 className="mb-2 text-sm font-semibold text-slate-200">
          {m.primaryCharts}
        </h3>
        <div className="h-80 w-full">
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
                dataKey="averageMm"
                stroke="#22d3ee"
                strokeWidth={2}
                name={m.skinfoldAvgLegend}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="bodyFatPct"
                stroke="#fb7185"
                strokeWidth={2}
                name={m.bodyFatLegend}
              />
              {SITE_KEYS.map((site) => (
                <Line
                  key={site.key}
                  yAxisId="left"
                  type="monotone"
                  dataKey={site.key}
                  stroke={site.color}
                  strokeWidth={1.5}
                  name={`${getSiteLabel(locale, site.key)} (mm)`}
                />
              ))}
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
              <th className="px-3 py-2 text-left">{m.measurement}</th>
              <th className="px-3 py-2 text-left">{m.weight}</th>
              <th className="px-3 py-2 text-left">{m.averageSkinfold}</th>
              <th className="px-3 py-2 text-left">{m.bodyFatPct}</th>
              {SITE_KEYS.map((site) => (
                <th key={site.key} className="px-3 py-2 text-left">
                  {getSiteLabel(locale, site.key)} (mm)
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-100">
            {healthData.skinfolds.measurements.map((measurement) => (
              <tr key={`${measurement.id}-single`}>
                <td className="px-3 py-2 text-slate-300">
                  {formatDate(measurement.date, m.dateUnavailable, dateLocale)}
                </td>
                <td className="px-3 py-2">{measurement.measurementNumber}</td>
                <td className="px-3 py-2">
                  {formatMetric(measurement.weightKg, "kg", 1, numberLocale)}
                </td>
                <td className="px-3 py-2">
                  {formatMetric(measurement.averageMm, "mm", 2, numberLocale)}
                </td>
                <td className="px-3 py-2">
                  {formatMetric(
                    measurement.bodyFatPctFromSkinfold,
                    "%",
                    2,
                    numberLocale,
                  )}
                </td>
                {SITE_KEYS.map((site) => (
                  <td key={site.key} className="px-3 py-2">
                    {formatMetric(
                      measurement.sitesMm[site.key],
                      "",
                      1,
                      numberLocale,
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
};
