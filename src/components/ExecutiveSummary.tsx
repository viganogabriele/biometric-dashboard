import { Activity, Dna, Expand, Scale, Waves } from "lucide-react";
import type { Locale } from "../i18n";
import { useI18n } from "../i18n";
import type { HealthData } from "../types";
import { formatDate, formatMetric } from "../utils/format";
import { deltaFromPrevious, getLatestAndPrevious } from "../utils/metrics";
import { DeltaPill } from "./common/DeltaPill";
import { Panel } from "./common/Panel";

interface ExecutiveSummaryProps {
  healthData: HealthData;
  locale: Locale;
}

export const ExecutiveSummary = ({
  healthData,
  locale,
}: ExecutiveSummaryProps) => {
  const { m } = useI18n();
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
        title={m.latestResults}
        subtitle={m.latestResultsSubtitle}
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
                  ? formatDate(
                      biaLatest.date,
                      m.dateUnavailable,
                      locale === "it" ? "it-IT" : "en-GB",
                    )
                  : biaLatest.dateLabel}
              </span>
            </header>
            <div className="space-y-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  {m.bodyFat}
                </p>
                <p className="mt-1 text-2xl font-display font-semibold text-slate-100">
                  {formatMetric(
                    biaLatest.metrics.bodyFatPct,
                    "%",
                    2,
                    locale === "it" ? "it-IT" : "en-US",
                  )}
                </p>
              </div>
              <DeltaPill
                delta={biaBodyFatDelta}
                unit=" %"
                positiveIsGood={false}
              />
              <p className="text-xs text-slate-400">
                {m.weight}:{" "}
                {formatMetric(
                  biaLatest.metrics.weightKg,
                  "kg",
                  1,
                  locale === "it" ? "it-IT" : "en-US",
                )}
              </p>
            </div>
          </article>

          <article className="rounded-xl border border-slate-700/60 bg-gradient-to-br from-slate-900 to-slate-800/80 p-4">
            <header className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-cyan-200">
                <Dna className="h-4 w-4" />
                {m.skinfolds}
              </h3>
              <span className="text-xs text-slate-400">
                {formatDate(
                  skinLatest.date,
                  m.dateUnavailable,
                  locale === "it" ? "it-IT" : "en-GB",
                )}
              </span>
            </header>
            <div className="space-y-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  {m.bodyFat}
                </p>
                <p className="mt-1 text-2xl font-display font-semibold text-slate-100">
                  {formatMetric(
                    skinLatest.bodyFatPctFromSkinfold,
                    "%",
                    2,
                    locale === "it" ? "it-IT" : "en-US",
                  )}
                </p>
              </div>
              <DeltaPill
                delta={skinBodyFatDelta}
                unit=" %"
                positiveIsGood={false}
              />
              <p className="text-xs text-slate-400">
                {m.averageSkinfold}:{" "}
                {formatMetric(
                  skinLatest.averageMm,
                  "mm",
                  2,
                  locale === "it" ? "it-IT" : "en-US",
                )}
              </p>
            </div>
          </article>

          <article className="rounded-xl border border-slate-700/60 bg-gradient-to-br from-slate-900 to-slate-800/80 p-4">
            <header className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-cyan-200">
                <Expand className="h-4 w-4" />
                {m.circumferences}
              </h3>
              <span className="text-xs text-slate-400">
                {formatDate(
                  circLatest.date,
                  m.dateUnavailable,
                  locale === "it" ? "it-IT" : "en-GB",
                )}
              </span>
            </header>
            <div className="space-y-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  {m.bodyFat}
                </p>
                <p className="mt-1 text-2xl font-display font-semibold text-slate-100">
                  {formatMetric(
                    circLatest.bodyFatPctFromCircumferences,
                    "%",
                    2,
                    locale === "it" ? "it-IT" : "en-US",
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
                {m.waist}:{" "}
                {formatMetric(
                  circLatest.sitesCm.vita,
                  "cm",
                  1,
                  locale === "it" ? "it-IT" : "en-US",
                )}
              </p>
            </div>
          </article>
        </div>
      </Panel>

      <Panel
        title={m.directComparison}
        subtitle={m.directComparisonSubtitle}
        icon={Waves}
      >
        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-slate-700/60 bg-slate-900/70 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              {m.biaBodyFat}
            </p>
            <p className="mt-1 text-2xl font-display font-semibold text-cyan-200">
              {formatMetric(
                biaLatest.metrics.bodyFatPct,
                "%",
                2,
                locale === "it" ? "it-IT" : "en-US",
              )}
            </p>
          </article>
          <article className="rounded-xl border border-slate-700/60 bg-slate-900/70 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              {m.skinfoldBodyFat}
            </p>
            <p className="mt-1 text-2xl font-display font-semibold text-cyan-200">
              {formatMetric(
                skinLatest.bodyFatPctFromSkinfold,
                "%",
                2,
                locale === "it" ? "it-IT" : "en-US",
              )}
            </p>
          </article>
          <article className="rounded-xl border border-slate-700/60 bg-slate-900/70 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              {m.differenceBiaSkinfold}
            </p>
            <p className="mt-1 text-2xl font-display font-semibold text-slate-100">
              {formatMetric(
                comparisonDelta,
                "%",
                2,
                locale === "it" ? "it-IT" : "en-US",
              )}
            </p>
          </article>
        </div>
      </Panel>
    </div>
  );
};
