export function StatCard({ title, value, description, tone = "default" }: { title: string; value: string; description?: string; tone?: "default" | "positive" | "negative" }) {
  const toneClass = {
    default: "bg-white text-slate-900",
    positive: "bg-emerald-50 text-emerald-700",
    negative: "bg-rose-50 text-rose-700",
  }[tone];

  return (
    <div className={`rounded-2xl border border-slate-200 p-4 shadow-sm ${toneClass}`}>
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-3 text-2xl font-semibold">{value}</p>
      {description ? <p className="mt-2 text-sm text-slate-500">{description}</p> : null}
    </div>
  );
}
