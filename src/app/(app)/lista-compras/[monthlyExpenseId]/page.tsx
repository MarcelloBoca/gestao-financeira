import { prisma } from "@/lib/prisma";
import { Fragment } from "react";
import { PrintActions } from "./print-actions";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-MZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value) + " MT";
}

export default async function ShoppingListPage({ params }: { params: Promise<{ monthlyExpenseId: string }> }) {
  const { monthlyExpenseId } = await params;
  const expense = await prisma.monthlyExpense.findUnique({
    where: { id: monthlyExpenseId },
    include: { monthlyExpenseLines: true },
  });

  if (!expense) {
    return <div className="p-6 text-slate-700">Mês não encontrado.</div>;
  }

  const lines = expense.monthlyExpenseLines.filter((line) => line.status !== "removed");
  const grouped = lines.reduce<Record<string, typeof lines>>((acc, line) => {
    const category = line.categoryNameSnapshot || "GERAL";
    acc[category] = acc[category] || [];
    acc[category].push(line);
    return acc;
  }, {});

  const summaryRows = Object.entries(grouped).map(([category, categoryLines]) => ({
    category,
    subtotal: categoryLines.reduce((sum, line) => sum + line.totalPrice, 0),
  }));
  const totalEstimated = summaryRows.reduce((sum, row) => sum + row.subtotal, 0);
  const saldoPrevisto = 0 - totalEstimated;

  return (
    <div className="min-h-screen bg-slate-100 p-4 text-slate-900 print:bg-white print:p-0">
      <div className="mx-auto max-w-7xl rounded-2xl bg-white p-4 shadow-sm print:shadow-none print:rounded-none">
        <PrintActions backHref={`/monthly-expenses/${monthlyExpenseId}`} />

        <div className="rounded-2xl border border-slate-200 p-6 print:p-0">
          <h1 className="text-center text-2xl font-bold uppercase tracking-wide text-slate-900">LISTA DE COMPRAS MENSAL</h1>
          <p className="mt-3 text-center text-sm text-slate-600">Relatório mensal organizado por categorias, com quantidades, preços, subtotais e controlo de confirmação.</p>

          <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="bg-emerald-800 text-white">
                  <th className="border border-emerald-700 px-3 py-2 text-left">MÊS</th>
                  <th className="border border-emerald-700 px-3 py-2 text-left">RESPONSÁVEL</th>
                  <th className="border border-emerald-700 px-3 py-2 text-left">ORÇAMENTO PREVISTO</th>
                  <th className="border border-emerald-700 px-3 py-2 text-left">TOTAL ESTIMADO</th>
                  <th className="border border-emerald-700 px-3 py-2 text-left">SALDO PREVISTO</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-slate-50">
                  <td className="border border-slate-200 px-3 py-2">{expense.month}/{expense.year}</td>
                  <td className="border border-slate-200 px-3 py-2">______________</td>
                  <td className="border border-slate-200 px-3 py-2">Não definido</td>
                  <td className="border border-slate-200 px-3 py-2 font-semibold">{formatCurrency(totalEstimated)}</td>
                  <td className="border border-slate-200 px-3 py-2">{formatCurrency(saldoPrevisto)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="bg-emerald-800 text-white">
                  <th className="border border-emerald-700 px-3 py-2 text-left">Nº</th>
                  <th className="border border-emerald-700 px-3 py-2 text-left">ITEM / PRODUTO</th>
                  <th className="border border-emerald-700 px-3 py-2 text-left">UNIDADE</th>
                  <th className="border border-emerald-700 px-3 py-2 text-center">QTD.</th>
                  <th className="border border-emerald-700 px-3 py-2 text-right">PREÇO UNIT.</th>
                  <th className="border border-emerald-700 px-3 py-2 text-right">TOTAL</th>
                  <th className="border border-emerald-700 px-3 py-2 text-left">ESTADO</th>
                  <th className="border border-emerald-700 px-3 py-2 text-center">OK</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(grouped).map(([category, categoryLines], categoryIndex) => {
                  const categorySubtotal = categoryLines.reduce((sum, line) => sum + line.totalPrice, 0);
                  let rowNumber = 1;

                  return (
                    <Fragment key={`${category}-header`}>
                      <tr className="bg-emerald-700 text-white">
                        <td colSpan={8} className="border border-emerald-700 px-3 py-2 font-semibold uppercase">
                          <div className="flex items-center justify-between gap-3">
                            <span>{category.toUpperCase()}</span>
                            <span>Subtotal: {formatCurrency(categorySubtotal)}</span>
                          </div>
                        </td>
                      </tr>
                      {categoryLines.map((line, index) => (
                        <tr key={line.id} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                          <td className="border border-slate-200 px-3 py-2">{categoryIndex + 1}.{rowNumber++}</td>
                          <td className="border border-slate-200 px-3 py-2">{line.itemNameSnapshot}</td>
                          <td className="border border-slate-200 px-3 py-2">unid.</td>
                          <td className="border border-slate-200 px-3 py-2 text-center">{line.quantity}</td>
                          <td className="border border-slate-200 px-3 py-2 text-right">{formatCurrency(line.unitPrice)}</td>
                          <td className="border border-slate-200 px-3 py-2 text-right">{formatCurrency(line.totalPrice)}</td>
                          <td className="border border-slate-200 px-3 py-2">{line.status === "confirmed" ? "Confirmar" : line.status === "removed" ? "Removido" : "Pendente"}</td>
                          <td className="border border-slate-200 px-3 py-2 text-center">[ ]</td>
                        </tr>
                      ))}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4 text-sm text-slate-600">
            <span>Relatório gerado automaticamente pela aplicação de Gestão Financeira</span>
            <span>Gerado em: {new Date().toLocaleString("pt-PT")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
