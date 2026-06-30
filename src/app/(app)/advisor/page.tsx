import { prisma } from "@/lib/prisma";
import { financialAdvisorService } from "@/lib/financial-advisor";

export default async function AdvisorPage() {
  const user = await prisma.user.findFirst();
  if (!user) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-6">Crie primeiro um mês e despesas para ver o agente financeiro.</div>;
  }

  const latestExpense = await prisma.monthlyExpense.findFirst({ where: { userId: user.id }, orderBy: [{ year: "desc" }, { month: "desc" }], include: { monthlyExpenseLines: true } });
  const advice = financialAdvisorService(latestExpense?.monthlyExpenseLines || []);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Agente financeiro</h2>
        <p className="mt-2 text-sm text-slate-600">Análise local baseada em regras para destacar riscos, cortes e oportunidades de poupança.</p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Resumo</h3>
        <p className="mt-2 text-sm text-slate-600">{advice.summary}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">Alertas</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">{advice.alerts.map((alert) => <li key={alert}>• {alert}</li>)}</ul>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">Recomendações</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">{advice.recommendations.map((recommendation) => <li key={recommendation}>• {recommendation}</li>)}</ul>
        </div>
      </div>
    </div>
  );
}
