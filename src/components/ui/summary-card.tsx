import { formatCurrency } from "@/lib/finance-utils";

export function SummaryCard({ title, value, tone = "default" }: { title: string; value: number; tone?: "default" | "positive" | "negative" }) {
  const toneClasses = {
    default: "bg-white text-slate-900",
    positive: "bg-emerald-50 text-emerald-700",
    negative: "bg-rose-50 text-rose-700",
  }[tone];

  return (
    <div className={`rounded-2xl border border-slate-200 p-4 shadow-sm ${toneClasses}`}>
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-3 text-2xl font-semibold">{formatCurrency(value)}</p>
    </div>
  );
}
