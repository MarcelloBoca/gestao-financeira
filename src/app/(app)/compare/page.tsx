import { prisma } from "@/lib/prisma";

function formatCurrency(value: number) {
  return `${value.toLocaleString("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MT`;
}

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ monthA?: string; monthB?: string }> }) {
  const params = await searchParams;
  const monthA = params.monthA || "2026-06";
  const monthB = params.monthB || "2025-12";
  const [yearA, monthNumA] = monthA.split("-").map(Number);
  const [yearB, monthNumB] = monthB.split("-").map(Number);

  const user = await prisma.user.findFirst();
  const monthAExpense = user ? await prisma.monthlyExpense.findFirst({ where: { userId: user.id, year: yearA, month: monthNumA }, include: { monthlyExpenseLines: true } }) : null;
  const monthBExpense = user ? await prisma.monthlyExpense.findFirst({ where: { userId: user.id, year: yearB, month: monthNumB }, include: { monthlyExpenseLines: true } }) : null;

  const linesA = monthAExpense?.monthlyExpenseLines.filter((line) => line.status === "confirmed") || [];
  const linesB = monthBExpense?.monthlyExpenseLines.filter((line) => line.status === "confirmed") || [];
  const totalA = linesA.reduce((sum, line) => sum + line.totalPrice, 0);
  const totalB = linesB.reduce((sum, line) => sum + line.totalPrice, 0);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Comparação entre meses</h2>
        <form className="mt-4 grid gap-3 md:grid-cols-2">
          <input name="monthA" defaultValue={monthA} className="rounded-xl border border-slate-300 px-3 py-2" />
          <input name="monthB" defaultValue={monthB} className="rounded-xl border border-slate-300 px-3 py-2" />
          <button className="md:col-span-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Comparar</button>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold">{monthA}</h3>
          <p className="mt-2 text-sm text-slate-500">Total: {formatCurrency(totalA)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold">{monthB}</h3>
          <p className="mt-2 text-sm text-slate-500">Total: {formatCurrency(totalB)}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold">Resumo</h3>
        <div className="mt-4 space-y-2 text-sm text-slate-600">
          <p>Diferença total: {formatCurrency(totalA - totalB)}</p>
          <p>Percentagem: {(((totalA - totalB) / Math.max(totalB, 1)) * 100).toFixed(1)}%</p>
          <p>{(totalA - totalB) >= 0 ? "O gasto aumentou neste período." : "O gasto reduziu neste período."}</p>
        </div>
      </div>
    </div>
  );
}
