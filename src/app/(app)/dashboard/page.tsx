import { getDashboardData } from "@/lib/actions";
import { SummaryCard } from "@/components/ui/summary-card";
import { buildMonthLabel } from "@/lib/finance-utils";
import Link from "next/link";

export default async function DashboardPage() {
  const data = await getDashboardData();

  if (!data) {
    return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-slate-600">Ainda não existem dados. Crie categorias e um mês para começar.</div>;
  }

  const percentLabel = data.percent >= 0 ? `+${data.percent.toFixed(1)}%` : `${data.percent.toFixed(1)}%`;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard title="Despesas do mês atual" value={data.currentTotal} />
        <SummaryCard title="Mês anterior" value={data.previousTotal} />
        <SummaryCard title="Diferença" value={data.difference} tone={data.difference >= 0 ? "negative" : "positive"} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Resumo rápido</h2>
          <Link className="text-sm font-medium text-emerald-700" href="/monthly-expenses">Ver meses</Link>
        </div>
        <p className="mt-3 text-sm text-slate-600">{data.currentExpense ? `O mês atual está em ${buildMonthLabel(data.currentExpense.month, data.currentExpense.year)} com ${data.currentExpense.monthlyExpenseLines.filter((line) => line.status === "confirmed").length} itens confirmados.` : "Ainda não existe um mês atual registado."}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {data.currentExpense ? (
            <Link href={`/monthly-expenses/${data.currentExpense.id}`} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">Abrir detalhes do mês</Link>
          ) : null}
          <Link href="/advisor" className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white">Ver recomendações</Link>
        </div>
      </div>
    </div>
  );
}
