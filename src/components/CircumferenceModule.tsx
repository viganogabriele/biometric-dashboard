import { Ruler } from "lucide-react";
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

interface CircumferenceModuleProps {
  healthData: HealthData;
  locale: Locale;
}

const CIRC_KEYS = [
  { key: "braccio", label: "Braccio", color: "#22d3ee" },
  { key: "torace", label: "Torace", color: "#60a5fa" },
  { key: "vita", label: "Vita", color: "#f97316" },
  { key: "fianchi", label: "Fianchi", color: "#a78bfa" },
  { key: "coscia", label: "Coscia", color: "#4ade80" },
  { key: "polpaccio", label: "Polpaccio", color: "#facc15" },
  { key: "collo", label: "Collo", color: "#fb7185" },
] as const;

export const CircumferenceModule = ({
  healthData,
  locale,
}: CircumferenceModuleProps) => {
  const { m } = useI18n();
  const numberLocale = locale === "it" ? "it-IT" : "en-US";
  const dateLocale = locale === "it" ? "it-IT" : "en-GB";

  const chartData = healthData.circumferences.measurements.map(
    (measurement, index) => ({
      label: measurement.date
        ? formatDate(measurement.date, m.dateUnavailable, dateLocale)
        : `CF ${index + 1}`,
      ...measurement.sitesCm,
      bodyFatPct: measurement.bodyFatPctFromCircumferences,
    }),
  );

  return (
    <Panel
      title={m.circumferences}
      subtitle={m.circumferencesSubtitle}
      icon={Ruler}
    >
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
              {CIRC_KEYS.map((site) => (
                <Line
                  key={site.key}
                  yAxisId="left"
                  type="monotone"
                  dataKey={site.key}
                  stroke={site.color}
                  strokeWidth={2}
                  name={`${getSiteLabel(locale, site.key)} (cm)`}
                />
              ))}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="bodyFatPct"
                stroke="#fb7185"
                strokeWidth={2}
                name={m.bodyFatLegend}
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
              <th className="px-3 py-2 text-left">{m.measurement}</th>
              {CIRC_KEYS.map((site) => (
                <th key={site.key} className="px-3 py-2 text-left">
                  {getSiteLabel(locale, site.key)}
                </th>
              ))}
              <th className="px-3 py-2 text-left">{m.bodyFatPct}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-100">
            {healthData.circumferences.measurements.map((measurement) => (
              <tr key={measurement.id}>
                <td className="px-3 py-2 text-slate-300">
                  {formatDate(measurement.date, m.dateUnavailable, dateLocale)}
                </td>
                <td className="px-3 py-2">{measurement.measurementNumber}</td>
                {CIRC_KEYS.map((site) => (
                  <td key={site.key} className="px-3 py-2">
                    {formatMetric(
                      measurement.sitesCm[site.key],
                      "cm",
                      1,
                      numberLocale,
                    )}
                  </td>
                ))}
                <td className="px-3 py-2">
                  {formatMetric(
                    measurement.bodyFatPctFromCircumferences,
                    "%",
                    2,
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
