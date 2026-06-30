import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/actions";
import { buildExpensePdfBuffer } from "@/lib/pdf-export";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/finance-utils";

export async function GET() {
  const data = await getDashboardData();

  if (!data?.currentExpense) {
    return new NextResponse("Nenhum mês atual encontrado", { status: 404 });
  }

  const user = await prisma.user.findFirst();
  const lines = data.currentExpense.monthlyExpenseLines.filter((line) => line.status === "confirmed");
  const summaryLines = [
    `Total estimado: ${formatCurrency(data.currentTotal)}`,
  ];
  const itemLines = lines.map((line) => `${line.categoryNameSnapshot || "GERAL"} | ${line.itemNameSnapshot} | unid. | ${line.quantity} | ${formatCurrency(line.unitPrice)} | ${formatCurrency(line.totalPrice)} | Confirmar | [ ]`);
  const categoryTotals = lines.reduce<Record<string, number>>((acc, line) => {
    acc[line.categoryNameSnapshot || "GERAL"] = (acc[line.categoryNameSnapshot || "GERAL"] || 0) + line.totalPrice;
    return acc;
  }, {});
  const categoryLines = Object.entries(categoryTotals).map(([category, total]) => `${category.toUpperCase()}: ${formatCurrency(total)}`);

  const pdfBuffer = buildExpensePdfBuffer({
    month: data.currentExpense.month,
    year: data.currentExpense.year,
    title: "LISTA DE COMPRAS MENSAL",
    responsible: user?.name || "Não definido",
    budget: null,
    summaryLines,
    categoryLines,
    itemLines,
  });

  const monthName = new Date(data.currentExpense.year, data.currentExpense.month - 1, 1)
    .toLocaleString("pt-PT", { month: "long" })
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="lista-de-compras-${monthName}-${data.currentExpense.year}.pdf"`,
    },
  });
}
