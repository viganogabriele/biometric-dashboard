import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface PanelProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  rightSlot?: ReactNode;
  className?: string;
  children: ReactNode;
}

export const Panel = ({
  title,
  subtitle,
  icon: Icon,
  rightSlot,
  className,
  children,
}: PanelProps) => {
  return (
    <section
      className={`print-surface rounded-2xl border border-slate-700/60 bg-surface-900/85 shadow-panel backdrop-blur ${className ?? ""}`}
    >
      <header className="flex items-start justify-between gap-4 border-b border-slate-700/50 px-5 py-4">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-slate-100">
            {Icon ? <Icon className="h-5 w-5 text-cyan-300" /> : null}
            <span className="truncate">{title}</span>
          </h2>
          {subtitle ? (
            <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
          ) : null}
        </div>
        {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
};
