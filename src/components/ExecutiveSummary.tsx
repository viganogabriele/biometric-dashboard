import { Activity, Dna, Expand, Scale, Waves } from "lucide-react";
import type { HealthData } from "../types";
import { formatDate, formatMetric } from "../utils/format";
import { deltaFromPrevious, getLatestAndPrevious } from "../utils/metrics";
import { DeltaPill } from "./common/DeltaPill";
import { Panel } from "./common/Panel";

interface ExecutiveSummaryProps {
  healthData: HealthData;
}

export const ExecutiveSummary = ({ healthData }: ExecutiveSummaryProps) => {
  const { latest: biaLatest, previous: biaPrevious } = getLatestAndPrevious(
    healthData.bia.measurements,
  );
  const { latest: skinLatest, previous: skinPrevious } = getLatestAndPrevious(
    healthData.skinfolds.measurements,
  );
  const { latest: circLatest, previous: circPrevious } = getLatestAndPrevious(
    healthData.circumferences.measurements,
  );

  if (!biaLatest || !skinLatest || !circLatest) {
    return null;
  }

  const biaBodyFatDelta = deltaFromPrevious(
    biaLatest.metrics.bodyFatPct,
    biaPrevious?.metrics.bodyFatPct,
  );

  const skinBodyFatDelta = deltaFromPrevious(
    skinLatest.bodyFatPctFromSkinfold,
    skinPrevious?.bodyFatPctFromSkinfold,
  );

  const comparisonDelta =
    biaLatest.metrics.bodyFatPct - skinLatest.bodyFatPctFromSkinfold;

  return (
    <div className="grid gap-4">
      <Panel
        title="Ultimi Risultati"
        subtitle="Date asincrone gestite automaticamente: ogni card mostra il dato piu recente per la sua categoria."
        icon={Activity}
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <article className="rounded-xl border border-slate-700/60 bg-gradient-to-br from-slate-900 to-slate-800/80 p-4">
            <header className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-cyan-200">
                <Scale className="h-4 w-4" />
                BIA
              </h3>
              <span className="text-xs text-slate-400">
                {biaLatest.date
                  ? formatDate(biaLatest.date)
                  : biaLatest.dateLabel}
              </span>
            </header>
            <div className="space-y-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Massa grassa
                </p>
                <p className="mt-1 text-2xl font-display font-semibold text-slate-100">
                  {formatMetric(biaLatest.metrics.bodyFatPct, "%", 2)}
                </p>
              </div>
              <DeltaPill
                delta={biaBodyFatDelta}
                unit=" %"
                positiveIsGood={false}
              />
              <p className="text-xs text-slate-400">
                Peso: {formatMetric(biaLatest.metrics.weightKg, "kg", 1)}
              </p>
            </div>
          </article>

          <article className="rounded-xl border border-slate-700/60 bg-gradient-to-br from-slate-900 to-slate-800/80 p-4">
            <header className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-cyan-200">
                <Dna className="h-4 w-4" />
                Pliche
              </h3>
              <span className="text-xs text-slate-400">
                {formatDate(skinLatest.date)}
              </span>
            </header>
            <div className="space-y-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Massa grassa
                </p>
                <p className="mt-1 text-2xl font-display font-semibold text-slate-100">
                  {formatMetric(skinLatest.bodyFatPctFromSkinfold, "%", 2)}
                </p>
              </div>
              <DeltaPill
                delta={skinBodyFatDelta}
                unit=" %"
                positiveIsGood={false}
              />
              <p className="text-xs text-slate-400">
                Media pliche: {formatMetric(skinLatest.averageMm, "mm", 2)}
              </p>
            </div>
          </article>

          <article className="rounded-xl border border-slate-700/60 bg-gradient-to-br from-slate-900 to-slate-800/80 p-4">
            <header className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-cyan-200">
                <Expand className="h-4 w-4" />
                Circonferenze
              </h3>
              <span className="text-xs text-slate-400">
                {formatDate(circLatest.date)}
              </span>
            </header>
            <div className="space-y-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Massa grassa
                </p>
                <p className="mt-1 text-2xl font-display font-semibold text-slate-100">
                  {formatMetric(
                    circLatest.bodyFatPctFromCircumferences,
                    "%",
                    2,
                  )}
                </p>
              </div>
              <DeltaPill
                delta={deltaFromPrevious(
                  circLatest.bodyFatPctFromCircumferences,
                  circPrevious?.bodyFatPctFromCircumferences,
                )}
                unit=" %"
                positiveIsGood={false}
              />
              <p className="text-xs text-slate-400">
                Vita: {formatMetric(circLatest.sitesCm.vita, "cm", 1)}
              </p>
            </div>
          </article>
        </div>
      </Panel>

      <Panel
        title="Confronto Diretto"
        subtitle="BIA vs Pliche nello stesso punto: confronto rapido dei valori attuali."
        icon={Waves}
      >
        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-slate-700/60 bg-slate-900/70 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Massa grassa BIA
            </p>
            <p className="mt-1 text-2xl font-display font-semibold text-cyan-200">
              {formatMetric(biaLatest.metrics.bodyFatPct, "%", 2)}
            </p>
          </article>
          <article className="rounded-xl border border-slate-700/60 bg-slate-900/70 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Massa grassa Pliche
            </p>
            <p className="mt-1 text-2xl font-display font-semibold text-cyan-200">
              {formatMetric(skinLatest.bodyFatPctFromSkinfold, "%", 2)}
            </p>
          </article>
          <article className="rounded-xl border border-slate-700/60 bg-slate-900/70 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Differenza (BIA - Pliche)
            </p>
            <p className="mt-1 text-2xl font-display font-semibold text-slate-100">
              {formatMetric(comparisonDelta, "%", 2)}
            </p>
          </article>
        </div>
      </Panel>
    </div>
  );
};
