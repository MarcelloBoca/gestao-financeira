"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { financialAdvisorService } from "./financial-advisor";

export async function createCategory(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const active = formData.get("active") === "on";

  if (!name) throw new Error("Nome é obrigatório");

  const user = await prisma.user.findFirst();
  if (!user) {
    const createdUser = await prisma.user.create({ data: { name: "Utilizador", email: "user@example.com" } });
    await prisma.category.create({ data: { userId: createdUser.id, name, description, active } });
  } else {
    await prisma.category.create({ data: { userId: user.id, name, description, active } });
  }

  revalidatePath("/categories");
}

export async function createItem(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const categoryId = String(formData.get("categoryId") || "").trim();
  const unit = String(formData.get("unit") || "").trim();
  const defaultQuantity = Number(formData.get("defaultQuantity") || 1);
  const defaultPrice = Number(formData.get("defaultPrice") || 0);
  const recurring = formData.get("recurring") === "on";
  const active = formData.get("active") === "on";

  if (!name || !categoryId) throw new Error("Nome e categoria são obrigatórios");

  const user = await prisma.user.findFirst();
  if (!user) {
    const createdUser = await prisma.user.create({ data: { name: "Utilizador", email: "user@example.com" } });
    await prisma.expenseItem.create({ data: { userId: createdUser.id, categoryId, name, unit, defaultQuantity, defaultPrice, recurring, active } });
  } else {
    await prisma.expenseItem.create({ data: { userId: user.id, categoryId, name, unit, defaultQuantity, defaultPrice, recurring, active } });
  }

  revalidatePath("/items");
}

export async function createMonthlyExpense(month: number, year: number) {
  const user = await prisma.user.findFirst();
  if (!user) {
    throw new Error("Utilizador não encontrado");
  }

  const previousMonth = await prisma.monthlyExpense.findFirst({
    where: { userId: user.id, month: month === 1 ? 12 : month - 1, year: month === 1 ? year - 1 : year },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  const categories = await prisma.category.findMany({ where: { userId: user.id, active: true } });
  const items = await prisma.expenseItem.findMany({ where: { userId: user.id, active: true } });

  const expense = await prisma.monthlyExpense.create({ data: { userId: user.id, month, year, status: "draft", totalAmount: 0 } });

  const lines = [] as any[];
  const sourceLines = previousMonth?.monthlyExpenseLines ?? [];

  if (sourceLines.length > 0) {
    for (const line of sourceLines) {
      lines.push({
        monthlyExpenseId: expense.id,
        categoryId: line.categoryId,
        expenseItemId: line.expenseItemId,
        itemNameSnapshot: line.itemNameSnapshot,
        categoryNameSnapshot: line.categoryNameSnapshot,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        totalPrice: line.totalPrice,
        previousUnitPrice: line.unitPrice,
        priceDifference: 0,
        priceDifferencePercent: 0,
        status: "pending",
        note: line.note,
      });
    }
  } else {
    for (const item of items) {
      const category = categories.find((entry) => entry.id === item.categoryId);
      if (item.recurring) {
        lines.push({
          monthlyExpenseId: expense.id,
          categoryId: item.categoryId,
          expenseItemId: item.id,
          itemNameSnapshot: item.name,
          categoryNameSnapshot: category?.name || "Outros",
          quantity: item.defaultQuantity,
          unitPrice: item.defaultPrice,
          totalPrice: item.defaultQuantity * item.defaultPrice,
          previousUnitPrice: item.defaultPrice,
          priceDifference: 0,
          priceDifferencePercent: 0,
          status: "pending",
        });
      }
    }
  }

  if (lines.length > 0) {
    await prisma.monthlyExpenseLine.createMany({ data: lines });
  }

  const createdExpense = await prisma.monthlyExpense.findUnique({ where: { id: expense.id }, include: { monthlyExpenseLines: true } });
  const advice = financialAdvisorService(createdExpense?.monthlyExpenseLines || []);
  await prisma.financialAnalysis.create({
    data: {
      monthlyExpenseId: expense.id,
      summary: advice.summary,
      alertsJson: JSON.stringify(advice.alerts),
      recommendationsJson: JSON.stringify(advice.recommendations),
      risksJson: JSON.stringify(advice.risks),
      opportunitiesJson: JSON.stringify(advice.opportunities),
      criticalCategoriesJson: JSON.stringify(advice.criticalCategories),
      criticalItemsJson: JSON.stringify(advice.criticalItems),
    },
  });

  revalidatePath("/monthly-expenses");
  revalidatePath("/advisor");
  return expense.id;
}

export async function updateLine(id: string, data: { quantity?: number; unitPrice?: number; status?: string; note?: string }) {
  const line = await prisma.monthlyExpenseLine.findUnique({ where: { id } });
  if (!line) return;

  const updated = await prisma.monthlyExpenseLine.update({
    where: { id },
    data: {
      ...data,
      totalPrice: (data.quantity ?? line.quantity) * (data.unitPrice ?? line.unitPrice),
    },
  });

  const parentExpense = await prisma.monthlyExpense.findUnique({ where: { id: line.monthlyExpenseId }, include: { monthlyExpenseLines: true } });
  const totalAmount = parentExpense?.monthlyExpenseLines.reduce((sum, entry) => sum + (entry.status === "confirmed" ? entry.totalPrice : 0), 0) || 0;
  await prisma.monthlyExpense.update({ where: { id: line.monthlyExpenseId }, data: { totalAmount } });

  revalidatePath("/monthly-expenses");
  revalidatePath("/dashboard");
  revalidatePath("/compare");
  revalidatePath("/advisor");
  return updated;
}

export async function deleteCategory(id: string) {
  await prisma.category.delete({ where: { id } });
  revalidatePath("/categories");
}

export async function deleteItem(id: string) {
  await prisma.expenseItem.delete({ where: { id } });
  revalidatePath("/items");
}

export async function getDashboardData() {
  const user = await prisma.user.findFirst();
  if (!user) return null;

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  const currentExpense = await prisma.monthlyExpense.findFirst({
    where: { userId: user.id, month: currentMonth, year: currentYear },
    include: { monthlyExpenseLines: true },
  });
  const previousExpense = await prisma.monthlyExpense.findFirst({
    where: { userId: user.id, month: previousMonth, year: previousYear },
    include: { monthlyExpenseLines: true },
  });

  const currentTotal = currentExpense?.monthlyExpenseLines.filter((line) => line.status === "confirmed").reduce((sum, line) => sum + line.totalPrice, 0) || 0;
  const previousTotal = previousExpense?.monthlyExpenseLines.filter((line) => line.status === "confirmed").reduce((sum, line) => sum + line.totalPrice, 0) || 0;
  const difference = currentTotal - previousTotal;
  const percent = previousTotal > 0 ? (difference / previousTotal) * 100 : 0;

  return { currentTotal, previousTotal, difference, percent, currentExpense, previousExpense };
}

export async function getCompareData(monthA: string, monthB: string) {
  const user = await prisma.user.findFirst();
  if (!user) return { monthA: null, monthB: null };

  const [yearA, monthNumA] = monthA.split("-").map(Number);
  const [yearB, monthNumB] = monthB.split("-").map(Number);

  const monthAExpense = await prisma.monthlyExpense.findFirst({ where: { userId: user.id, year: yearA, month: monthNumA }, include: { monthlyExpenseLines: true } });
  const monthBExpense = await prisma.monthlyExpense.findFirst({ where: { userId: user.id, year: yearB, month: monthNumB }, include: { monthlyExpenseLines: true } });

  return { monthA: monthAExpense, monthB: monthBExpense };
}
