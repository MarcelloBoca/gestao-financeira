import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildExpensePdfBuffer } from "@/lib/pdf-export";
import { formatCurrency } from "@/lib/finance-utils";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const expense = await prisma.monthlyExpense.findUnique({
    where: { id },
    include: { monthlyExpenseLines: true },
  });

  if (!expense) {
    return new NextResponse("Mês não encontrado", { status: 404 });
  }

  const user = await prisma.user.findFirst();
  const lines = expense.monthlyExpenseLines.filter((line) => line.status === "confirmed");
  const totalAmount = lines.reduce((sum, line) => sum + line.totalPrice, 0) || 0;
  const summaryLines = [
    `Total estimado: ${formatCurrency(totalAmount)}`,
  ];
  const itemLines = lines.map((line) => `${line.categoryNameSnapshot || "GERAL"} | ${line.itemNameSnapshot} | unid. | ${line.quantity} | ${formatCurrency(line.unitPrice)} | ${formatCurrency(line.totalPrice)} | Confirmar | [ ]`);
  const categoryTotals = lines.reduce<Record<string, number>>((acc, line) => {
    acc[line.categoryNameSnapshot || "GERAL"] = (acc[line.categoryNameSnapshot || "GERAL"] || 0) + line.totalPrice;
    return acc;
  }, {});
  const categoryLines = Object.entries(categoryTotals).map(([category, total]) => `${category.toUpperCase()}: ${formatCurrency(total)}`);

  const pdfBuffer = buildExpensePdfBuffer({
    month: expense.month,
    year: expense.year,
    title: "LISTA DE COMPRAS MENSAL",
    responsible: user?.name || "Não definido",
    budget: null,
    summaryLines,
    categoryLines,
    itemLines,
  });

  const monthName = new Date(expense.year, expense.month - 1, 1)
    .toLocaleString("pt-PT", { month: "long" })
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="lista-de-compras-${monthName}-${expense.year}.pdf"`,
    },
  });
}
