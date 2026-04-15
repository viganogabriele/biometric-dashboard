import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { formatNumber } from "../../utils/format";

interface DeltaPillProps {
  delta: number | null;
  unit?: string;
  positiveIsGood?: boolean;
}

export const DeltaPill = ({
  delta,
  unit = "",
  positiveIsGood = true,
}: DeltaPillProps) => {
  if (delta === null) {
    return (
      <span className="inline-flex items-center rounded-full border border-slate-600 bg-slate-800/70 px-2.5 py-1 text-xs text-slate-300">
        Delta N/A
      </span>
    );
  }

  const absValue = Math.abs(delta);
  const neutral = absValue < 0.0001;
  const positive = delta > 0;
  const isGood = neutral ? true : positiveIsGood ? positive : !positive;

  const Icon = neutral ? ArrowRight : positive ? ArrowUpRight : ArrowDownRight;

  const palette = neutral
    ? "border-slate-500/60 bg-slate-800/60 text-slate-300"
    : isGood
      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
      : "border-rose-500/40 bg-rose-500/10 text-rose-300";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs ${palette}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {`Delta ${delta >= 0 ? "+" : ""}${formatNumber(delta, 2)}${unit}`}
    </span>
  );
};
