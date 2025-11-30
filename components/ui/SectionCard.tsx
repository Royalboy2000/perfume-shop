interface SectionCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  actionSlot?: React.ReactNode;
}

export function SectionCard({
  title,
  description,
  children,
  actionSlot
}: SectionCardProps) {
  return (
    <section className="rounded-2xl border border-slate-800/80 bg-slate-950/85 p-4 shadow-[0_14px_40px_rgba(15,23,42,0.95)]">
      <header className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-50">{title}</h2>
          {description && (
            <p className="mt-0.5 text-xs text-slate-400">{description}</p>
          )}
        </div>
        {actionSlot && <div className="shrink-0">{actionSlot}</div>}
      </header>
      <div>{children}</div>
    </section>
  );
}
