interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
}

export function KpiCard({ title, value, subtitle, trend = "neutral" }: KpiCardProps) {
  const trendColor =
    trend === "up"
      ? "text-emerald-400"
      : trend === "down"
      ? "text-rose-400"
      : "text-slate-400";

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-slate-950/85 p-4 shadow-[0_14px_40px_rgba(15,23,42,0.95)]">
      <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
        {title}
      </div>
      <div className="mt-2 text-2xl font-semibold text-slate-50">{value}</div>
      {subtitle && (
        <div className={`mt-1 text-[11px] ${trendColor}`}>{subtitle}</div>
      )}
    </div>
  );
}
