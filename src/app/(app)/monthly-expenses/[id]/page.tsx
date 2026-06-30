import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { updateLine } from "@/lib/actions";
import { ChevronDown } from "lucide-react";

function formatCurrency(value: number) {
  return `${value.toLocaleString("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MT`;
}

export default async function MonthlyExpenseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const expense = await prisma.monthlyExpense.findUnique({
    where: { id },
    include: { monthlyExpenseLines: true },
  });

  if (!expense) return <div className="rounded-2xl bg-white p-6">Mês não encontrado.</div>;

  const linesByCategory = expense.monthlyExpenseLines.reduce<Record<string, typeof expense.monthlyExpenseLines>>((acc, line) => {
    const key = line.categoryNameSnapshot;
    acc[key] = acc[key] || [];
    acc[key].push(line);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{expense.month}/{expense.year}</h2>
            <p className="mt-2 text-sm text-slate-600">Estado: {expense.status}</p>
            <div className="mt-4 text-lg font-semibold text-slate-900">Total: {formatCurrency(expense.totalAmount)}</div>
          </div>
          <Link href={`/lista-compras/${expense.id}`} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium">Gerar lista de compras</Link>
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(linesByCategory).map(([category, lines]) => {
          const categoryTotal = lines.reduce((sum, line) => sum + (line.status === "confirmed" ? line.totalPrice : 0), 0);
          return (
            <div key={category} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">{category}</h3>
                  <p className="text-sm text-slate-500">Total confirmado: {formatCurrency(categoryTotal)}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500"><ChevronDown className="h-4 w-4" /> Expandir</div>
              </div>
              <div className="mt-4 space-y-3">
                {lines.map((line) => (
                  <div key={line.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900">{line.itemNameSnapshot}</p>
                        <p className="text-sm text-slate-500">Qtd: {line.quantity} · Preço: {formatCurrency(line.unitPrice)} · Total: {formatCurrency(line.totalPrice)}</p>
                        {line.priceDifferencePercent !== null && line.priceDifferencePercent !== undefined ? <p className="text-sm text-slate-500">Variação: {line.priceDifferencePercent.toFixed(1)}%</p> : null}
                      </div>
                      <div className="flex gap-2">
                        <form action={async () => { 'use server'; await updateLine(line.id, { status: 'confirmed' }); }}>
                          <button className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">Confirmar</button>
                        </form>
                        <form action={async () => { 'use server'; await updateLine(line.id, { status: 'removed' }); }}>
                          <button className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-600">Remover</button>
                        </form>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      <form action={async (formData: FormData) => { 'use server'; const quantity = Number(formData.get('quantity')); await updateLine(line.id, { quantity }); }} className="flex gap-2">
                        <input name="quantity" type="number" defaultValue={line.quantity} className="w-24 rounded-lg border border-slate-300 px-2 py-2" />
                        <button className="rounded-lg border border-slate-300 px-3 py-2 text-sm">Qtd</button>
                      </form>
                      <form action={async (formData: FormData) => { 'use server'; const unitPrice = Number(formData.get('unitPrice')); await updateLine(line.id, { unitPrice }); }} className="flex gap-2">
                        <input name="unitPrice" type="number" step="0.01" defaultValue={line.unitPrice} className="w-28 rounded-lg border border-slate-300 px-2 py-2" />
                        <button className="rounded-lg border border-slate-300 px-3 py-2 text-sm">Preço</button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
