import { prisma } from "@/lib/prisma";
import { createMonthlyExpense } from "@/lib/actions";
import Link from "next/link";

async function getExpenses() {
  const user = await prisma.user.findFirst();
  if (!user) return [];
  return prisma.monthlyExpense.findMany({ where: { userId: user.id }, orderBy: [{ year: "desc" }, { month: "desc" }] });
}

export default async function MonthlyExpensesPage() {
  const expenses = await getExpenses();

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Meses de despesas</h2>
        <p className="mt-2 text-sm text-slate-600">Crie um novo mês e gere automaticamente a lista com base no mês anterior ou nos itens recorrentes.</p>
        <form action={async (formData: FormData) => {
          'use server';
          const month = Number(formData.get('month') || new Date().getMonth() + 1);
          const year = Number(formData.get('year') || new Date().getFullYear());
          await createMonthlyExpense(month, year);
        }} className="mt-4 grid gap-3 md:grid-cols-3">
          <input name="month" type="number" min="1" max="12" defaultValue={new Date().getMonth() + 1} className="rounded-xl border border-slate-300 px-3 py-2" />
          <input name="year" type="number" defaultValue={new Date().getFullYear()} className="rounded-xl border border-slate-300 px-3 py-2" />
          <button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Criar mês</button>
        </form>
      </div>

      <div className="grid gap-4">
        {expenses.map((expense) => (
          <Link key={expense.id} href={`/monthly-expenses/${expense.id}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">{expense.month}/{expense.year}</h3>
                <p className="text-sm text-slate-500">Estado: {expense.status}</p>
              </div>
              <p className="text-sm font-semibold text-slate-700">{expense.totalAmount.toFixed(2)} MT</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
