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
import type { HealthData } from "../types";
import { formatDate, formatMetric } from "../utils/format";
import { Panel } from "./common/Panel";

interface SkinfoldModuleProps {
  healthData: HealthData;
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

export const SkinfoldModule = ({ healthData }: SkinfoldModuleProps) => {
  const chartData = healthData.skinfolds.measurements.map(
    (measurement, index) => ({
      label: measurement.date
        ? formatDate(measurement.date)
        : `SF ${index + 1}`,
      ...measurement.sitesMm,
      averageMm: measurement.averageMm,
      bodyFatPct: measurement.bodyFatPctFromSkinfold,
    }),
  );

  return (
    <Panel
      title="Pliche"
      subtitle="Grafico andamento + dati singoli delle pliche."
      icon={Dna}
    >
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-3">
        <h3 className="mb-2 text-sm font-semibold text-slate-200">
          Grafici principali
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
                name="Media pliche (mm)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="bodyFatPct"
                stroke="#fb7185"
                strokeWidth={2}
                name="Massa grassa (%)"
              />
              {SITE_KEYS.map((site) => (
                <Line
                  key={site.key}
                  yAxisId="left"
                  type="monotone"
                  dataKey={site.key}
                  stroke={site.color}
                  strokeWidth={1.5}
                  name={`${site.label} (mm)`}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto rounded-xl border border-slate-700/50 bg-slate-900/60">
        <h3 className="px-3 pb-1 pt-3 text-sm font-semibold text-slate-200">
          Dati singoli
        </h3>
        <table className="min-w-full divide-y divide-slate-700 text-sm">
          <thead className="bg-slate-900/80 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-3 py-2 text-left">Data</th>
              <th className="px-3 py-2 text-left">Misura #</th>
              <th className="px-3 py-2 text-left">Peso</th>
              <th className="px-3 py-2 text-left">Media</th>
              <th className="px-3 py-2 text-left">Massa grassa %</th>
              {SITE_KEYS.map((site) => (
                <th key={site.key} className="px-3 py-2 text-left">
                  {site.label} (mm)
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-100">
            {healthData.skinfolds.measurements.map((measurement) => (
              <tr key={`${measurement.id}-single`}>
                <td className="px-3 py-2 text-slate-300">
                  {formatDate(measurement.date)}
                </td>
                <td className="px-3 py-2">{measurement.measurementNumber}</td>
                <td className="px-3 py-2">
                  {formatMetric(measurement.weightKg, "kg", 1)}
                </td>
                <td className="px-3 py-2">
                  {formatMetric(measurement.averageMm, "mm", 2)}
                </td>
                <td className="px-3 py-2">
                  {formatMetric(measurement.bodyFatPctFromSkinfold, "%", 2)}
                </td>
                {SITE_KEYS.map((site) => (
                  <td key={site.key} className="px-3 py-2">
                    {formatMetric(measurement.sitesMm[site.key], "", 1)}
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
